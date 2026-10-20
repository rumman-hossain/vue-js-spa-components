import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: ['packages/*', 'apps/*'],
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      include: ['packages/ui/src/**/*.{js,vue}', 'apps/showcase/src/**/*.{js,vue}'],
      exclude: ['**/*.spec.js', '**/index.js', '**/main.js', '**/mocks/**'],
      reporter: ['text', 'html', 'json-summary'],
    },
  },
})
