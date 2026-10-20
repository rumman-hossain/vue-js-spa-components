import { defineProject, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.js'

export default mergeConfig(
  viteConfig,
  defineProject({
    test: {
      name: 'showcase',
      environment: 'jsdom',
      setupFiles: ['./tests/setup.js'],
      include: ['src/**/*.spec.js'],
      css: false,
    },
  }),
)
