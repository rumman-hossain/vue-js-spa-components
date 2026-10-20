import { describe, expect, it } from 'vitest'
import {
  caretFromCount,
  countSignificant,
  format,
  fromNumber,
  getSeparators,
  normalize,
  sanitize,
  toNumber,
} from './numberText.js'

const en = getSeparators('en-US')
const de = getSeparators('de-DE')
const rules = { allowNegative: true, maxFractionDigits: 2, maxDigits: 6 }

describe('getSeparators', () => {
  it('reads group and decimal separators from the locale', () => {
    expect(en).toEqual({ group: ',', decimal: '.' })
    expect(de).toEqual({ group: '.', decimal: ',' })
  })
})

describe('normalize', () => {
  it('converts full-width digits, minus variants and the full-width point', () => {
    expect(normalize('１２３', en)).toBe('123')
    expect(normalize('－１', en)).toBe('-1')
    expect(normalize('ー１', en)).toBe('-1')
    expect(normalize('−１', en)).toBe('-1')
    expect(normalize('‐１', en)).toBe('-1')
    expect(normalize('１．５', en)).toBe('1.5')
  })

  it('drops grouping separators and spaces the user typed', () => {
    expect(normalize('1,234,567', en)).toBe('1234567')
    expect(normalize('１，２３４', en)).toBe('1234')
    expect(normalize('1 234', en)).toBe('1234')
  })

  it('maps a comma decimal separator to a point', () => {
    expect(normalize('1.234,5', de)).toBe('1234.5')
  })
})

describe('sanitize', () => {
  it('strips everything but digits, sign and one point', () => {
    expect(sanitize('a1b2c', rules)).toBe('12')
    expect(sanitize('1.2.3', rules)).toBe('1.23')
    expect(sanitize('-5', rules)).toBe('-5')
    expect(sanitize('5-', rules)).toBe('5')
  })

  it('keeps incomplete input the user is still typing', () => {
    expect(sanitize('', rules)).toBe('')
    expect(sanitize('-', rules)).toBe('-')
    expect(sanitize('12.', rules)).toBe('12.')
    expect(sanitize('.5', rules)).toBe('0.5')
  })

  it('removes leading zeros but keeps a single zero', () => {
    expect(sanitize('007', rules)).toBe('7')
    expect(sanitize('0', rules)).toBe('0')
    expect(sanitize('00.5', rules)).toBe('0.5')
  })

  it('rejects input over the digit limits', () => {
    expect(sanitize('1234567', rules)).toBeNull()
    expect(sanitize('1.234', rules)).toBeNull()
  })

  it('ignores the sign and the point when they are not allowed', () => {
    const strict = { allowNegative: false, maxFractionDigits: 0, maxDigits: 6 }
    expect(sanitize('-12', strict)).toBe('12')
    expect(sanitize('1.5', strict)).toBe('15')
  })
})

describe('toNumber / fromNumber', () => {
  it('turns canonical text into a number or null', () => {
    expect(toNumber('')).toBeNull()
    expect(toNumber('-')).toBeNull()
    expect(toNumber('12.')).toBe(12)
    expect(toNumber('-0')).toBe(0)
    expect(toNumber('-1.5')).toBe(-1.5)
  })

  it('turns numbers into canonical text without exponent or grouping', () => {
    expect(fromNumber(null, 0)).toBe('')
    expect(fromNumber(undefined, 0)).toBe('')
    expect(fromNumber(Number.NaN, 0)).toBe('')
    expect(fromNumber(1234567, 0)).toBe('1234567')
    expect(fromNumber(1.239, 2)).toBe('1.24')
    expect(fromNumber(-0.5, 1)).toBe('-0.5')
  })
})

describe('format', () => {
  it('groups the integer part and keeps the typed fraction', () => {
    expect(format('1234567', 'en-US', en)).toBe('1,234,567')
    expect(format('-1234.50', 'en-US', en)).toBe('-1,234.50')
    expect(format('12.', 'en-US', en)).toBe('12.')
    expect(format('-', 'en-US', en)).toBe('-')
    expect(format('', 'en-US', en)).toBe('')
  })

  it('uses the locale separators', () => {
    expect(format('1234567.5', 'de-DE', de)).toBe('1.234.567,5')
    expect(format('1234567', 'ja-JP', getSeparators('ja-JP'))).toBe('1,234,567')
  })
})

describe('caret mapping', () => {
  it('counts only characters that survive formatting', () => {
    expect(countSignificant('1,2345', 4, en)).toBe(3)
    expect(countSignificant('-1,234.5', 8, en)).toBe(7)
    expect(countSignificant('1.234,5', 7, de)).toBe(6)
  })

  it('finds the position after the same number of significant characters', () => {
    expect(caretFromCount('12,345', 3, en)).toBe(4)
    expect(caretFromCount('12,345', 0, en)).toBe(0)
    expect(caretFromCount('12,345', 99, en)).toBe(6)
    expect(caretFromCount('1.234,5', 6, de)).toBe(7)
  })
})
