import { describe, expect, it } from 'vitest'
import { getPageItems } from './pageItems.js'

describe('getPageItems', () => {
  it('lists every page when they fit', () => {
    expect(getPageItems(1, 1)).toEqual([1])
    expect(getPageItems(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('collapses the end near the first page', () => {
    expect(getPageItems(1, 20)).toEqual([1, 2, 3, 4, 5, 'ellipsis-end', 20])
    expect(getPageItems(4, 20)).toEqual([1, 2, 3, 4, 5, 'ellipsis-end', 20])
  })

  it('collapses both sides in the middle', () => {
    expect(getPageItems(5, 20)).toEqual([1, 'ellipsis-start', 4, 5, 6, 'ellipsis-end', 20])
    expect(getPageItems(10, 20, 2)).toEqual([
      1,
      'ellipsis-start',
      8,
      9,
      10,
      11,
      12,
      'ellipsis-end',
      20,
    ])
  })

  it('collapses the start near the last page', () => {
    expect(getPageItems(17, 20)).toEqual([1, 'ellipsis-start', 16, 17, 18, 19, 20])
    expect(getPageItems(20, 20)).toEqual([1, 'ellipsis-start', 16, 17, 18, 19, 20])
  })

  it('always returns the same number of items once truncated', () => {
    for (let page = 1; page <= 50; page++) expect(getPageItems(page, 50)).toHaveLength(7)
  })
})
