// @vitest-environment node
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync(new URL('./theme.css', import.meta.url), 'utf8')

/**
 * Pulls `--ui-*` hex values out of the first block that starts with `selector`.
 * @param {string} selector
 */
function readTokens(selector) {
  const start = css.indexOf(selector)
  const block = css.slice(start, css.indexOf('}', start))
  return Object.fromEntries(
    [...block.matchAll(/--ui-([\w-]+):\s*(#[0-9a-f]{6})/gi)].map(([, name, hex]) => [name, hex]),
  )
}

/** @param {string} hex */
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** @param {string} a @param {string} b */
function contrast(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (light + 0.05) / (dark + 0.05)
}

const TEXT = ['label', 'secondary-label', 'placeholder', 'tint', 'red', 'green', 'orange']
const SURFACES = ['background', 'secondary-background', 'grouped-background', 'grouped-row']

describe.each([
  ['light', readTokens(':root {')],
  ['dark', { ...readTokens(':root {'), ...readTokens(':root.dark {') }],
])('%s theme contrast (WCAG 2.2 AA)', (_theme, tokens) => {
  it.each(TEXT.flatMap((text) => SURFACES.map((surface) => [text, surface])))(
    '%s text on %s is at least 4.5:1',
    (text, surface) => {
      expect(contrast(tokens[text], tokens[surface])).toBeGreaterThanOrEqual(4.5)
    },
  )

  it.each(['tint-fill', 'red-fill'])('white text on %s is at least 4.5:1', (fill) => {
    expect(contrast(tokens['on-tint'], tokens[fill])).toBeGreaterThanOrEqual(4.5)
  })

  it('input borders reach 3:1 non-text contrast on the background', () => {
    expect(contrast(tokens['control-border'], tokens.background)).toBeGreaterThanOrEqual(3)
  })
})

it('the OS dark-mode block and the explicit .dark block stay identical', () => {
  const media = readTokens(':root:not(.light) {')
  const explicit = readTokens(':root.dark {')
  expect(media).toEqual(explicit)
})
