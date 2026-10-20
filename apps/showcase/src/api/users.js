import { http } from './client.js'
import { uploadFile } from './upload.js'

/**
 * @typedef {{
 *   id: string,
 *   name: string,
 *   email: string,
 *   role: 'admin' | 'viewer',
 *   status: 'active' | 'invited' | 'suspended',
 *   monthlyQuota: number,
 *   createdAt: string,
 * }} User
 * @typedef {Omit<User, 'id' | 'createdAt'>} UserInput
 * @typedef {{ page?: number, pageSize?: number, search?: string, sort?: string, order?: 'asc' | 'desc' }} UserQuery
 * @typedef {{ items: User[], total: number, page: number, pageSize: number }} Page
 * @typedef {{ imported: number, skipped: Array<{ line: number, reason: 'invalid' | 'taken' | 'duplicate' }> }} ImportResult
 */

export const usersApi = {
  /** @param {UserQuery} query @param {{ signal?: AbortSignal }} [options] @returns {Promise<Page>} */
  list: (query, options) => http.get('/users', { ...options, query }),
  /** @param {string} id @param {{ signal?: AbortSignal }} [options] @returns {Promise<User>} */
  get: (id, options) => http.get(`/users/${encodeURIComponent(id)}`, options),
  /** @param {UserInput} input @returns {Promise<User>} */
  create: (input) => http.post('/users', input),
  /** @param {string} id @param {UserInput} input @returns {Promise<User>} */
  update: (id, input) => http.put(`/users/${encodeURIComponent(id)}`, input),
  /** @param {string} id @returns {Promise<void>} */
  remove: (id) => http.delete(`/users/${encodeURIComponent(id)}`),
  /**
   * @param {File} file CSV with a header row: name,email,role
   * @param {{ onProgress?: (percent: number) => void, signal?: AbortSignal }} [options]
   * @returns {Promise<ImportResult>}
   */
  importCsv: (file, options) => uploadFile('/users/import', file, options),
  /**
   * @param {string} email
   * @param {string} [excludeId]
   * @returns {Promise<{ available: boolean }>}
   */
  checkEmail: (email, excludeId) =>
    http.get('/users/email-availability', { query: { email, excludeId } }),
}
