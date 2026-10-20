import { http } from './client.js'

/**
 * @typedef {{ id: string, name: string, email: string, role: 'admin' | 'viewer' }} SessionUser
 * @typedef {{ accessToken: string, user: SessionUser }} SignInResponse
 */

export const authApi = {
  /** @param {{ email: string, password: string }} credentials @returns {Promise<SignInResponse>} */
  signIn: (credentials) => http.post('/auth/sign-in', credentials, { skipAuth: true }),
  /** @returns {Promise<{ accessToken: string }>} */
  refresh: () => http.post('/auth/refresh', undefined, { skipAuth: true }),
  /** @returns {Promise<void>} */
  signOut: () => http.post('/auth/sign-out', undefined, { skipAuth: true }),
  /** @param {{ signal?: AbortSignal }} [options] @returns {Promise<SessionUser>} */
  me: (options) => http.get('/auth/me', options),
}
