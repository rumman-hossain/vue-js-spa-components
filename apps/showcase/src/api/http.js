import { ApiError, ErrorCode } from './errors.js'

/**
 * @typedef {{
 *   method?: string,
 *   query?: Record<string, string | number | boolean | null | undefined>,
 *   body?: unknown,
 *   headers?: Record<string, string>,
 *   signal?: AbortSignal,
 *   timeoutMs?: number,
 *   retries?: number,
 *   skipAuth?: boolean,
 * }} RequestOptions
 */

const IDEMPOTENT = new Set(['GET', 'HEAD', 'OPTIONS'])

/** @param {number} ms @param {AbortSignal} [signal] */
function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        reject(signal.reason)
      },
      { once: true },
    )
  })
}

/**
 * fetch-based HTTP client.
 *
 * - Base URL and timeout come from validated env config, never from source code.
 * - The access token lives in memory only (see `session.js`); the refresh token is an httpOnly
 *   cookie the browser sends automatically, so JavaScript can never read it.
 * - On 401 it refreshes once and retries. Concurrent 401s share one refresh request.
 * - If the refresh fails, the request REJECTS (never resolves to undefined) and `onAuthFailure` runs.
 * - Only idempotent requests are retried on network errors and 5xx, with exponential backoff.
 *
 * @param {{
 *   baseUrl: string,
 *   timeoutMs?: number,
 *   retries?: number,
 *   retryDelayMs?: number,
 *   getAccessToken?: () => string | null,
 *   refreshAccessToken?: () => Promise<void>,
 *   onAuthFailure?: () => void,
 *   fetch?: typeof fetch,
 * }} config
 */
export function createHttpClient(config) {
  const {
    baseUrl,
    timeoutMs = 10_000,
    retries = 2,
    retryDelayMs = 300,
    getAccessToken = () => null,
    refreshAccessToken,
    onAuthFailure = () => {},
  } = config
  const fetchImpl = config.fetch ?? ((...args) => globalThis.fetch(...args))

  /** @type {Promise<void> | null} */
  let refreshing = null

  /** Single-flight: every 401 that arrives while a refresh is running waits for the same one. */
  function refreshOnce() {
    if (!refreshAccessToken)
      return Promise.reject(new ApiError({ status: 401, code: ErrorCode.UNAUTHORIZED }))
    refreshing ??= refreshAccessToken().finally(() => {
      refreshing = null
    })
    return refreshing
  }

  /**
   * @param {string} path
   * @param {RequestOptions['query']} query
   */
  function buildUrl(path, query) {
    const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
    if (!query) return url
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') params.set(key, String(value))
    }
    const search = params.toString()
    return search ? `${url}?${search}` : url
  }

  /**
   * One network attempt, mapping every failure to an ApiError.
   * @param {string} url
   * @param {RequestOptions & { method: string }} options
   */
  async function attempt(url, options) {
    const timeout = AbortSignal.timeout(options.timeoutMs ?? timeoutMs)
    const signal = options.signal ? AbortSignal.any([options.signal, timeout]) : timeout

    /** @type {Record<string, string>} */
    const headers = { Accept: 'application/json', ...options.headers }
    /** @type {BodyInit | undefined} */
    let body
    if (options.body instanceof FormData) {
      body = options.body
    } else if (options.body !== undefined) {
      headers['Content-Type'] = 'application/json'
      body = JSON.stringify(options.body)
    }
    const token = options.skipAuth ? null : getAccessToken()
    if (token) headers.Authorization = `Bearer ${token}`

    /** @type {Response} */
    let response
    try {
      response = await fetchImpl(url, {
        method: options.method,
        headers,
        body,
        signal,
        credentials: 'include',
      })
    } catch (cause) {
      if (options.signal?.aborted) {
        throw new ApiError({ code: ErrorCode.ABORTED, message: 'Request was cancelled', cause })
      }
      if (timeout.aborted) {
        throw new ApiError({ code: ErrorCode.TIMEOUT, message: 'Request timed out', cause })
      }
      throw new ApiError({ code: ErrorCode.NETWORK, message: 'Network request failed', cause })
    }

    if (!response.ok) throw await ApiError.fromResponse(response)
    if (response.status === 204) return undefined

    const type = response.headers.get('Content-Type') ?? ''
    return type.includes('application/json') ? response.json() : response.text()
  }

  /**
   * @template T
   * @param {string} path
   * @param {RequestOptions} [options]
   * @returns {Promise<T>}
   */
  async function request(path, options = {}) {
    const method = (options.method ?? 'GET').toUpperCase()
    const url = buildUrl(path, options.query)
    const maxRetries = IDEMPOTENT.has(method) ? (options.retries ?? retries) : 0
    let refreshed = false

    for (let attemptNumber = 0; ; attemptNumber += 1) {
      try {
        return await attempt(url, { ...options, method })
      } catch (error) {
        if (!(error instanceof ApiError)) throw error

        if (error.status === 401 && !options.skipAuth && !refreshed) {
          refreshed = true
          try {
            await refreshOnce()
          } catch (refreshError) {
            onAuthFailure()
            throw new ApiError({
              status: 401,
              code: ErrorCode.UNAUTHORIZED,
              message: 'Your session has expired',
              cause: refreshError,
            })
          }
          attemptNumber -= 1 // the retry after a refresh does not count against the retry budget
          continue
        }

        if (error.isRetryable && attemptNumber < maxRetries) {
          const backoff = retryDelayMs * 2 ** attemptNumber
          await sleep(backoff + Math.random() * backoff * 0.2, options.signal)
          continue
        }
        throw error
      }
    }
  }

  return {
    request,
    /** @template T @param {string} path @param {RequestOptions} [options] */
    get: (path, options) =>
      /** @type {Promise<T>} */ (request(path, { ...options, method: 'GET' })),
    /** @template T @param {string} path @param {unknown} [body] @param {RequestOptions} [options] */
    post: (path, body, options) =>
      /** @type {Promise<T>} */ (request(path, { ...options, method: 'POST', body })),
    /** @template T @param {string} path @param {unknown} [body] @param {RequestOptions} [options] */
    put: (path, body, options) =>
      /** @type {Promise<T>} */ (request(path, { ...options, method: 'PUT', body })),
    /** @template T @param {string} path @param {unknown} [body] @param {RequestOptions} [options] */
    patch: (path, body, options) =>
      /** @type {Promise<T>} */ (request(path, { ...options, method: 'PATCH', body })),
    /** @template T @param {string} path @param {RequestOptions} [options] */
    delete: (path, options) =>
      /** @type {Promise<T>} */ (request(path, { ...options, method: 'DELETE' })),
  }
}
