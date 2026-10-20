import { afterEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, ref } from 'vue'
import { useClickOutside } from './useClickOutside.js'

function press(/** @type {EventTarget} */ target) {
  target.dispatchEvent(new Event('pointerdown', { bubbles: true }))
}

describe('useClickOutside', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  it('reports presses outside the targets only while active', async () => {
    const inside = document.body.appendChild(document.createElement('div'))
    const outside = document.body.appendChild(document.createElement('div'))
    const handler = vi.fn()
    const active = ref(false)
    const scope = effectScope()
    scope.run(() => useClickOutside([inside, () => null], handler, active))

    press(outside)
    expect(handler).not.toHaveBeenCalled()

    active.value = true
    await nextTick()
    press(inside)
    press(outside)
    expect(handler).toHaveBeenCalledOnce()

    active.value = false
    await nextTick()
    press(outside)
    expect(handler).toHaveBeenCalledOnce()
    scope.stop()
  })

  it('ignores non-node targets and removes its listener when the scope ends', () => {
    const add = vi.spyOn(document, 'addEventListener')
    const remove = vi.spyOn(document, 'removeEventListener')
    const handler = vi.fn()
    const scope = effectScope()
    scope.run(() => useClickOutside([], handler))
    expect(add).toHaveBeenCalledWith('pointerdown', expect.any(Function), true)

    window.dispatchEvent(new Event('pointerdown'))
    expect(handler).not.toHaveBeenCalled()

    scope.stop()
    expect(remove).toHaveBeenCalledWith('pointerdown', expect.any(Function), true)
  })
})
