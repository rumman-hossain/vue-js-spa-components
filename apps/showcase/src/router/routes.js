/** @type {import('vue-router').RouteRecordRaw[]} */
export const routes = [
  {
    path: '/sign-in',
    name: 'sign-in',
    component: () => import('@/pages/SignInPage.vue'),
    meta: { guestOnly: true, layout: 'blank', title: 'Sign in' },
  },
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/pages/DashboardPage.vue'),
    meta: { requiresAuth: true, title: 'Dashboard' },
  },
  {
    path: '/users',
    name: 'users',
    component: () => import('@/pages/UsersPage.vue'),
    meta: { requiresAuth: true, title: 'Users' },
  },
  {
    path: '/users/new',
    name: 'user-create',
    component: () => import('@/pages/UserFormPage.vue'),
    meta: { requiresAuth: true, roles: ['admin'], title: 'New user' },
  },
  {
    path: '/users/:id',
    name: 'user-edit',
    component: () => import('@/pages/UserFormPage.vue'),
    props: true,
    meta: { requiresAuth: true, roles: ['admin'], title: 'Edit user' },
  },
  {
    path: '/components',
    name: 'components',
    component: () => import('@/pages/ComponentsPage.vue'),
    meta: { title: 'Components' },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/pages/SettingsPage.vue'),
    meta: { title: 'Settings' },
  },
  {
    path: '/error-lab',
    name: 'error-lab',
    component: () => import('@/pages/ErrorLabPage.vue'),
    meta: { requiresAuth: true, title: 'Error lab' },
  },
  {
    path: '/security',
    name: 'security',
    component: () => import('@/pages/SecurityPage.vue'),
    meta: { title: 'Security' },
  },
  {
    path: '/forbidden',
    name: 'forbidden',
    component: () => import('@/pages/ForbiddenPage.vue'),
    meta: { title: 'No access' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/NotFoundPage.vue'),
    meta: { title: 'Page not found' },
  },
]
