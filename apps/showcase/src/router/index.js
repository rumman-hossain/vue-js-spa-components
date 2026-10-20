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

  router.afterEach((to) => {
    document.title = to.meta.title ? `${to.meta.title} · Vue SPA Components` : 'Vue SPA Components'
  })

  return router
}
