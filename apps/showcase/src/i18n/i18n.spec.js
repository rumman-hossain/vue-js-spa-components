import { describe, expect, it } from 'vitest'
import en from './locales/en.js'
import ja from './locales/ja.js'
import { createAppI18n } from './index.js'

/** @param {Record<string, unknown>} object @param {string} [prefix] @returns {string[]} */
function keys(object, prefix = '') {
  return Object.entries(object).flatMap(([key, value]) =>
    value && typeof value === 'object'
      ? keys(/** @type {Record<string, unknown>} */ (value), `${prefix}${key}.`)
      : [`${prefix}${key}`],
  )
}

/**
 * @param {Record<string, unknown>} object
 * @param {string} key
 * @returns {unknown}
 */
function get(object, key) {
  return key.split('.').reduce((node, part) => /** @type {any} */ (node)[part], object)
}

describe('i18n', () => {
  it('Japanese has exactly the same keys as English', () => {
    expect(keys(ja).sort()).toEqual(keys(en).sort())
  })

  it('every translation keeps the same {placeholders}', () => {
    const placeholders = (/** @type {string} */ text) => (text.match(/\{\w+\}/g) ?? []).sort()
    for (const key of keys(en)) {
      expect(placeholders(/** @type {string} */ (get(ja, key))), key).toEqual(
        placeholders(/** @type {string} */ (get(en, key))),
      )
    }
  })

  it('syncs <html lang> with the active locale', async () => {
    const i18n = createAppI18n('ja')
    expect(document.documentElement.lang).toBe('ja')
    i18n.global.locale.value = 'en'
    await Promise.resolve()
    expect(document.documentElement.lang).toBe('en')
  })
})
