import { z } from 'zod'

const booleanString = z
  .enum(['true', 'false'])
  .default('false')
  .transform((value) => value === 'true')

export const envSchema = z.object({
  VITE_API_BASE_URL: z
    .string()
    .min(1)
    .refine((value) => value.startsWith('/') || /^https?:\/\//.test(value), {
      message: 'must be an absolute URL or a path starting with "/"',
    })
    .transform((value) => value.replace(/\/+$/, '')),
  VITE_APP_ENV: z.enum(['development', 'staging', 'production', 'test']),
  VITE_ENABLE_MOCKS: booleanString,
  VITE_API_TIMEOUT_MS: z.coerce.number().int().min(1000).max(120_000).default(10_000),
  VITE_ERROR_REPORTING_DSN: z.union([z.url(), z.literal('')]).optional(),
})

/**
 * Validates the build-time environment. A misconfigured deploy fails at startup with a message
 * that names the variable, instead of failing later with a confusing network error.
 *
 * @param {Record<string, unknown>} source
 */
export function parseEnv(source) {
  const result = envSchema.safeParse(source)
  if (!result.success) {
    const problems = result.error.issues.map(
      (issue) => `  - ${issue.path.join('.')}: ${issue.message}`,
    )
    throw new Error(`Invalid environment configuration:\n${problems.join('\n')}`)
  }
  const env = result.data
  return Object.freeze({
    apiBaseUrl: env.VITE_API_BASE_URL,
    appEnv: env.VITE_APP_ENV,
    enableMocks: env.VITE_ENABLE_MOCKS,
    apiTimeoutMs: env.VITE_API_TIMEOUT_MS,
    errorReportingDsn: env.VITE_ERROR_REPORTING_DSN || null,
    isProduction: env.VITE_APP_ENV === 'production',
  })
}

export const env = parseEnv(import.meta.env)
