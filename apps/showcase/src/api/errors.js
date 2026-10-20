/** Stable error codes the UI branches on. Never branch on server message text. */
export const ErrorCode = Object.freeze({
  NETWORK: 'network_error',
  TIMEOUT: 'timeout',
  ABORTED: 'aborted',
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',
  NOT_FOUND: 'not_found',
  CONFLICT: 'conflict',
  VALIDATION: 'validation_failed',
  RATE_LIMITED: 'rate_limited',
  SERVER: 'server_error',
  UNKNOWN: 'unknown_error',
})

/** @typedef {typeof ErrorCode[keyof typeof ErrorCode] | (string & {})} ErrorCodeValue */

/** @type {Record<number, ErrorCodeValue>} */
const CODE_BY_STATUS = {
  401: ErrorCode.UNAUTHORIZED,
  403: ErrorCode.FORBIDDEN,
  404: ErrorCode.NOT_FOUND,
  409: ErrorCode.CONFLICT,
  422: ErrorCode.VALIDATION,
  429: ErrorCode.RATE_LIMITED,
}

export class ApiError extends Error {
  /**
   * @param {{
   *   status?: number,
   *   code: ErrorCodeValue,
   *   message?: string,
   *   details?: { fieldErrors?: Record<string, string>, retryAfter?: number, [key: string]: unknown },
   *   cause?: unknown,
   * }} init
   */
  constructor({ status = 0, code, message, details = {}, cause }) {
    super(message ?? code, { cause })
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }

  /** Whether repeating the same request might succeed. */
  get isRetryable() {
    return (
      this.code === ErrorCode.NETWORK ||
      this.code === ErrorCode.TIMEOUT ||
      (this.status >= 500 && this.status !== 501)
    )
  }

  get fieldErrors() {
    return this.details.fieldErrors ?? {}
  }

  /**
   * Builds an error from a non-2xx response with the `{ error: { code, message, details } }` body.
   * @param {Response} response
   */
  static async fromResponse(response) {
    /** @type {{ error?: { code?: string, message?: string, details?: Record<string, unknown> } } | null} */
    let body = null
    try {
      body = await response.json()
    } catch {
      // Non-JSON error pages (proxies, CDNs) still produce a typed error below.
    }
    const fallback =
      CODE_BY_STATUS[response.status] ??
      (response.status >= 500 ? ErrorCode.SERVER : ErrorCode.UNKNOWN)
    return new ApiError({
      status: response.status,
      code: body?.error?.code ?? fallback,
      message: body?.error?.message ?? response.statusText,
      details: body?.error?.details,
    })
  }
}

/**
 * @param {unknown} error
 * @returns {error is ApiError}
 */
export function isApiError(error) {
  return error instanceof ApiError
}
