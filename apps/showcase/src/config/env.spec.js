import { describe, expect, it } from 'vitest'
import { parseEnv } from './env.js'

const valid = {
  VITE_API_BASE_URL: 'https://api.example.com/v1/',
  VITE_APP_ENV: 'production',
  VITE_ENABLE_MOCKS: 'false',
  VITE_API_TIMEOUT_MS: '8000',
}

describe('parseEnv', () => {
  it('normalizes and types a valid configuration', () => {
    expect(parseEnv(valid)).toEqual({
      apiBaseUrl: 'https://api.example.com/v1',
      appEnv: 'production',
      enableMocks: false,
      apiTimeoutMs: 8000,
      errorReportingDsn: null,
      isProduction: true,
    })
  })

  it('accepts a same-origin path as the API base', () => {
    expect(parseEnv({ ...valid, VITE_API_BASE_URL: '/api' }).apiBaseUrl).toBe('/api')
  })

  it('fails fast and names every broken variable', () => {
    expect(() =>
      parseEnv({ ...valid, VITE_API_BASE_URL: 'api.example.com', VITE_APP_ENV: 'prod' }),
    ).toThrow(/VITE_API_BASE_URL[\s\S]*VITE_APP_ENV/)
  })

  it('rejects a timeout outside the safe range', () => {
    expect(() => parseEnv({ ...valid, VITE_API_TIMEOUT_MS: '50' })).toThrow(/VITE_API_TIMEOUT_MS/)
  })

  it('defaults optional values', () => {
    const { VITE_ENABLE_MOCKS: _mocks, VITE_API_TIMEOUT_MS: _timeout, ...rest } = valid
    const env = parseEnv(rest)
    expect(env.enableMocks).toBe(false)
    expect(env.apiTimeoutMs).toBe(10_000)
  })
})
