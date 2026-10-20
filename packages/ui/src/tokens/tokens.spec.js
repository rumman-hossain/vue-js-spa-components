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

/** Reads `rgb(r g b / a)` tokens such as `--ui-fill`. */
function readAlphaTokens(/** @type {string} */ selector) {
  const start = css.indexOf(selector)
  const block = css.slice(start, css.indexOf('}', start))
  return Object.fromEntries(
    [...block.matchAll(/--ui-([\w-]+):\s*rgb\((\d+) (\d+) (\d+) \/ ([\d.]+)\)/g)].map(
      ([, name, r, g, b, a]) => [
        name,
        { rgb: [Number(r), Number(g), Number(b)], alpha: Number(a) },
      ],
    ),
  )
}

/** @param {string} hex @returns {number[]} */
const toRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))

/** @param {number[]} rgb */
const toHex = (rgb) => `#${rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`

/**
 * Source-over compositing of a translucent color on an opaque one, as the browser paints it.
 * @param {number[]} top @param {number} alpha @param {string} bottomHex
 */
function composite(top, alpha, bottomHex) {
  const bottom = toRgb(bottomHex)
  return toHex(top.map((c, i) => c * alpha + bottom[i] * (1 - alpha)))
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

/** Tones used as both text color and a translucent background in badges, avatars and buttons. */
const TONES = ['tint', 'red', 'green', 'orange']
/** Strongest tinted fill used by components (active state of tinted buttons). */
const MAX_TINT_ALPHA = 0.2

const TEXT = ['label', 'secondary-label', 'placeholder', 'tint', 'red', 'green', 'orange']
const SURFACES = ['background', 'secondary-background', 'grouped-background', 'grouped-row']

describe.each([
  ['light', readTokens(':root {'), readAlphaTokens(':root {')],
  [
    'dark',
    { ...readTokens(':root {'), ...readTokens(':root.dark {') },
    { ...readAlphaTokens(':root {'), ...readAlphaTokens(':root.dark {') },
  ],
])('%s theme contrast (WCAG 2.2 AA)', (_theme, tokens, fills) => {
  it.each(TEXT.flatMap((text) => SURFACES.map((surface) => [text, surface])))(
    '%s text on %s is at least 4.5:1',
    (text, surface) => {
      expect(contrast(tokens[text], tokens[surface])).toBeGreaterThanOrEqual(4.5)
    },
  )

  it.each(['tint-fill', 'red-fill'])('white text on %s is at least 4.5:1', (fill) => {
    expect(contrast(tokens['on-tint'], tokens[fill])).toBeGreaterThanOrEqual(4.5)
  })

  it.each(TONES.flatMap((tone) => SURFACES.map((surface) => [tone, surface])))(
    '%s text on its own tint (20 percent) over %s is at least 4.5:1',
    (tone, surface) => {
      const background = composite(toRgb(tokens[tone]), MAX_TINT_ALPHA, tokens[surface])
      expect(contrast(tokens[tone], background)).toBeGreaterThanOrEqual(4.5)
    },
  )

  it.each(SURFACES)('accent text on a gray fill over %s is at least 4.5:1', (surface) => {
    const { rgb, alpha } = fills.fill
    expect(contrast(tokens.tint, composite(rgb, alpha, tokens[surface]))).toBeGreaterThanOrEqual(
      4.5,
    )
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
