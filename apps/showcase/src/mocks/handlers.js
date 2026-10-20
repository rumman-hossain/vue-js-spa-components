import { delay, http, HttpResponse } from 'msw'
import { env } from '@/config/env.js'
import { db, PASSWORD, setRefreshSession } from './db.js'
import { lab } from './lab.js'

/** @typedef {import('@/api/users.js').User} User */

const api = (/** @type {string} */ path) => `${env.apiBaseUrl}${path}`
const MAX_FAILED_SIGN_INS = 5

/**
 * @param {number} status
 * @param {string} code
 * @param {string} message
 * @param {Record<string, unknown>} [details]
 */
function fail(status, code, message, details) {
  return HttpResponse.json({ error: { code, message, details } }, { status })
}

/** @param {string} userId */
function issueToken(userId) {
  db.tokenCounter += 1
  const token = `mock-access-${db.tokenCounter}`
  db.tokens.set(token, userId)
  return token
}

/** @param {Request} request @returns {User | null} */
function authenticate(request) {
  const token = request.headers.get('Authorization')?.replace(/^Bearer /, '')
  const userId = token ? db.tokens.get(token) : undefined
  return userId ? (db.users.find((user) => user.id === userId) ?? null) : null
}

/** @param {User} user */
function toSessionUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role }
}

/**
 * @param {unknown} body
 * @param {string} [excludeId]
 * @returns {{ input: Omit<User, 'id' | 'createdAt'> } | { fieldErrors: Record<string, string> }}
 */
function validateUserInput(body, excludeId) {
  const input = /** @type {Record<string, any>} */ (body ?? {})
  /** Field error values are stable codes (required | invalid | taken), never display text. */
  /** @type {Record<string, string>} */
  const fieldErrors = {}
  const email = String(input.email ?? '')
    .trim()
    .toLowerCase()
  if (!String(input.name ?? '').trim()) fieldErrors.name = 'required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fieldErrors.email = 'invalid'
  else if (db.users.some((user) => user.email === email && user.id !== excludeId)) {
    fieldErrors.email = 'taken'
  }
  if (!['admin', 'viewer'].includes(input.role)) fieldErrors.role = 'invalid'
  if (!['active', 'invited', 'suspended'].includes(input.status)) fieldErrors.status = 'invalid'
  if (!Number.isInteger(input.monthlyQuota) || input.monthlyQuota < 0) {
    fieldErrors.monthlyQuota = 'invalid'
  }
  if (Object.keys(fieldErrors).length) return { fieldErrors }
  return {
    input: {
      name: String(input.name).trim(),
      email,
      role: input.role,
      status: input.status,
      monthlyQuota: input.monthlyQuota,
    },
  }
}

export const handlers = [
  // Runs first for every API call: realistic latency plus faults injected from the Error lab.
  http.all(api('/*'), async () => {
    if (env.appEnv !== 'test') await delay(120 + Math.random() * 280)
    if (lab.nextDelayMs) {
      const ms = lab.nextDelayMs
      lab.nextDelayMs = 0
      await delay(ms)
    }
    if (lab.offline) return HttpResponse.error()
    if (lab.nextFailure) {
      const { status, code, message } = lab.nextFailure
      lab.nextFailure = null
      return fail(status, code, message)
    }
    return undefined // continue to the matching handler
  }),

  http.post(api('/auth/sign-in'), async ({ request }) => {
    const { email = '', password = '' } = /** @type {{ email?: string, password?: string }} */ (
      await request.json()
    )
    const key = email.trim().toLowerCase()
    const failures = db.failedSignIns.get(key) ?? 0
    if (failures >= MAX_FAILED_SIGN_INS) {
      return fail(429, 'rate_limited', 'Too many attempts.', { retryAfter: 30 })
    }
    const user = db.users.find((candidate) => candidate.email === key)
    if (!user || password !== PASSWORD) {
      db.failedSignIns.set(key, failures + 1)
      return fail(401, 'invalid_credentials', 'Email or password is incorrect.')
    }
    if (user.status === 'suspended') return fail(403, 'account_suspended', 'Account is suspended.')
    db.failedSignIns.delete(key)
    setRefreshSession(user.id)
    return HttpResponse.json({ accessToken: issueToken(user.id), user: toSessionUser(user) })
  }),

  http.post(api('/auth/refresh'), () => {
    if (!db.refreshSession) return fail(401, 'session_expired', 'Please sign in again.')
    return HttpResponse.json({ accessToken: issueToken(db.refreshSession) })
  }),

  http.post(api('/auth/sign-out'), () => {
    setRefreshSession(null)
    db.tokens.clear()
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(api('/auth/me'), ({ request }) => {
    const user = authenticate(request)
    return user
      ? HttpResponse.json(toSessionUser(user))
      : fail(401, 'unauthorized', 'Sign in required.')
  }),

  http.get(api('/users/email-availability'), ({ request }) => {
    if (!authenticate(request)) return fail(401, 'unauthorized', 'Sign in required.')
    const url = new URL(request.url)
    const email = (url.searchParams.get('email') ?? '').trim().toLowerCase()
    const excludeId = url.searchParams.get('excludeId')
    const taken = db.users.some((user) => user.email === email && user.id !== excludeId)
    return HttpResponse.json({ available: !taken })
  }),

  http.get(api('/users'), ({ request }) => {
    if (!authenticate(request)) return fail(401, 'unauthorized', 'Sign in required.')
    const url = new URL(request.url)
    const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
    const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get('pageSize')) || 10))
    const search = (url.searchParams.get('search') ?? '').trim().toLowerCase()
    const sort = /** @type {keyof User} */ (url.searchParams.get('sort') ?? 'createdAt')
    const order = url.searchParams.get('order') === 'asc' ? 1 : -1

    const matches = db.users
      .filter((user) => !search || `${user.name} ${user.email}`.toLowerCase().includes(search))
      .sort((a, b) => (a[sort] > b[sort] ? order : a[sort] < b[sort] ? -order : 0))
    const items = matches.slice((page - 1) * pageSize, page * pageSize)
    return HttpResponse.json({ items, total: matches.length, page, pageSize })
  }),

  http.get(api('/users/:id'), ({ request, params }) => {
    if (!authenticate(request)) return fail(401, 'unauthorized', 'Sign in required.')
    const user = db.users.find((candidate) => candidate.id === params.id)
    return user ? HttpResponse.json(user) : fail(404, 'not_found', 'User not found.')
  }),

  http.post(api('/users'), async ({ request }) => {
    const actor = authenticate(request)
    if (!actor) return fail(401, 'unauthorized', 'Sign in required.')
    if (actor.role !== 'admin') return fail(403, 'forbidden', 'Only admins can add users.')
    const result = validateUserInput(await request.json())
    if ('fieldErrors' in result) {
      return fail(422, 'validation_failed', 'Some fields are invalid.', {
        fieldErrors: result.fieldErrors,
      })
    }
    /** @type {User} */
    const user = {
      id: `u_${crypto.randomUUID().slice(0, 8)}`,
      createdAt: new Date().toISOString(),
      ...result.input,
    }
    db.users.unshift(user)
    return HttpResponse.json(user, { status: 201 })
  }),

  http.put(api('/users/:id'), async ({ request, params }) => {
    const actor = authenticate(request)
    if (!actor) return fail(401, 'unauthorized', 'Sign in required.')
    if (actor.role !== 'admin') return fail(403, 'forbidden', 'Only admins can edit users.')
    const index = db.users.findIndex((user) => user.id === params.id)
    if (index === -1) return fail(404, 'not_found', 'User not found.')
    const result = validateUserInput(await request.json(), String(params.id))
    if ('fieldErrors' in result) {
      return fail(422, 'validation_failed', 'Some fields are invalid.', {
        fieldErrors: result.fieldErrors,
      })
    }
    db.users[index] = { ...db.users[index], ...result.input }
    return HttpResponse.json(db.users[index])
  }),

  http.delete(api('/users/:id'), ({ request, params }) => {
    const actor = authenticate(request)
    if (!actor) return fail(401, 'unauthorized', 'Sign in required.')
    if (actor.role !== 'admin') return fail(403, 'forbidden', 'Only admins can delete users.')
    if (params.id === actor.id) return fail(409, 'conflict', 'You cannot delete your own account.')
    const index = db.users.findIndex((user) => user.id === params.id)
    if (index === -1) return fail(404, 'not_found', 'User not found.')
    db.users.splice(index, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(api('/metrics/summary'), ({ request }) => {
    if (!authenticate(request)) return fail(401, 'unauthorized', 'Sign in required.')
    db.metricsTick += 1
    const wave = Math.sin(db.metricsTick / 3)
    return HttpResponse.json({
      activeUsers: db.users.filter((user) => user.status === 'active').length,
      requestsToday: 18_240 + db.metricsTick * 37,
      errorRate: Number((0.42 + wave * 0.18).toFixed(2)),
      p95LatencyMs: Math.round(212 + wave * 40),
    })
  }),

  http.get(api('/metrics/activity'), ({ request }) => {
    if (!authenticate(request)) return fail(401, 'unauthorized', 'Sign in required.')
    const actions = ['signedIn', 'updated', 'invited', 'exported', 'changedRole']
    const items = Array.from({ length: 8 }, (_, i) => {
      const actor = db.users[(db.metricsTick + i) % db.users.length]
      const target = db.users[(db.metricsTick + i * 7 + 3) % db.users.length]
      return {
        id: `a_${db.metricsTick}_${i}`,
        at: new Date(Date.now() - i * 7 * 60_000).toISOString(),
        actor: actor.name,
        action: actions[(db.metricsTick + i) % actions.length],
        target: target.name,
      }
    })
    return HttpResponse.json(items)
  }),
]
