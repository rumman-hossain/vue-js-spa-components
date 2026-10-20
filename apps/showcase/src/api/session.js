/**
 * Holds the short-lived access token in memory only.
 *
 * It is deliberately not in localStorage or sessionStorage: anything stored there can be read by
 * injected script (XSS). After a page reload the app gets a new access token from the refresh
 * endpoint, which relies on an httpOnly cookie the page cannot read.
 */
let accessToken = /** @type {string | null} */ (null)

export const session = {
  getAccessToken: () => accessToken,
  /** @param {string | null} token */
  setAccessToken: (token) => {
    accessToken = token
  },
  clear: () => {
    accessToken = null
  },
}
