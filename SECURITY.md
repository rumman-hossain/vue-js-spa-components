# Security

## Reporting a vulnerability

Please report security issues privately through
[GitHub security advisories](https://github.com/rumman-hossain/vue-js-spa-components/security/advisories/new)
rather than in a public issue. You will get a reply within a few days.

## How the app is protected

| Threat                      | Mitigation                                                                                                                                                             | Where                                                                         |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Token theft through XSS     | Access token kept in memory only; refresh token in an httpOnly cookie that script cannot read. A test checks the token never reaches web storage.                      | `apps/showcase/src/api/session.js`, `stores/auth.spec.js`, `e2e/auth.spec.js` |
| Client-side role tampering  | User and role come from the server (`/me`) after every reload; nothing auth-related is trusted from storage. Route guards only shape the UI — the API enforces access. | `stores/auth.js`, `router/guards.js`                                          |
| Cross-site scripting        | Vue escapes by default; `v-html` is a lint error. The single place that renders HTML sanitizes it with DOMPurify and an allow-list.                                    | `eslint.config.js`, `pages/SecurityPage.vue`                                  |
| Injected scripts            | Production Content-Security-Policy: no inline scripts, no `eval`, same-origin connections only.                                                                        | `apps/showcase/vite.config.js`, `public/_headers`                             |
| Open redirects              | `?redirect=` only accepts same-origin paths; `//host`, `/\host` and absolute URLs fall back.                                                                           | `router/safeRedirect.js` + tests                                              |
| Clickjacking                | `frame-ancestors 'none'` where headers are available.                                                                                                                  | `public/_headers`                                                             |
| Brute-force sign-in         | The (mock) API locks an account after 5 failures and returns `429` with `retryAfter`; the UI shows the wait time.                                                      | `mocks/handlers.js`, `app/errors.js`                                          |
| Leaked secrets              | Only public `VITE_*` values reach the client; `.env.local` is gitignored; gitleaks runs before every commit and in CI.                                                 | `.gitignore`, `.husky/pre-commit`, `.github/workflows/ci.yml`                 |
| Vulnerable dependencies     | `pnpm audit --prod` fails CI on high-severity advisories; the lockfile is frozen in CI.                                                                                | `.github/workflows/ci.yml`                                                    |
| Leaking internals in errors | The UI never shows server error text: messages are translated from stable error codes, and the error boundary hides raw exception messages.                            | `app/errors.js`, `ErrorBoundary.vue`                                          |
