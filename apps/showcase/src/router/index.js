import { nextTick, watch } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createAuthGuard } from './guards.js'
import { routes } from './routes.js'

/** @param {ReturnType<typeof import('@/stores/auth.js').useAuthStore>} auth */
export function createAppRouter(auth) {
  const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior: (_to, _from, saved) => saved ?? { top: 0 },
  })

  router.beforeEach(createAuthGuard(auth))

  // When the session ends mid-use (refresh token revoked), leave protected pages right away.
  watch(
    () => auth.isAuthenticated,
    (isAuthenticated, wasAuthenticated) => {
      const current = router.currentRoute.value
      if (wasAuthenticated && !isAuthenticated && current.meta.requiresAuth) {
        router.replace({ name: 'sign-in', query: { redirect: current.fullPath } })
      }
    },
  )

  router.afterEach((to, from, failure) => {
    document.title = to.meta.title ? `${to.meta.title} · Vue SPA Components` : 'Vue SPA Components'
    // In-app navigation: move focus to the new page's heading so screen readers announce it and
    // keyboard users start from the top. Skipped on first load and when only the query changes.
    if (failure || !from.matched.length || to.path === from.path) return
    nextTick(() => {
      const heading = document.querySelector('main h1')
      if (!(heading instanceof HTMLElement)) return
      heading.tabIndex = -1
      heading.focus({ preventScroll: true })
    })
  })

  return router
}
