import { onScopeDispose, toValue, watch } from 'vue'

/**
 * Calls `handler` when a pointer is pressed outside every element in `targets`.
 *
 * The document listener exists only while `active` is true, so closed popovers cost nothing,
 * and it is removed when the owning scope (component) is disposed.
 *
 * @param {import('vue').MaybeRefOrGetter<Element | null | undefined>[]} targets
 * @param {(event: PointerEvent) => void} handler
 * @param {import('vue').MaybeRefOrGetter<boolean>} [active]
 */
export function useClickOutside(targets, handler, active = true) {
  let listening = false

  /** @param {PointerEvent} event */
  function onPointerdown(event) {
    const node = event.target
    if (!(node instanceof Node)) return
    if (targets.some((target) => toValue(target)?.contains(node))) return
    handler(event)
  }

  function start() {
    if (listening) return
    // Capture phase: a child that stops propagation cannot keep a popover open by accident.
    document.addEventListener('pointerdown', onPointerdown, true)
    listening = true
  }

  function stop() {
    document.removeEventListener('pointerdown', onPointerdown, true)
    listening = false
  }

  watch(
    () => toValue(active),
    (isActive) => (isActive ? start() : stop()),
    { immediate: true },
  )
  onScopeDispose(stop)

  return { stop }
}
