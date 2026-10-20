import { computed, effectScope, readonly, ref, watch } from 'vue'

/** @typedef {'system' | 'light' | 'dark'} ThemeMode */

const STORAGE_KEY = 'ui-theme'
/** @type {ThemeMode[]} */
const MODES = ['system', 'light', 'dark']

/** @returns {ThemeMode} */
function readStoredMode() {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return MODES.includes(/** @type {ThemeMode} */ (value))
      ? /** @type {ThemeMode} */ (value)
      : 'system'
  } catch {
    return 'system' // storage blocked (private mode, sandboxed iframe)
  }
}

const mode = ref(readStoredMode())
const systemDark = ref(false)
let initialized = false

function init() {
  if (initialized || typeof window === 'undefined') return
  initialized = true

  const query = window.matchMedia?.('(prefers-color-scheme: dark)')
  if (query) {
    systemDark.value = query.matches
    query.addEventListener('change', (event) => (systemDark.value = event.matches))
  }

  // Detached scope: the effect must outlive whichever component happened to call useTheme first,
  // otherwise leaving that page would silently stop theme changes from applying.
  effectScope(true).run(() => {
    watch(
      mode,
      (value) => {
        const root = document.documentElement
        root.classList.remove('light', 'dark')
        if (value !== 'system') root.classList.add(value)
        try {
          localStorage.setItem(STORAGE_KEY, value)
        } catch {
          // Not persisting is acceptable; the choice still applies for this session.
        }
      },
      { immediate: true },
    )
  })
}

/**
 * App-wide light/dark/system preference. State is shared across all callers.
 * 'system' leaves <html> without a class so CSS follows `prefers-color-scheme`.
 */
export function useTheme() {
  init()

  return {
    mode: readonly(mode),
    /** Whether dark colors are currently showing, whatever the reason. */
    isDark: computed(() => mode.value === 'dark' || (mode.value === 'system' && systemDark.value)),
    modes: MODES,
    /** @param {ThemeMode} value */
    setMode(value) {
      if (!MODES.includes(value)) throw new Error(`Unknown theme mode: ${value}`)
      mode.value = value
    },
  }
}
