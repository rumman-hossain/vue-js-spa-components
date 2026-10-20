import { env } from '@/config/env.js'
import { createHttpClient } from './http.js'
import { session } from './session.js'

/** @type {Array<() => void>} */
const authFailureListeners = []

/** Lets the auth store react to an expired session without the client importing the store. */
export function onAuthFailure(/** @type {() => void} */ listener) {
  authFailureListeners.push(listener)
  return () => authFailureListeners.splice(authFailureListeners.indexOf(listener), 1)
}

export const http = createHttpClient({
  baseUrl: env.apiBaseUrl,
  timeoutMs: env.apiTimeoutMs,
  getAccessToken: session.getAccessToken,
  async refreshAccessToken() {
    const { accessToken } = await http.post('/auth/refresh', undefined, { skipAuth: true })
    session.setAccessToken(accessToken)
  },
  onAuthFailure() {
    session.clear()
    for (const listener of authFailureListeners) listener()
  },
})
