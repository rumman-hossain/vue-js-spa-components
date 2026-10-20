import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const path = (/** @type {string} */ relative) => fileURLToPath(new URL(relative, import.meta.url))

export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': path('./src'),
      // Develop against the library source for instant HMR; the published package uses dist/.
      '@vue-js-spa-components/ui/theme.css': path('../../packages/ui/src/tokens/theme.css'),
      '@vue-js-spa-components/ui': path('../../packages/ui/src/index.js'),
    },
  },
  build: {
    sourcemap: true,
  },
  server: {
    port: 5173,
  },
  preview: {
    port: 4173,
  },
})
