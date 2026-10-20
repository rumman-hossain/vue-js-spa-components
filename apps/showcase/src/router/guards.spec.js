import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { createAuthGuard } from './guards.js'

const Stub = { template: '<div />' }

function setup() {
  const auth = useAuthStore()
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'dashboard', component: Stub, meta: { requiresAuth: true } },
      { path: '/sign-in', name: 'sign-in', component: Stub, meta: { guestOnly: true } },
      {
        path: '/admin',
        name: 'admin',
        component: Stub,
        meta: { requiresAuth: true, roles: ['admin'] },
      },
      { path: '/forbidden', name: 'forbidden', component: Stub },
    ],
  })
  router.beforeEach(createAuthGuard(auth))
  return { auth, router }
}

describe('auth guard', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('sends anonymous users to sign-in and remembers where they were going', async () => {
    const { router } = setup()
    await router.push('/admin?tab=2')
    expect(router.currentRoute.value.name).toBe('sign-in')
    expect(router.currentRoute.value.query.redirect).toBe('/admin?tab=2')
  })

  it('sends signed-in users away from guest-only pages to the safe redirect', async () => {
    const { auth, router } = setup()
    await auth.signIn({ email: 'admin@example.com', password: 'demo-password' })
    await router.push('/sign-in?redirect=/admin')
    expect(router.currentRoute.value.path).toBe('/admin')
  })

  it('ignores an external redirect target', async () => {
    const { auth, router } = setup()
    await auth.signIn({ email: 'admin@example.com', password: 'demo-password' })
    await router.push('/sign-in?redirect=//evil.example')
    expect(router.currentRoute.value.path).toBe('/')
  })

  it('blocks roles that are not allowed', async () => {
    const { auth, router } = setup()
    await auth.signIn({ email: 'viewer@example.com', password: 'demo-password' })
    await router.push('/admin')
    expect(router.currentRoute.value.name).toBe('forbidden')
  })
})
