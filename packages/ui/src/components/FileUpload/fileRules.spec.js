import { describe, expect, it } from 'vitest'
import { formatBytes, matchesAccept, partitionFiles } from './fileRules.js'

const file = (/** @type {string} */ name, type = '', size = 10) =>
  /** @type {File} */ (/** @type {unknown} */ ({ name, type, size }))

describe('matchesAccept', () => {
  it.each([
    [file('photo.PNG', 'image/png'), 'image/*', true],
    [file('report.csv', 'text/csv'), '.csv', true],
    [file('report.CSV', ''), '.csv', true],
    [file('doc.pdf', 'application/pdf'), 'application/pdf, .docx', true],
    [file('notes.txt', 'text/plain'), 'image/*,.csv', false],
    [file('anything.bin', 'application/octet-stream'), '', true],
    [file('anything.bin', 'application/octet-stream'), undefined, true],
  ])('%o with accept=%s → %s', (candidate, accept, expected) => {
    expect(matchesAccept(candidate, accept)).toBe(expected)
  })
})

describe('formatBytes', () => {
  it('picks a readable unit and follows the locale', () => {
    expect(formatBytes(512, 'en-US')).toBe('512 byte')
    expect(formatBytes(1536, 'en-US')).toBe('1.5 kB')
    expect(formatBytes(5 * 1024 * 1024, 'en-US')).toBe('5 MB')
    expect(formatBytes(1536, 'de-DE')).toBe('1,5 kB')
  })
})

describe('partitionFiles', () => {
  it('keeps the order and reports why files were rejected', () => {
    const files = [
      file('a.png', 'image/png', 10),
      file('b.exe', 'application/x-msdownload'),
      file('c.png', 'image/png', 5000),
      file('d.png', 'image/png'),
      file('e.png', 'image/png'),
    ]
    const result = partitionFiles(files, {
      accept: 'image/*',
      maxSize: 1000,
      maxFiles: 3,
      current: 1,
    })
    expect(result.accepted.map((f) => f.name)).toEqual(['a.png', 'd.png'])
    expect(result.rejected.map(({ file: f, reason }) => `${f.name}:${reason}`)).toEqual([
      'b.exe:type',
      'c.png:size',
      'e.png:count',
    ])
  })
})
