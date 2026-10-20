import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { authApi } from '@/api/auth.js'
import { onAuthFailure } from '@/api/client.js'
import { session } from '@/api/session.js'

/** @typedef {import('@/api/auth.js').SessionUser} SessionUser */
/** @typedef {'unknown' | 'authenticated' | 'anonymous'} AuthStatus */

export const useAuthStore = defineStore('auth', () => {
  const user = ref(/** @type {SessionUser | null} */ (null))
  const status = ref(/** @type {AuthStatus} */ ('unknown'))
  /** Set when the session ended on its own (expired), so the sign-in page can explain why. */
  const sessionExpired = ref(false)

  /** @type {Promise<void> | null} */
  let restoring = null

  const isAuthenticated = computed(() => status.value === 'authenticated')

  /** @param {SessionUser} signedInUser */
  function setUser(signedInUser) {
    user.value = signedInUser
    status.value = 'authenticated'
    sessionExpired.value = false
  }

  function clear() {
    session.clear()
    user.value = null
    status.value = 'anonymous'
  }

  /**
   * Restores the session once per page load. The user and role always come from the server,
   * never from client storage, so they cannot be edited in DevTools to gain access.
   */
  function ensureSession() {
    if (status.value !== 'unknown') return Promise.resolve()
    restoring ??= (async () => {
      try {
        const { accessToken } = await authApi.refresh()
        session.setAccessToken(accessToken)
        setUser(await authApi.me())
      } catch {
        clear()
      } finally {
        restoring = null
      }
    })()
    return restoring
  }

  /** @param {{ email: string, password: string }} credentials */
  async function signIn(credentials) {
    const result = await authApi.signIn(credentials)
    session.setAccessToken(result.accessToken)
    setUser(result.user)
  }

  async function signOut() {
    try {
      await authApi.signOut()
    } finally {
      clear() // sign out locally even if the network call fails
    }
  }

  /** @param {Array<SessionUser['role']>} roles */
  function hasRole(...roles) {
    return Boolean(user.value && roles.includes(user.value.role))
  }

  onAuthFailure(() => {
    if (status.value === 'authenticated') sessionExpired.value = true
    clear()
  })

  return { user, status, sessionExpired, isAuthenticated, ensureSession, signIn, signOut, hasRole }
})
