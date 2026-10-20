import { delay, http as rest, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { server } from '@/mocks/node.js'
import { ApiError, ErrorCode } from './errors.js'
import { createHttpClient } from './http.js'

const BASE = 'http://localhost/test-api'

/** @param {Partial<Parameters<typeof createHttpClient>[0]>} overrides */
function client(overrides = {}) {
  return createHttpClient({ baseUrl: BASE, retryDelayMs: 1, timeoutMs: 500, ...overrides })
}

describe('createHttpClient', () => {
  it('sends JSON, encodes query params and drops empty ones', async () => {
    /** @type {URL | undefined} */
    let seenUrl
    /** @type {unknown} */
    let seenBody
    server.use(
      rest.post(`${BASE}/items`, async ({ request }) => {
        seenUrl = new URL(request.url)
        seenBody = await request.json()
        return HttpResponse.json({ ok: true }, { status: 201 })
      }),
    )
    const result = await client().post(
      '/items',
      { name: 'A&B' },
      { query: { q: 'a b&c', page: 2, empty: '', none: null } },
    )
    expect(result).toEqual({ ok: true })
    expect(seenUrl?.search).toBe('?q=a+b%26c&page=2')
    expect(seenBody).toEqual({ name: 'A&B' })
  })

  it('returns undefined for 204 responses', async () => {
    server.use(rest.delete(`${BASE}/items/1`, () => new HttpResponse(null, { status: 204 })))
    await expect(client().delete('/items/1')).resolves.toBeUndefined()
  })

  it('maps error bodies to a typed ApiError with code and details', async () => {
    server.use(
      rest.post(`${BASE}/users`, () =>
        HttpResponse.json(
          {
            error: {
              code: 'validation_failed',
              message: 'x',
              details: { fieldErrors: { email: 'taken' } },
            },
          },
          { status: 422 },
        ),
      ),
    )
    const error = await client()
      .post('/users', {})
      .catch((caught) => caught)
    expect(error).toBeInstanceOf(ApiError)
    expect(error.code).toBe(ErrorCode.VALIDATION)
    expect(error.fieldErrors).toEqual({ email: 'taken' })
  })

  it('derives a code from the status when the body is not JSON', async () => {
    server.use(
      rest.get(`${BASE}/gone`, () => new HttpResponse('<h1>Not found</h1>', { status: 404 })),
    )
    await expect(client().get('/gone')).rejects.toMatchObject({
      code: ErrorCode.NOT_FOUND,
      status: 404,
    })
  })

  it('attaches the bearer token unless skipAuth is set', async () => {
    /** @type {Array<string | null>} */
    const seen = []
    server.use(
      rest.get(`${BASE}/me`, ({ request }) => {
        seen.push(request.headers.get('Authorization'))
        return HttpResponse.json({})
      }),
    )
    const api = client({ getAccessToken: () => 'abc' })
    await api.get('/me')
    await api.get('/me', { skipAuth: true })
    expect(seen).toEqual(['Bearer abc', null])
  })

  it('refreshes once on 401 and retries with the new token', async () => {
    let token = 'old'
    server.use(
      rest.get(`${BASE}/data`, ({ request }) =>
        request.headers.get('Authorization') === 'Bearer new'
          ? HttpResponse.json({ value: 1 })
          : HttpResponse.json({ error: { code: 'unauthorized' } }, { status: 401 }),
      ),
    )
    const refreshAccessToken = vi.fn(async () => {
      token = 'new'
    })
    const api = client({ getAccessToken: () => token, refreshAccessToken })
    await expect(api.get('/data')).resolves.toEqual({ value: 1 })
    expect(refreshAccessToken).toHaveBeenCalledTimes(1)
  })

  it('shares one refresh between concurrent 401s', async () => {
    let token = 'old'
    server.use(
      rest.get(`${BASE}/data/:n`, ({ request, params }) =>
        request.headers.get('Authorization') === 'Bearer new'
          ? HttpResponse.json({ n: params.n })
          : HttpResponse.json({}, { status: 401 }),
      ),
    )
    const refreshAccessToken = vi.fn(async () => {
      await delay(20)
      token = 'new'
    })
    const api = client({ getAccessToken: () => token, refreshAccessToken })
    const results = await Promise.all([api.get('/data/1'), api.get('/data/2'), api.get('/data/3')])
    expect(results).toEqual([{ n: '1' }, { n: '2' }, { n: '3' }])
    expect(refreshAccessToken).toHaveBeenCalledTimes(1)
  })

  it('rejects (never resolves undefined) and notifies when the refresh fails', async () => {
    server.use(rest.get(`${BASE}/data`, () => HttpResponse.json({}, { status: 401 })))
    const onAuthFailure = vi.fn()
    const api = client({
      refreshAccessToken: () => Promise.reject(new Error('refresh failed')),
      onAuthFailure,
    })
    await expect(api.get('/data')).rejects.toMatchObject({
      code: ErrorCode.UNAUTHORIZED,
      status: 401,
    })
    expect(onAuthFailure).toHaveBeenCalledTimes(1)
  })

  it('does not loop when the retried request is still unauthorized', async () => {
    const handler = vi.fn(() => HttpResponse.json({}, { status: 401 }))
    server.use(rest.get(`${BASE}/data`, handler))
    const api = client({ refreshAccessToken: async () => {} })
    await expect(api.get('/data')).rejects.toMatchObject({ code: ErrorCode.UNAUTHORIZED })
    expect(handler).toHaveBeenCalledTimes(2)
  })

  it('retries GET on 5xx with backoff, then succeeds', async () => {
    const handler = vi
      .fn()
      .mockReturnValueOnce(HttpResponse.json({}, { status: 503 }))
      .mockReturnValueOnce(HttpResponse.error())
      .mockReturnValue(HttpResponse.json({ ok: true }))
    server.use(rest.get(`${BASE}/flaky`, handler))
    await expect(client().get('/flaky')).resolves.toEqual({ ok: true })
    expect(handler).toHaveBeenCalledTimes(3)
  })

  it('never retries non-idempotent requests', async () => {
    const handler = vi.fn(() => HttpResponse.json({}, { status: 503 }))
    server.use(rest.post(`${BASE}/orders`, handler))
    await expect(client().post('/orders', {})).rejects.toMatchObject({ code: ErrorCode.SERVER })
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('reports network failures with the network code', async () => {
    server.use(rest.get(`${BASE}/offline`, () => HttpResponse.error()))
    await expect(client({ retries: 0 }).get('/offline')).rejects.toMatchObject({
      code: ErrorCode.NETWORK,
    })
  })

  it('times out slow requests', async () => {
    server.use(
      rest.get(`${BASE}/slow`, async () => {
        await delay(200)
        return HttpResponse.json({})
      }),
    )
    await expect(client({ timeoutMs: 50, retries: 0 }).get('/slow')).rejects.toMatchObject({
      code: ErrorCode.TIMEOUT,
    })
  })

  it('reports caller cancellation as aborted and stops retrying', async () => {
    server.use(
      rest.get(`${BASE}/slow`, async () => {
        await delay(200)
        return HttpResponse.json({})
      }),
    )
    const controller = new AbortController()
    const request = client().get('/slow', { signal: controller.signal })
    controller.abort()
    await expect(request).rejects.toMatchObject({ code: ErrorCode.ABORTED })
  })
})
