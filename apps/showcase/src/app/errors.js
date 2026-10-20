import { useI18n } from 'vue-i18n'
import { env } from '@/config/env.js'
import { ErrorCode, isApiError } from '@/api/errors.js'

/** Codes that have their own translated message under `errors.*`. */
const TRANSLATED = new Set([
  ...Object.values(ErrorCode),
  'invalid_credentials',
  'account_suspended',
  'session_expired',
])

/** @type {Set<string>} */
const EXPECTED = new Set([ErrorCode.ABORTED, ErrorCode.VALIDATION, ErrorCode.UNAUTHORIZED])

/**
 * Turns any error into translated, user-facing copy. The server's message text is never shown
 * or matched: the UI only branches on stable error codes.
 *
 * @param {unknown} error
 * @param {(key: string, values?: Record<string, unknown>) => string} t
 */
export function messageFor(error, t) {
  if (isApiError(error)) {
    if (error.code === ErrorCode.RATE_LIMITED && typeof error.details.retryAfter === 'number') {
      return t('errors.rate_limited_wait', { seconds: error.details.retryAfter })
    }
    if (TRANSLATED.has(error.code)) return t(`errors.${error.code}`)
  }
  return t('errors.unknown_error')
}

/** Composable form of `messageFor` for components. */
export function useErrorMessage() {
  const { t } = useI18n()
  return (/** @type {unknown} */ error) => messageFor(error, t)
}

/**
 * Sends an error to the reporting backend. In development it logs instead.
 * Expected failures (validation, aborts, auth expiry) are not reported: they are not bugs.
 *
 * @param {unknown} error
 * @param {Record<string, unknown>} [context]
 */
export function reportError(error, context = {}) {
  if (isApiError(error) && EXPECTED.has(error.code)) return
  if (!env.isProduction || !env.errorReportingDsn) {
    console.error('[reportError]', error, context)
    return
  }
  // A real deployment would send this to its reporting service using the public DSN.
  // navigator.sendBeacon survives page unloads and never blocks the UI.
  const payload = JSON.stringify({
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    url: location.href,
    ...context,
  })
  navigator.sendBeacon?.(env.errorReportingDsn, payload)
}

/**
 * Installs the last-resort handlers. Component-level errors are first caught by ErrorBoundary.
 *
 * @param {import('vue').App} app
 * @param {import('vue-router').Router} router
 */
export function installErrorHandling(app, router) {
  app.config.errorHandler = (error, _instance, info) => reportError(error, { source: 'vue', info })

  window.addEventListener('unhandledrejection', (event) =>
    reportError(event.reason, { source: 'unhandledrejection' }),
  )

  // After a deploy, old lazy chunks disappear. Reload once to pick up the new build.
  router.onError((error, to) => {
    const isChunkError =
      /Failed to fetch dynamically imported module|Importing a module script failed/.test(
        String(error?.message),
      )
    const key = `chunk-reload:${to.fullPath}`
    if (isChunkError && !sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, '1')
      location.assign(to.fullPath)
      return
    }
    reportError(error, { source: 'router', to: to.fullPath })
  })
}
