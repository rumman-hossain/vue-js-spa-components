import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { db } from '@/mocks/db.js'
import { decodeCsv } from '@/mocks/handlers.js'
import { useAuthStore } from '@/stores/auth.js'
import { usersApi } from './users.js'

const csv = (/** @type {string} */ text, name = 'users.csv') =>
  new File([text], name, { type: 'text/csv' })

describe('CSV import upload', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    await useAuthStore().signIn({ email: 'admin@example.com', password: 'demo-password' })
  })

  it('imports valid rows, reports skipped lines and reaches 100% progress', async () => {
    const onProgress = vi.fn()
    const before = db.users.length
    const result = await usersApi.importCsv(
      csv(
        'name,email,role\n' +
          '高橋 美咲,misaki.new@example.com,viewer\n' +
          ',no-name@example.com,viewer\n' +
          '鈴木 花子,viewer@example.com,viewer\n' +
          '森 颯,hayate.new@example.com,admin\n' +
          '森 颯,hayate.new@example.com,admin\n',
      ),
      { onProgress },
    )
    expect(result).toEqual({
      imported: 2,
      skipped: [
        { line: 3, reason: 'invalid' },
        { line: 4, reason: 'taken' },
        { line: 6, reason: 'duplicate' },
      ],
    })
    expect(db.users.length - before).toBe(2)
    expect(onProgress).toHaveBeenLastCalledWith(100)
  })

  it('rejects a file with the wrong header using a field code', async () => {
    await expect(usersApi.importCsv(csv('full name,mail\nA,a@example.com'))).rejects.toMatchObject({
      code: 'validation_failed',
      details: { fieldErrors: { file: 'header' } },
    })
  })

  it('refreshes an expired token once and retries the upload', async () => {
    db.tokens.clear()
    const result = await usersApi.importCsv(
      csv('name,email,role\n林 蓮,ren.new@example.com,viewer\n'),
    )
    expect(result.imported).toBe(1)
  })
})

describe('decodeCsv', () => {
  it('reads UTF-8 with and without a byte-order mark', () => {
    const plain = new TextEncoder().encode('name\n山田')
    const bom = new Uint8Array([0xef, 0xbb, 0xbf, ...plain])
    expect(decodeCsv(plain.buffer)).toBe('name\n山田')
    expect(decodeCsv(bom.buffer)).toBe('name\n山田')
  })

  it('falls back to Shift_JIS for files saved by Japanese Excel', () => {
    // "山田" in Shift_JIS
    const shiftJis = new Uint8Array([0x8e, 0x52, 0x93, 0x63])
    expect(decodeCsv(shiftJis.buffer)).toBe('山田')
  })
})
