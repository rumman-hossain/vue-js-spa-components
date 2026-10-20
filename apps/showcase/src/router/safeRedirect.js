/**
 * Accepts only same-origin, in-app paths for `?redirect=`. Anything else (absolute URLs,
 * protocol-relative `//evil.example`, `javascript:`) falls back, preventing open redirects.
 *
 * @param {unknown} value
 * @param {string} fallback
 */
export function safeRedirect(value, fallback = '/') {
  if (typeof value !== 'string') return fallback
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return fallback
  return value
}
