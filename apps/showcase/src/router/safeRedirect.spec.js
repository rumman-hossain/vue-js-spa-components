import { describe, expect, it } from 'vitest'
import { safeRedirect } from './safeRedirect.js'

describe('safeRedirect', () => {
  it.each([
    ['/users?page=2', '/users?page=2'],
    ['/', '/'],
  ])('keeps the in-app path %s', (input, expected) => {
    expect(safeRedirect(input)).toBe(expected)
  })

  it.each([
    'https://evil.example',
    '//evil.example/path',
    '/\\evil.example',
    'javascript:alert(1)',
    'users',
    undefined,
    ['/a', '/b'],
  ])('rejects %s', (input) => {
    expect(safeRedirect(input, '/home')).toBe('/home')
  })
})
