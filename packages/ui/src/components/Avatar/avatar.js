/** Token-based color pairs. Text stays on the tinted background so contrast holds in both themes. */
export const AVATAR_TINTS = [
  'bg-tint/12 text-tint',
  'bg-success/12 text-success',
  'bg-warning/12 text-warning',
  'bg-danger/12 text-danger',
  'bg-fill text-label',
]

const CJK = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u

/** @param {string} text @returns {string[]} user-perceived characters */
function graphemes(text) {
  return [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)].map(
    (part) => part.segment,
  )
}

/**
 * Initials for an avatar.
 *
 * - Latin and similar scripts: first letters of the first and last word ("Emma Sato" → "ES").
 * - Japanese, Chinese and Korean names are written family name first and are not abbreviated
 *   letter by letter, so the family name is shown instead, up to two characters ("山田 太郎" → "山田").
 *
 * Works per grapheme so combining marks and emoji are never cut in half.
 *
 * @param {string} name
 */
export function getInitials(name) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ''
  if (CJK.test(words[0])) return graphemes(words[0]).slice(0, 2).join('')
  const first = (/** @type {string} */ word) => graphemes(word)[0] ?? ''
  const letters = words.length === 1 ? first(words[0]) : first(words[0]) + first(words.at(-1) ?? '')
  return letters.toLocaleUpperCase()
}

/**
 * Stable index for a name (FNV-1a), so the same person always gets the same color.
 *
 * @param {string} name
 * @param {number} buckets
 */
export function hashToIndex(name, buckets) {
  let hash = 0x811c9dc5
  for (let index = 0; index < name.length; index += 1) {
    hash ^= name.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0) % buckets
}
