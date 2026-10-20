import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { session } from '@/api/session.js'
import { usersApi } from '@/api/users.js'
import { db } from '@/mocks/db.js'
import { useAuthStore } from './auth.js'

const admin = { email: 'admin@example.com', password: 'demo-password' }

describe('auth store', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('signs in and keeps the access token in memory only', async () => {
    const auth = useAuthStore()
    await auth.signIn(admin)
    expect(auth.isAuthenticated).toBe(true)
    expect(auth.user?.role).toBe('admin')
    expect(session.getAccessToken()).toMatch(/^mock-access-/)
    expect(localStorage.length).toBe(0)
    expect(sessionStorage.length).toBe(0)
  })

  it('rejects wrong credentials with a stable error code', async () => {
    const auth = useAuthStore()
    await expect(auth.signIn({ ...admin, password: 'nope' })).rejects.toMatchObject({
      code: 'invalid_credentials',
    })
    expect(auth.isAuthenticated).toBe(false)
  })

  it('locks sign-in after repeated failures', async () => {
    const auth = useAuthStore()
    for (let i = 0; i < 5; i += 1) await auth.signIn({ ...admin, password: 'x' }).catch(() => {})
    await expect(auth.signIn(admin)).rejects.toMatchObject({
      code: 'rate_limited',
      details: { retryAfter: 30 },
    })
  })

  it('restores the session from the refresh cookie after a reload', async () => {
    await useAuthStore().signIn(admin)
    session.clear() // a reload loses the in-memory token
    setActivePinia(createPinia())

    const auth = useAuthStore()
    await auth.ensureSession()
    expect(auth.user?.email).toBe('admin@example.com')
  })

  it('becomes anonymous when there is no session to restore', async () => {
    const auth = useAuthStore()
    await auth.ensureSession()
    expect(auth.status).toBe('anonymous')
  })

  it('restores only once even when called concurrently', async () => {
    await useAuthStore().signIn(admin)
    session.clear()
    setActivePinia(createPinia())
    const auth = useAuthStore()
    const before = db.tokenCounter
    await Promise.all([auth.ensureSession(), auth.ensureSession(), auth.ensureSession()])
    expect(db.tokenCounter - before).toBe(1)
  })

  it('silently refreshes an expired access token during a request', async () => {
    const auth = useAuthStore()
    await auth.signIn(admin)
    db.tokens.clear() // the server expires every access token

    const page = await usersApi.list({ page: 1 })
    expect(page.items.length).toBeGreaterThan(0)
    expect(auth.isAuthenticated).toBe(true)
  })

  it('marks the session expired when refresh is no longer possible', async () => {
    const auth = useAuthStore()
    await auth.signIn(admin)
    db.tokens.clear()
    db.refreshSession = null

    await expect(usersApi.list({ page: 1 })).rejects.toMatchObject({ code: 'unauthorized' })
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.sessionExpired).toBe(true)
  })

  it('signs out locally even if the network call fails', async () => {
    const auth = useAuthStore()
    await auth.signIn(admin)
    const { lab } = await import('@/mocks/lab.js')
    lab.setOffline(true)
    await auth.signOut().catch(() => {})
    expect(auth.isAuthenticated).toBe(false)
    expect(session.getAccessToken()).toBeNull()
  })
})
