import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { env } from '@/config/env.js'
import App from './App.vue'
import { installErrorHandling } from './app/errors.js'
import { createAppRouter } from './router/index.js'
import { useAuthStore } from './stores/auth.js'
import './styles.css'

async function bootstrap() {
  if (env.enableMocks) {
    // Loaded on demand so a build with a real API never ships the mock backend.
    const { startMockApi } = await import('./mocks/browser.js')
    await startMockApi()
  }

  const app = createApp(App)
  const pinia = createPinia()
  app.use(pinia)

  const router = createAppRouter(useAuthStore(pinia))
  app.use(router)
  installErrorHandling(app, router)

  await router.isReady()
  app.mount('#app')
}

bootstrap()
