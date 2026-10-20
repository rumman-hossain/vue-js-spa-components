import { inject } from 'vue'

/**
 * @typedef {object} ConfirmOptions
 * @property {string} title
 * @property {string} [message]
 * @property {string} [confirmLabel]
 * @property {string} [cancelLabel]
 * @property {'accent' | 'danger'} [tone]
 */

/** @typedef {(options: ConfirmOptions) => Promise<boolean>} ConfirmFunction */

/** @type {import('vue').InjectionKey<ConfirmFunction>} */
export const CONFIRM_KEY = Symbol('confirm')

/**
 * Asks the user to confirm an action in an alert dialog rendered by the nearest
 * `<ConfirmProvider>`. Resolves `true` for confirm and `false` for cancel or Escape.
 *
 * @example
 * const confirm = useConfirm()
 * if (await confirm({ title: 'Delete file?', tone: 'danger', confirmLabel: 'Delete' })) remove()
 *
 * @returns {ConfirmFunction}
 */
export function useConfirm() {
  const confirm = inject(CONFIRM_KEY, null)
  if (!confirm) {
    throw new Error('useConfirm() needs a <ConfirmProvider> higher up in the component tree.')
  }
  return confirm
}
