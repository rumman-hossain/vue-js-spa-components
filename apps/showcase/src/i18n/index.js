import { watch } from 'vue'
import { createI18n } from 'vue-i18n'
import en from './locales/en.js'
import ja from './locales/ja.js'

/** @typedef {'en' | 'ja'} Locale */

export const LOCALES = /** @type {const} */ (['en', 'ja'])
const STORAGE_KEY = 'locale'

/** @returns {Locale} */
function initialLocale() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'en' || stored === 'ja') return stored
  } catch {
    // Storage can be blocked; fall back to the browser language.
  }
  return navigator.language?.toLowerCase().startsWith('ja') ? 'ja' : 'en'
}

export function createAppI18n(locale = initialLocale()) {
  const i18n = createI18n({
    legacy: false,
    locale,
    fallbackLocale: 'en',
    messages: { en, ja },
    missingWarn: false,
    fallbackWarn: false,
  })

  // Keep <html lang> in sync so screen readers pick the right voice and fonts render correctly.
  watch(
    i18n.global.locale,
    (value) => {
      document.documentElement.lang = value
      try {
        localStorage.setItem(STORAGE_KEY, value)
      } catch {
        // Not persisting is acceptable.
      }
    },
    { immediate: true },
  )

  return i18n
}
