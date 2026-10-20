import { http } from './client.js'
import { ApiError, ErrorCode } from './errors.js'
import { session } from './session.js'

/**
 * Uploads one file as multipart/form-data with real progress events.
 *
 * Uses XMLHttpRequest because `fetch` cannot report upload progress. It reuses the HTTP client's
 * single-flight refresh, so an expired access token is renewed once and the upload is retried.
 *
 * @template T
 * @param {string} path
 * @param {File} file
 * @param {{ field?: string, onProgress?: (percent: number) => void, signal?: AbortSignal }} [options]
 * @returns {Promise<T>}
 */
export async function uploadFile(path, file, options = {}) {
  try {
    return await send(path, file, options)
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error
    await http.refresh()
    return send(path, file, options)
  }
}

/**
 * @template T
 * @param {string} path
 * @param {File} file
 * @param {{ field?: string, onProgress?: (percent: number) => void, signal?: AbortSignal }} options
 * @returns {Promise<T>}
 */
function send(path, file, { field = 'file', onProgress, signal }) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${http.baseUrl}${path}`)
    xhr.withCredentials = true
    xhr.responseType = 'json'
    xhr.setRequestHeader('Accept', 'application/json')
    const token = session.getAccessToken()
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100))
    })
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100)
        resolve(xhr.response)
        return
      }
      const body = xhr.response ?? {}
      reject(
        new ApiError({
          status: xhr.status,
          code: body.error?.code ?? (xhr.status >= 500 ? ErrorCode.SERVER : ErrorCode.UNKNOWN),
          message: body.error?.message,
          details: body.error?.details,
        }),
      )
    })
    xhr.addEventListener('error', () =>
      reject(new ApiError({ code: ErrorCode.NETWORK, message: 'Network request failed' })),
    )
    xhr.addEventListener('abort', () =>
      reject(new ApiError({ code: ErrorCode.ABORTED, message: 'Upload was cancelled' })),
    )
    signal?.addEventListener('abort', () => xhr.abort(), { once: true })

    const form = new FormData()
    form.append(field, file)
    xhr.send(form)
  })
}
