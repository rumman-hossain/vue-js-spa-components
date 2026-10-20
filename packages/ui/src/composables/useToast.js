import { inject } from 'vue'

/** @typedef {'neutral' | 'success' | 'danger'} ToastTone */

/**
 * @typedef {object} ToastOptions
 * @property {string} title
 * @property {string} [description]
 * @property {ToastTone} [tone]
 * @property {number} [duration] Milliseconds before it hides. `0` or `Infinity` keeps it until dismissed.
 */

/**
 * @typedef {object} Toast
 * @property {string} id
 * @property {string} title
 * @property {string} [description]
 * @property {ToastTone} tone
 * @property {number} duration
 */

/**
 * @typedef {object} ToastApi
 * @property {(options: ToastOptions) => string} show Shows a toast and returns its id.
 * @property {(id: string) => void} dismiss
 */

/** @type {import('vue').InjectionKey<ToastApi>} */
export const TOAST_KEY = Symbol('toast')

/** Default display time. Errors stay longer because they usually ask the user to act. */
export const TOAST_DURATION = { neutral: 5000, success: 5000, danger: 8000 }

/**
 * Shows short, non-blocking notifications in the region rendered by the nearest `<ToastProvider>`.
 *
 * @example
 * const toast = useToast()
 * toast.show({ title: 'Saved', tone: 'success' })
 *
 * @returns {ToastApi}
 */
export function useToast() {
  const api = inject(TOAST_KEY, null)
  if (!api) throw new Error('useToast() needs a <ToastProvider> higher up in the component tree.')
  return api
}
