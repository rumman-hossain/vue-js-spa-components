import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const path = (/** @type {string} */ relative) => fileURLToPath(new URL(relative, import.meta.url))

/**
 * Content Security Policy as a <meta> tag, for hosts that cannot send headers (GitHub Pages).
 * Build only: the dev server needs inline HMR and a websocket that this policy would block.
 * `frame-ancestors` cannot be set from a meta tag, so public/_headers sends it where possible.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "worker-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ')

/** @returns {import('vite').Plugin} */
function contentSecurityPolicy() {
  return {
    name: 'content-security-policy',
    apply: 'build',
    transformIndexHtml: () => [
      {
        tag: 'meta',
        attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP },
        injectTo: 'head-prepend',
      },
    ],
  }
}

export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [vue(), tailwindcss(), contentSecurityPolicy()],
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
