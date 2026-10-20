import { onScopeDispose, toValue, watch } from 'vue'

const FOCUSABLE = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/**
 * @param {HTMLElement} container
 * @returns {HTMLElement[]}
 */
export function getFocusable(container) {
  return /** @type {HTMLElement[]} */ ([...container.querySelectorAll(FOCUSABLE)]).filter(
    (element) => !element.hasAttribute('inert') && !element.closest('[inert]'),
  )
}

/**
 * Keeps Tab / Shift+Tab inside `target` while `active` is true, moves focus in on activation
 * and returns it to the previously focused element on deactivation.
 *
 * @param {import('vue').MaybeRefOrGetter<HTMLElement | null | undefined>} target
 * @param {import('vue').MaybeRefOrGetter<boolean>} active
 * @param {{ initialFocus?: import('vue').MaybeRefOrGetter<HTMLElement | null | undefined> }} [options]
 */
export function useFocusTrap(target, active, options = {}) {
  /** @type {HTMLElement | null} */
  let returnTo = null

  /** @param {KeyboardEvent} event */
  function onKeydown(event) {
    const container = toValue(target)
    if (event.key !== 'Tab' || !container) return

    const focusable = getFocusable(container)
    if (focusable.length === 0) {
      event.preventDefault()
      container.focus()
      return
    }
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  function activate() {
    const container = toValue(target)
    if (!container) return
    returnTo = /** @type {HTMLElement | null} */ (document.activeElement)
    document.addEventListener('keydown', onKeydown)
    const preferred = toValue(options.initialFocus)
    ;(preferred ?? getFocusable(container)[0] ?? container).focus()
  }

  function deactivate() {
    document.removeEventListener('keydown', onKeydown)
    if (returnTo && document.contains(returnTo)) returnTo.focus()
    returnTo = null
  }

  watch(
    () => toValue(active) && Boolean(toValue(target)),
    (isActive, wasActive) => {
      if (isActive) activate()
      else if (wasActive) deactivate()
    },
    { flush: 'post', immediate: true },
  )

  onScopeDispose(deactivate)

  return { activate, deactivate }
}
