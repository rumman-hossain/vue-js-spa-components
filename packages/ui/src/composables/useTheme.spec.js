import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Each test gets a fresh module so the shared state starts clean.
 * @param {{ stored?: string | null, systemDark?: boolean }} [options]
 */
async function load({ stored = null, systemDark = false } = {}) {
  vi.resetModules()
  localStorage.clear()
  if (stored) localStorage.setItem('ui-theme', stored)
  /** @type {((event: { matches: boolean }) => void) | undefined} */
  let onChange
  window.matchMedia = vi.fn().mockReturnValue({
    matches: systemDark,
    addEventListener: (
      /** @type {string} */ _type,
      /** @type {(event: { matches: boolean }) => void} */ listener,
    ) => (onChange = listener),
  })
  const { useTheme } = await import('./useTheme.js')
  return {
    theme: useTheme(),
    emitSystemChange: (/** @type {boolean} */ matches) => onChange?.({ matches }),
  }
}

describe('useTheme', () => {
  beforeEach(() => {
    document.documentElement.className = ''
  })

  it('defaults to system and leaves <html> without a theme class', async () => {
    const { theme } = await load()
    expect(theme.mode.value).toBe('system')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(document.documentElement.classList.contains('light')).toBe(false)
  })

  it('applies and persists an explicit choice', async () => {
    const { theme } = await load()
    theme.setMode('dark')
    await vi.waitFor(() => expect(document.documentElement.classList.contains('dark')).toBe(true))
    expect(localStorage.getItem('ui-theme')).toBe('dark')
    expect(theme.isDark.value).toBe(true)
  })

  it('restores the stored choice on load', async () => {
    const { theme } = await load({ stored: 'light' })
    expect(theme.mode.value).toBe('light')
    expect(document.documentElement.classList.contains('light')).toBe(true)
  })

  it('ignores garbage in storage', async () => {
    const { theme } = await load({ stored: 'purple' })
    expect(theme.mode.value).toBe('system')
  })

  it('follows OS changes while in system mode', async () => {
    const { theme, emitSystemChange } = await load({ systemDark: false })
    expect(theme.isDark.value).toBe(false)
    emitSystemChange(true)
    expect(theme.isDark.value).toBe(true)
  })

  it('still works when storage throws', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const { theme } = await load()
    expect(theme.mode.value).toBe('system')
    vi.restoreAllMocks()
  })

  it('rejects unknown modes', async () => {
    const { theme } = await load()
    // @ts-expect-error testing invalid input
    expect(() => theme.setMode('sepia')).toThrow('Unknown theme mode')
  })
})

describe('useTheme across components', () => {
  it('keeps applying changes after the first calling component unmounts', async () => {
    vi.resetModules()
    localStorage.clear()
    window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: () => {} })
    const { useTheme } = await import('./useTheme.js')
    const { createApp, defineComponent, h } = await import('vue')

    const First = defineComponent({ setup: () => (useTheme(), () => h('div')) })
    const app = createApp(First)
    app.mount(document.createElement('div'))
    app.unmount()

    useTheme().setMode('dark')
    await vi.waitFor(() => expect(document.documentElement.classList.contains('dark')).toBe(true))
  })
})
