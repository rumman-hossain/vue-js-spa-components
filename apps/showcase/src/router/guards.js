import { safeRedirect } from './safeRedirect.js'

/**
 * Navigation guard factory. Client-side guards only shape the UI; the API enforces access.
 *
 * @param {ReturnType<typeof import('@/stores/auth.js').useAuthStore>} auth
 * @returns {import('vue-router').NavigationGuardWithThis<undefined>}
 */
export function createAuthGuard(auth) {
  return async (to) => {
    await auth.ensureSession()

    if (to.meta.requiresAuth && !auth.isAuthenticated) {
      return { name: 'sign-in', query: { redirect: to.fullPath }, replace: true }
    }
    if (to.meta.guestOnly && auth.isAuthenticated) {
      return safeRedirect(to.query.redirect, '/')
    }
    const roles = /** @type {Array<'admin' | 'viewer'> | undefined} */ (to.meta.roles)
    if (roles && !auth.hasRole(...roles)) {
      return { name: 'forbidden', replace: true }
    }
    return true
  }
}
