import { describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick } from 'vue'
import { useAsync } from './useAsync.js'

/** @template T */
function deferred() {
  /** @type {(value: T) => void} */ let resolve = () => {}
  /** @type {(reason: unknown) => void} */ let reject = () => {}
  const promise = /** @type {Promise<T>} */ (
    new Promise((res, rej) => {
      resolve = res
      reject = rej
    })
  )
  return { promise, resolve, reject }
}

/** @template T @param {() => T} factory */
function inScope(factory) {
  const scope = effectScope()
  const result = /** @type {T} */ (scope.run(factory))
  return { result, stop: () => scope.stop() }
}

describe('useAsync', () => {
  it('moves through pending → success and exposes data', async () => {
    const { result } = inScope(() => useAsync(async (_ctx, /** @type {number} */ n) => n * 2))
    const promise = result.execute(21)
    expect(result.status.value).toBe('pending')
    expect(result.isPending.value).toBe(true)
    await expect(promise).resolves.toBe(42)
    expect(result.data.value).toBe(42)
    expect(result.status.value).toBe('success')
  })

  it('captures errors without throwing and calls onError', async () => {
    const onError = vi.fn()
    const failure = new Error('boom')
    const { result } = inScope(() =>
      useAsync(
        async () => {
          throw failure
        },
        { onError },
      ),
    )
    await expect(result.execute()).resolves.toBeUndefined()
    expect(result.status.value).toBe('error')
    expect(result.error.value).toBe(failure)
    expect(onError).toHaveBeenCalledWith(failure)
  })

  it('ignores a slow earlier response once a newer call has started', async () => {
    const first = deferred()
    const second = deferred()
    const calls = [first, second]
    const { result } = inScope(() =>
      useAsync(() => /** @type {Promise<string>} */ (calls.shift()?.promise)),
    )

    const firstCall = result.execute()
    const secondCall = result.execute()
    second.resolve('new')
    await secondCall
    first.resolve('stale')
    await firstCall

    expect(result.data.value).toBe('new')
  })

  it('aborts the previous request signal when superseded', async () => {
    /** @type {AbortSignal[]} */
    const signals = []
    const { result } = inScope(() =>
      useAsync(({ signal }) => {
        signals.push(signal)
        return new Promise(() => {})
      }),
    )
    result.execute()
    result.execute()
    expect(signals[0].aborted).toBe(true)
    expect(signals[1].aborted).toBe(false)
  })

  it('aborts on scope dispose and does not report the abort as an error', async () => {
    /** @type {AbortSignal | undefined} */
    let seen
    const { result, stop } = inScope(() =>
      useAsync(
        ({ signal }) =>
          new Promise((_resolve, reject) => {
            seen = signal
            signal.addEventListener('abort', () =>
              reject(new DOMException('Aborted', 'AbortError')),
            )
          }),
      ),
    )
    const call = result.execute()
    stop()
    await call
    expect(seen?.aborted).toBe(true)
    expect(result.error.value).toBeNull()
  })

  it('treats errors with code "aborted" as aborts', async () => {
    const { result } = inScope(() =>
      useAsync(async () => {
        throw Object.assign(new Error('aborted'), { code: 'aborted' })
      }),
    )
    await result.execute()
    expect(result.status.value).toBe('pending')
    expect(result.error.value).toBeNull()
  })

  it('runs immediately with initial args', async () => {
    const fn = vi.fn(async (_ctx, /** @type {string} */ value) => value)
    const { result } = inScope(() => useAsync(fn, { immediate: true, initialArgs: ['hi'] }))
    await nextTick()
    await vi.waitFor(() => expect(result.data.value).toBe('hi'))
  })

  it('leaves the pending state when aborted manually', async () => {
    const { result } = inScope(() =>
      useAsync(
        ({ signal }) =>
          new Promise((_resolve, reject) =>
            signal.addEventListener('abort', () =>
              reject(new DOMException('Aborted', 'AbortError')),
            ),
          ),
      ),
    )
    const call = result.execute()
    expect(result.isPending.value).toBe(true)
    result.abort()
    await call
    expect(result.isPending.value).toBe(false)
    expect(result.status.value).toBe('idle')
    expect(result.error.value).toBeNull()
  })
})
