import { defineProject, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.js'

export default mergeConfig(
  viteConfig,
  defineProject({
    test: {
      name: 'showcase',
      environment: 'jsdom',
      // Same origin as VITE_API_BASE_URL in .env.test, like production. Otherwise jsdom applies CORS
      // to credentialed XHR uploads and blocks them.
      environmentOptions: { jsdom: { url: 'http://localhost/' } },
      setupFiles: ['./tests/setup.js'],
      include: ['src/**/*.spec.js'],
      css: false,
    },
  }),
)
