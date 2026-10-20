import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import { usePolling } from './usePolling.js'

/** @template T @param {() => T} factory */
function inScope(factory) {
  const scope = effectScope()
  const result = /** @type {T} */ (scope.run(factory))
  return { result, stop: () => scope.stop() }
}

/** @param {'visible' | 'hidden'} state */
function setVisibility(state) {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => state })
  document.dispatchEvent(new Event('visibilitychange'))
}

describe('usePolling', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    setVisibility('visible')
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('fetches immediately, then on every interval', async () => {
    let count = 0
    const { result, stop } = inScope(() => usePolling(async () => ++count, { interval: 1000 }))
    await vi.advanceTimersByTimeAsync(0)
    expect(result.data.value).toBe(1)
    expect(result.lastUpdated.value).toBeInstanceOf(Date)
    await vi.advanceTimersByTimeAsync(1000)
    expect(result.data.value).toBe(2)
    await vi.advanceTimersByTimeAsync(1000)
    expect(result.data.value).toBe(3)
    stop()
  })

  it('backs off exponentially after failures and resets after a success', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('1'))
      .mockRejectedValueOnce(new Error('2'))
      .mockResolvedValue('ok')
    const { result, stop } = inScope(() => usePolling(fn, { interval: 1000, backoffFactor: 2 }))

    await vi.advanceTimersByTimeAsync(0)
    expect(result.failures.value).toBe(1)
    await vi.advanceTimersByTimeAsync(1999)
    expect(fn).toHaveBeenCalledTimes(1) // waiting 2000ms, not 1000ms
    await vi.advanceTimersByTimeAsync(1)
    expect(result.failures.value).toBe(2)
    await vi.advanceTimersByTimeAsync(4000)
    expect(result.data.value).toBe('ok')
    expect(result.failures.value).toBe(0)
    expect(result.error.value).toBeNull()
    await vi.advanceTimersByTimeAsync(1000)
    expect(fn).toHaveBeenCalledTimes(4)
    stop()
  })

  it('caps the delay at maxInterval', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('down'))
    const { stop } = inScope(() =>
      usePolling(fn, { interval: 1000, backoffFactor: 10, maxInterval: 5000 }),
    )
    await vi.advanceTimersByTimeAsync(0)
    await vi.advanceTimersByTimeAsync(5000)
    await vi.advanceTimersByTimeAsync(5000)
    expect(fn).toHaveBeenCalledTimes(3)
    stop()
  })

  it('stops the timer while the tab is hidden and refreshes when it returns', async () => {
    const fn = vi.fn().mockResolvedValue('x')
    const { stop } = inScope(() => usePolling(fn, { interval: 1000 }))
    await vi.advanceTimersByTimeAsync(0)
    setVisibility('hidden')
    await vi.advanceTimersByTimeAsync(10_000)
    expect(fn).toHaveBeenCalledTimes(1)
    setVisibility('visible')
    await vi.advanceTimersByTimeAsync(0)
    expect(fn).toHaveBeenCalledTimes(2)
    stop()
  })

  it('cleans up timers and aborts the in-flight request on dispose', async () => {
    /** @type {AbortSignal | undefined} */
    let signal
    const fn = vi.fn((/** @type {{ signal: AbortSignal }} */ context) => {
      signal = context.signal
      return new Promise(() => {})
    })
    const { stop } = inScope(() => usePolling(fn, { interval: 1000 }))
    await vi.advanceTimersByTimeAsync(0)
    stop()
    expect(signal?.aborted).toBe(true)
    await vi.advanceTimersByTimeAsync(60_000)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('can be paused, resumed and refreshed manually', async () => {
    const fn = vi.fn().mockResolvedValue('x')
    const { result, stop } = inScope(() => usePolling(fn, { interval: 1000, immediate: false }))
    await vi.advanceTimersByTimeAsync(5000)
    expect(fn).not.toHaveBeenCalled()
    result.resume()
    await vi.advanceTimersByTimeAsync(0)
    expect(fn).toHaveBeenCalledTimes(1)
    result.pause()
    await vi.advanceTimersByTimeAsync(5000)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(result.isActive.value).toBe(false)
    await result.refresh()
    expect(fn).toHaveBeenCalledTimes(2)
    stop()
  })

  it('refreshes when the browser comes back online', async () => {
    const fn = vi.fn().mockResolvedValue('x')
    const { stop } = inScope(() => usePolling(fn, { interval: 60_000 }))
    await vi.advanceTimersByTimeAsync(0)
    window.dispatchEvent(new Event('online'))
    await vi.advanceTimersByTimeAsync(0)
    expect(fn).toHaveBeenCalledTimes(2)
    stop()
  })
})
