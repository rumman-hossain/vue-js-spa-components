/**
 * Fault injection used by the Error lab page and by tests. Each fault applies to the next
 * matching API request only, so the app recovers on its own afterwards.
 */
export const lab = {
  /** @type {null | { status: number, code: string, message: string }} */
  nextFailure: null,
  nextDelayMs: 0,
  offline: false,

  /** @param {number} status @param {string} code @param {string} message */
  failNext(status, code, message) {
    this.nextFailure = { status, code, message }
  },
  /** @param {number} ms */
  delayNext(ms) {
    this.nextDelayMs = ms
  },
  /** @param {boolean} value */
  setOffline(value) {
    this.offline = value
  },
  reset() {
    this.nextFailure = null
    this.nextDelayMs = 0
    this.offline = false
  },
}
