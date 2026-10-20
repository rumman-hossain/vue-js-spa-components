import { watch } from 'vue'
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

  router.afterEach((to) => {
    document.title = to.meta.title ? `${to.meta.title} · Vue SPA Components` : 'Vue SPA Components'
  })

  return router
}
