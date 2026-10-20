import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    guestOnly?: boolean
    roles?: Array<'admin' | 'viewer'>
    layout?: 'app' | 'blank'
    title?: string
  }
}

export {}
