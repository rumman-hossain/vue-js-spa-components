/**
 * Pure text helpers behind NumberField. They work on a "canonical" string — ASCII digits, an
 * optional leading `-` and an optional `.` — which may be incomplete while the user is typing
 * (`''`, `'-'`, `'12.'`). Display strings add locale grouping on top of it.
 */

/**
 * @typedef {object} Separators
 * @property {string} group   Grouping separator of the locale, e.g. `,` or `.` or a narrow space.
 * @property {string} decimal Decimal separator of the locale, e.g. `.` or `,`.
 */

/**
 * @typedef {object} NumberRules
 * @property {boolean} allowNegative
 * @property {number} maxFractionDigits
 * @property {number} maxDigits Maximum number of integer digits.
 */

const FULL_WIDTH_DIGIT = /[０-９]/g
// Full-width hyphen-minus, katakana prolonged sound mark (what Japanese IMEs produce for "-"),
// minus sign, hyphen, en dash.
const MINUS_VARIANTS = /[－ー−‐–]/g
const SPACES = /\s/g // includes no-break and narrow no-break spaces

/** @param {string | undefined} locale @returns {Separators} */
export function getSeparators(locale) {
  const parts = new Intl.NumberFormat(locale).formatToParts(12345.6)
  return {
    group: parts.find((part) => part.type === 'group')?.value ?? ',',
    decimal: parts.find((part) => part.type === 'decimal')?.value ?? '.',
  }
}

/**
 * Maps full-width and look-alike characters to ASCII, turns the locale decimal separator into
 * `.` and drops grouping separators. Anything else is left for `sanitize` to reject.
 *
 * @param {string} text
 * @param {Separators} separators
 */
export function normalize(text, separators) {
  let result = text
    .replace(FULL_WIDTH_DIGIT, (digit) => String.fromCharCode(digit.charCodeAt(0) - 0xfee0))
    .replace(MINUS_VARIANTS, '-')
    .replace(/．/g, '.')
    .replace(/，/g, ',')

  if (separators.decimal === '.') {
    result = result.replaceAll(separators.group, '').replaceAll(',', '')
  } else {
    // e.g. de-DE: "." groups and "," is the decimal point.
    result = result.replaceAll(separators.group, '').replaceAll(separators.decimal, '.')
  }
  return result.replace(SPACES, '')
}

/**
 * Reduces normalized text to a canonical string, or returns `null` when the text breaks a rule
 * (too many digits) so the caller can keep the previous value.
 *
 * @param {string} text Output of `normalize`.
 * @param {NumberRules} rules
 * @returns {string | null}
 */
export function sanitize(text, rules) {
  const negative = rules.allowNegative && text.trimStart().startsWith('-')
  const allowed = rules.maxFractionDigits > 0 ? /[^\d.]/g : /\D/g
  const [rawInteger, ...rest] = text.replace(allowed, '').split('.')
  const hasPoint = rest.length > 0
  const fraction = rest.join('')

  // Leading zeros carry no information, but a lone "0" before a point does.
  let integer = rawInteger.replace(/^0+(?=\d)/, '')
  if (hasPoint && integer === '') integer = '0'

  if (integer.length > rules.maxDigits || fraction.length > rules.maxFractionDigits) return null

  return `${negative ? '-' : ''}${integer}${hasPoint ? `.${fraction}` : ''}`
}

/** @param {string} canonical @returns {number | null} */
export function toNumber(canonical) {
  if (!/\d/.test(canonical)) return null
  const value = Number(canonical)
  return Object.is(value, -0) ? 0 : value
}

/**
 * @param {number | null | undefined} value
 * @param {number} maxFractionDigits
 */
export function fromNumber(value, maxFractionDigits) {
  if (value === null || value === undefined || !Number.isFinite(value)) return ''
  return value.toLocaleString('en-US', {
    useGrouping: false,
    maximumFractionDigits: maxFractionDigits,
  })
}

/**
 * Adds locale grouping to a canonical string while keeping what the user typed after the
 * decimal point (including trailing zeros and a trailing point).
 *
 * @param {string} canonical
 * @param {string | undefined} locale
 * @param {Separators} separators
 */
export function format(canonical, locale, separators) {
  const negative = canonical.startsWith('-')
  const [integer, fraction] = canonical.replace('-', '').split('.')
  const grouped =
    integer === ''
      ? ''
      : new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(Number(integer))
  return `${negative ? '-' : ''}${grouped}${fraction === undefined ? '' : `${separators.decimal}${fraction}`}`
}

/**
 * Counts characters before `caret` that survive formatting (digits, sign, decimal point), so the
 * caret can be put back after the same characters once grouping separators have moved.
 *
 * @param {string} text
 * @param {number} caret
 * @param {Separators} separators
 */
export function countSignificant(text, caret, separators) {
  return normalize(text.slice(0, caret), separators).replace(/[^\d.-]/g, '').length
}

/**
 * Inverse of `countSignificant` on a formatted display string.
 *
 * @param {string} display
 * @param {number} count
 * @param {Separators} separators
 */
export function caretFromCount(display, count, separators) {
  if (count <= 0) return 0
  let seen = 0
  for (let index = 0; index < display.length; index += 1) {
    const char = display[index]
    if (/\d|-/.test(char) || char === separators.decimal) seen += 1
    if (seen === count) return index + 1
  }
  return display.length
}
