import { describe, expect, it } from 'vitest'
import { normalizeQuery, splitInlineCode } from './text.js'

describe('splitInlineCode', () => {
  it('marks backticked parts as code', () => {
    expect(splitInlineCode('Use `aria-pressed` here')).toEqual([
      { text: 'Use ', code: false },
      { text: 'aria-pressed', code: true },
      { text: ' here', code: false },
    ])
  })

  it('keeps an unmatched backtick as text', () => {
    expect(splitInlineCode('a `b` c `d')).toEqual([
      { text: 'a ', code: false },
      { text: 'b', code: true },
      { text: ' c `d', code: false },
    ])
  })
})

describe('normalizeQuery', () => {
  it('folds width and case', () => {
    expect(normalizeQuery(' Ｎｕｍｂｅｒ ')).toBe('number')
  })
})
