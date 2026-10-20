import { describe, expect, it, vi } from 'vitest'
import { ApiError, ErrorCode } from '@/api/errors.js'
import { createAppI18n } from '@/i18n/index.js'
import { messageFor, reportError } from './errors.js'

const { t } = createAppI18n('en').global
const ja = createAppI18n('ja').global.t

describe('messageFor', () => {
  it('maps codes to friendly copy without exposing server text', () => {
    const error = new ApiError({
      status: 500,
      code: ErrorCode.SERVER,
      message: 'NullPointer at line 42',
    })
    expect(messageFor(error, t)).toBe('Something went wrong on our side. Try again in a moment.')
  })

  it('includes the wait time for rate limits', () => {
    const error = new ApiError({
      status: 429,
      code: ErrorCode.RATE_LIMITED,
      details: { retryAfter: 30 },
    })
    expect(messageFor(error, t)).toBe('Too many attempts. Try again in 30 seconds.')
    expect(messageFor(error, ja)).toBe('試行回数が多すぎます。30 秒後に再試行してください。')
  })

  it('falls back for unknown codes and non-API errors', () => {
    expect(messageFor(new ApiError({ code: 'weird' }), t)).toMatch(/Something went wrong/)
    expect(messageFor(new TypeError('x'), t)).toMatch(/Something went wrong/)
  })
})

describe('reportError', () => {
  it('skips expected failures such as validation and aborts', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    reportError(new ApiError({ status: 422, code: ErrorCode.VALIDATION }))
    reportError(new ApiError({ code: ErrorCode.ABORTED }))
    expect(spy).not.toHaveBeenCalled()
    reportError(new Error('real bug'))
    expect(spy).toHaveBeenCalledOnce()
    spy.mockRestore()
  })
})
