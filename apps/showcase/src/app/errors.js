import { env } from '@/config/env.js'
import { ErrorCode, isApiError } from '@/api/errors.js'

/** User-facing copy per error code. The server's message text is never shown or matched. */
const MESSAGES = {
  [ErrorCode.NETWORK]: 'You appear to be offline. Check your connection and try again.',
  [ErrorCode.TIMEOUT]: 'The server took too long to respond. Try again in a moment.',
  [ErrorCode.UNAUTHORIZED]: 'Your session has ended. Please sign in again.',
  [ErrorCode.FORBIDDEN]: 'You don’t have permission to do that.',
  [ErrorCode.NOT_FOUND]: 'We couldn’t find what you were looking for.',
  [ErrorCode.CONFLICT]: 'That change conflicts with the current data.',
  [ErrorCode.VALIDATION]: 'Some fields need your attention.',
  [ErrorCode.RATE_LIMITED]: 'Too many attempts. Wait a moment and try again.',
  [ErrorCode.SERVER]: 'Something went wrong on our side. Try again in a moment.',
  invalid_credentials: 'Email or password is incorrect.',
  account_suspended: 'This account is suspended. Contact an administrator.',
  session_expired: 'Your session has ended. Please sign in again.',
}

const FALLBACK = 'Something went wrong. Try again in a moment.'

/** @type {Set<string>} */
const EXPECTED = new Set([ErrorCode.ABORTED, ErrorCode.VALIDATION, ErrorCode.UNAUTHORIZED])

/** @param {unknown} error */
export function messageFor(error) {
  if (isApiError(error)) {
    if (error.code === ErrorCode.RATE_LIMITED && typeof error.details.retryAfter === 'number') {
      return `Too many attempts. Try again in ${error.details.retryAfter} seconds.`
    }
    return MESSAGES[/** @type {keyof typeof MESSAGES} */ (error.code)] ?? FALLBACK
  }
  return FALLBACK
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
