import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/vue'
import { afterEach } from 'vitest'

// Some specs (design tokens) run in the node environment, where there is no DOM to clean up.
if (typeof document !== 'undefined') {
  afterEach(() => {
    cleanup()
    document.documentElement.className = ''
  })
}

/*
 * jsdom implements <dialog> as an element but not its modal behaviour: `showModal()` and
 * `close()` are missing. This minimal stand-in mirrors what components rely on:
 *   - `showModal()` / `show()` set the `open` attribute,
 *   - `close()` removes it and fires `close`,
 *   - Escape on an open modal fires a cancelable `cancel` event and closes unless it was
 *     prevented, like the browser's close request (a prevented keydown also skips it).
 * Focus trapping and top-layer rendering are not emulated; components must not depend on them.
 */
if (typeof HTMLDialogElement !== 'undefined' && !HTMLDialogElement.prototype.showModal) {
  /** @param {KeyboardEvent} event */
  function onEscape(event) {
    const dialog = /** @type {HTMLDialogElement} */ (event.currentTarget)
    if (event.key !== 'Escape' || event.defaultPrevented || !dialog.open) return
    const cancel = new Event('cancel', { cancelable: true })
    if (dialog.dispatchEvent(cancel)) dialog.close()
  }

  HTMLDialogElement.prototype.show = function show() {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute('open', '')
    this.removeEventListener('keydown', onEscape)
    this.addEventListener('keydown', onEscape)
  }
  HTMLDialogElement.prototype.close = function close() {
    if (!this.hasAttribute('open')) return
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
}
