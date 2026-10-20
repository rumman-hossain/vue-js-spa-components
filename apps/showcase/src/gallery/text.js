/**
 * Splits documentation text on backticks: odd segments are inline code.
 * An unmatched trailing backtick is kept as plain text.
 *
 * @param {string} text
 * @returns {{ text: string, code: boolean }[]}
 */
export function splitInlineCode(text) {
  const segments = text.split('`')
  if (segments.length % 2 === 0) {
    // Odd number of backticks: glue the dangling one back onto the last plain segment.
    const last = segments.pop() ?? ''
    segments[segments.length - 1] += `\`${last}`
  }
  return segments
    .map((part, index) => ({ text: part, code: index % 2 === 1 }))
    .filter((part) => part.text !== '')
}

/**
 * Folds case and width so "ＮＵＭＢＥＲ" and "number" match: users typing with an IME often
 * produce full-width letters.
 *
 * @param {string} value
 */
export function normalizeQuery(value) {
  return value.normalize('NFKC').trim().toLocaleLowerCase()
}
