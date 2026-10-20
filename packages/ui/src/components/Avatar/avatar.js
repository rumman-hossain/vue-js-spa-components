/** Token-based color pairs. Text stays on the tinted background so contrast holds in both themes. */
export const AVATAR_TINTS = [
  'bg-tint/15 text-tint',
  'bg-success/15 text-success',
  'bg-warning/15 text-warning',
  'bg-danger/15 text-danger',
  'bg-fill text-label',
]

/**
 * Up to two initials: first and last word. Works per user-perceived character so names in
 * scripts with combining marks or surrogate pairs are not cut in half.
 *
 * @param {string} name
 */
export function getInitials(name) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ''
  const first = (/** @type {string} */ word) =>
    new Intl.Segmenter(undefined, { granularity: 'grapheme' })
      .segment(word)
      [Symbol.iterator]()
      .next().value?.segment ?? ''
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
