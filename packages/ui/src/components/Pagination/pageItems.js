/** @typedef {number | 'ellipsis-start' | 'ellipsis-end'} PageItem */

/**
 * @param {number} from
 * @param {number} to
 */
const range = (from, to) => Array.from({ length: to - from + 1 }, (_, index) => from + index)

/**
 * Compact page list: first and last page, `siblings` pages either side of the current one, and
 * ellipses for the gaps. The list always has the same length once it is truncated, so the
 * controls do not jump around while paging.
 *
 * @example getPageItems(5, 10) // [1, 'ellipsis-start', 4, 5, 6, 'ellipsis-end', 10]
 *
 * @param {number} page Current page, 1-based.
 * @param {number} pageCount
 * @param {number} [siblings]
 * @returns {PageItem[]}
 */
export function getPageItems(page, pageCount, siblings = 1) {
  const slots = siblings * 2 + 5 // first, last, current, two ellipses
  if (pageCount <= slots) return range(1, pageCount)

  const edgeCount = slots - 2 // pages shown next to a single ellipsis
  const left = Math.max(page - siblings, 1)
  const right = Math.min(page + siblings, pageCount)

  if (left <= 3) return [...range(1, edgeCount), 'ellipsis-end', pageCount]
  if (right >= pageCount - 2) {
    return [1, 'ellipsis-start', ...range(pageCount - edgeCount + 1, pageCount)]
  }
  return [1, 'ellipsis-start', ...range(left, right), 'ellipsis-end', pageCount]
}
