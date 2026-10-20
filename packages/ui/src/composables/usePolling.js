import { onScopeDispose, ref, shallowRef } from 'vue'

/**
 * Polls `fn` on a timer chain (never overlapping requests).
 *
 * - Backs off exponentially after failures and returns to `interval` after a success.
 * - Pauses while the tab is hidden and fetches immediately when it becomes visible again.
 * - Refreshes when the browser comes back online.
 * - Everything (timer, listeners, in-flight request) is cleaned up with the owning scope.
 *
 * @template T
 * @param {(context: { signal: AbortSignal }) => Promise<T>} fn
 * @param {{
 *   interval?: number,
 *   maxInterval?: number,
 *   backoffFactor?: number,
 *   immediate?: boolean,
 *   pauseWhenHidden?: boolean,
 * }} [options]
 */
export function usePolling(fn, options = {}) {
  const {
    interval = 10_000,
    maxInterval = 5 * 60_000,
    backoffFactor = 2,
    immediate = true,
    pauseWhenHidden = true,
  } = options

  const data = shallowRef(/** @type {T | undefined} */ (undefined))
  const error = shallowRef(/** @type {unknown} */ (null))
  const lastUpdated = ref(/** @type {Date | null} */ (null))
  const isFetching = ref(false)
  const isActive = ref(false)
  const failures = ref(0)

  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let timer
  /** @type {AbortController | null} */
  let controller = null

  function nextDelay() {
    return Math.min(interval * backoffFactor ** failures.value, maxInterval)
  }

  function schedule() {
    clearTimeout(timer)
    if (isActive.value) timer = setTimeout(tick, nextDelay())
  }

  async function tick() {
    clearTimeout(timer)
    controller?.abort()
    const current = new AbortController()
    controller = current
    isFetching.value = true

    try {
      data.value = await fn({ signal: current.signal })
      error.value = null
      failures.value = 0
      lastUpdated.value = new Date()
    } catch (caught) {
      if (current.signal.aborted) return
      error.value = caught
      failures.value += 1
    } finally {
      if (controller === current) {
        controller = null
        isFetching.value = false
        schedule()
      }
    }
  }

  function pause() {
    isActive.value = false
    clearTimeout(timer)
    controller?.abort()
    controller = null
    isFetching.value = false
  }

  function resume() {
    if (isActive.value) return
    isActive.value = true
    tick()
  }

  function onVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      clearTimeout(timer)
    } else if (isActive.value && !isFetching.value) {
      tick()
    }
  }

  function onOnline() {
    if (isActive.value && !isFetching.value) tick()
  }

  if (typeof document !== 'undefined') {
    if (pauseWhenHidden) document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('online', onOnline)
  }

  onScopeDispose(() => {
    pause()
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('online', onOnline)
    }
  })

  if (immediate) resume()

  return {
    data,
    error,
    lastUpdated,
    isFetching,
    isActive,
    failures,
    pause,
    resume,
    /** Fetch now and restart the timer. */
    refresh: tick,
  }
}
