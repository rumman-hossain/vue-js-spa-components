import { computed, onScopeDispose, shallowRef } from 'vue'

/** @typedef {'idle' | 'pending' | 'success' | 'error'} AsyncStatus */

/**
 * @param {unknown} error
 * @returns {boolean}
 */
function isAbort(error) {
  return error instanceof DOMException
    ? error.name === 'AbortError'
    : Boolean(error && typeof error === 'object' && 'code' in error && error.code === 'aborted')
}

/**
 * Runs an async function with per-call state instead of a global loading flag.
 *
 * - Each `execute` aborts the previous call, so a slow old response can never overwrite a newer one.
 * - The pending call is aborted when the owning component unmounts.
 * - Aborts are not errors: `error` stays untouched and the promise resolves to `undefined`.
 *
 * @template T
 * @template {unknown[]} A
 * @param {(context: { signal: AbortSignal }, ...args: A) => Promise<T>} fn
 * @param {{ immediate?: boolean, initialArgs?: A, initialData?: T, onError?: (error: unknown) => void }} [options]
 */
export function useAsync(fn, options = {}) {
  const data = shallowRef(/** @type {T | undefined} */ (options.initialData))
  const error = shallowRef(/** @type {unknown} */ (null))
  const status = shallowRef(/** @type {AsyncStatus} */ ('idle'))

  /** @type {AbortController | null} */
  let controller = null

  function abort() {
    controller?.abort()
    controller = null
  }

  /**
   * @param {A} args
   * @returns {Promise<T | undefined>}
   */
  async function execute(...args) {
    abort()
    const current = new AbortController()
    controller = current
    status.value = 'pending'
    error.value = null

    try {
      const result = await fn({ signal: current.signal }, ...args)
      if (controller !== current) return undefined // superseded by a newer call
      data.value = result
      status.value = 'success'
      return result
    } catch (caught) {
      if (controller !== current || isAbort(caught)) return undefined
      error.value = caught
      status.value = 'error'
      options.onError?.(caught)
      return undefined
    } finally {
      if (controller === current) controller = null
    }
  }

  onScopeDispose(abort)

  if (options.immediate) {
    execute(.../** @type {A} */ (options.initialArgs ?? []))
  }

  return {
    data,
    error,
    status,
    isPending: computed(() => status.value === 'pending'),
    execute,
    abort,
  }
}
