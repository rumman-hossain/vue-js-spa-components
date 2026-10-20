# Vue SPA Components

[![CI](https://github.com/rumman-hossain/vue-js-spa-components/actions/workflows/ci.yml/badge.svg)](https://github.com/rumman-hossain/vue-js-spa-components/actions/workflows/ci.yml)
[![Deploy demo](https://github.com/rumman-hossain/vue-js-spa-components/actions/workflows/deploy.yml/badge.svg)](https://github.com/rumman-hossain/vue-js-spa-components/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

An accessible, tested Vue 3 component library and a production-style single-page app that uses it.
The goal is to show how a real business SPA should be built: typed API layer, silent token refresh,
error and loading states that never leave the user guessing, forms that validate like the server,
and a UI that works with a keyboard, a screen reader, dark mode and a Japanese IME.

**Live demo:** https://rumman-hossain.github.io/vue-js-spa-components/ — sign in with
`admin@example.com` / `demo-password` (or `viewer@example.com` for a read-only role).
The demo runs entirely in the browser: the API is mocked with Mock Service Worker.

## Highlights

### Japanese input that just works

Most numeric inputs break under a Japanese IME: they reformat text mid-composition, delete
full-width digits, or jump the caret. `NumberField` handles this properly:

- ignores reformatting during `compositionstart` → `compositionend`
- converts full-width digits `１２３`, full-width/IME minus signs (`－ ー −`) and `．` to ASCII
- groups digits per locale (`1,234,567` / `1.234.567`) while **keeping the caret where you typed**
- never uses the deprecated `document.execCommand`

The UI ships in English and Japanese (`vue-i18n`, with a test that both languages have the same keys
and placeholders), Japanese names sort with a Japanese collator, and avatars show the family name
(`山田 太郎` → `山田`) instead of meaningless Latin-style initials.

### What each concern looks like here

| Concern                    | Where to look                                                                                                                                                                                                                                                                                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Component architecture** | `packages/ui` is a publishable library (Vite library mode, `publint` clean). The app consumes it like any other package. Shared field wiring lives in one internal composable instead of being copied into every input.                                                                                                                                 |
| **Accessibility**          | WAI-ARIA patterns for Menu, Tabs, Combobox and Dialog (native `<dialog>`). Every component spec runs axe; Playwright runs axe on every page in light and dark mode. Color tokens are contrast-tested in CI, including text on tinted fills. Focus moves to the page heading after navigation; the first invalid field is focused after a failed submit. |
| **Unit testing**           | ~500 Vitest tests next to the code they test (`*.spec.js`), behaviour-first with Testing Library, ≥ 85 % coverage on the library.                                                                                                                                                                                                                       |
| **E2E testing**            | Playwright in Chromium, WebKit, Firefox and a mobile profile: auth, URL state, optimistic delete, server validation, IME input, error recovery.                                                                                                                                                                                                         |
| **Env config & secrets**   | `apps/showcase/src/config/env.js` validates `import.meta.env` with zod and fails at startup with a clear message. `.env.example` documents every variable. Secrets never go in `VITE_*`. gitleaks runs in a pre-commit hook and in CI.                                                                                                                  |
| **Auth / API layer**       | `src/api/http.js`: typed `ApiError` with stable codes, timeouts, retries with backoff for reads only, and a **single-flight token refresh** shared by concurrent 401s. The access token lives in memory; the refresh token is an httpOnly cookie. Roles come from `/me`, never from `localStorage`.                                                     |
| **Error handling**         | The UI branches on error codes, never on server text. Per-route `ErrorBoundary`, global `errorHandler` and `unhandledrejection` reporting, stale-chunk reload after deploys. The **Error lab** page lets you trigger each failure and watch the recovery.                                                                                               |
| **Loading / async state**  | `useAsync` gives per-request state and aborts superseded or unmounted requests; `usePolling` backs off on errors and pauses in hidden tabs. Skeletons on first load, a stale-data banner instead of a blank screen.                                                                                                                                     |
| **Forms & validation**     | `useForm` accepts any [Standard Schema](https://standardschema.dev) validator (zod 4 here), runs async checks (email availability), maps server `422` field codes, locks double submits and guards unsaved changes.                                                                                                                                     |
| **Security**               | Production CSP (no inline scripts, no eval), open-redirect-safe `?redirect=`, DOMPurify for the one place that renders HTML, `vue/no-v-html` as a lint error, `pnpm audit` in CI. See [SECURITY.md](SECURITY.md).                                                                                                                                       |
| **Performance**            | Route-level code splitting, mocks loaded only when enabled, bundle budgets enforced by `size-limit` in CI.                                                                                                                                                                                                                                              |

Design decisions and their trade-offs are written down in [`docs/adr`](docs/adr).

## Stack

Vue 3.5 · Vite 8 (Rolldown) · Tailwind CSS 4.3 (CSS-first tokens) · Vue Router 5 · Pinia 4 · vue-i18n 11 ·
zod 4 · Vitest 5 · Testing Library · Playwright · MSW 3 · ESLint 10 · Prettier · JavaScript with JSDoc,
type-checked by `vue-tsc` (TypeScript 6; TypeScript 7 does not yet expose the API `vue-tsc` needs).

## Project structure

```
packages/ui/               @vue-js-spa-components/ui — the component library
  src/tokens/theme.css     design tokens (color, type scale, radii, motion) as Tailwind 4 @theme
  src/components/<Name>/   <Name>.vue · <Name>.spec.js · index.js
  src/composables/         useForm, useAsync, usePolling, useToast, useConfirm, useTheme, …
apps/showcase/             the SPA
  src/config/env.js        validated environment
  src/api/                 http client, typed errors, domain modules
  src/mocks/               MSW backend (also used by unit tests)
  src/stores/auth.js       session state
  src/router/              routes, auth guard, safe redirects
  src/pages/               dashboard, users, user form, settings, error lab, security, components
  src/gallery/             the component docs shown on the Components page
  e2e/                     Playwright specs
docs/adr/                  architecture decision records
```

## Getting started

Requires Node 22.12+ and pnpm 10.

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

## Scripts

| Command                           | What it does                                                |
| --------------------------------- | ----------------------------------------------------------- |
| `pnpm dev`                        | Start the showcase with hot reload (mock API on).           |
| `pnpm build`                      | Build the library (`dist/` + `publint`) and the showcase.   |
| `pnpm test` / `pnpm test:run`     | Unit and component tests (watch / once).                    |
| `pnpm test:coverage`              | Tests with V8 coverage.                                     |
| `pnpm test:e2e`                   | Playwright in all browsers (`pnpm build` first).            |
| `pnpm test:a11y`                  | Only the accessibility e2e tests.                           |
| `pnpm typecheck`                  | `vue-tsc` over every package.                               |
| `pnpm lint` / `pnpm format:check` | ESLint and Prettier.                                        |
| `pnpm size`                       | Check bundle size budgets.                                  |
| `pnpm check`                      | Everything CI checks before merge. Also runs on `git push`. |
| `pnpm changeset` / `pnpm release` | Version and publish the library.                            |

## Environment variables

Copy `apps/showcase/.env.example` to `.env.local` to override values on your machine.

| Variable                   | Description                                       |
| -------------------------- | ------------------------------------------------- |
| `VITE_API_BASE_URL`        | API base URL or same-origin path, e.g. `/api`.    |
| `VITE_APP_ENV`             | `development`, `staging`, `production` or `test`. |
| `VITE_ENABLE_MOCKS`        | `true` serves the API from Mock Service Worker.   |
| `VITE_API_TIMEOUT_MS`      | Request timeout (1000–120000).                    |
| `VITE_ERROR_REPORTING_DSN` | Optional public endpoint for error reports.       |

Everything prefixed with `VITE_` ends up in the JavaScript bundle and is public.

## Using the library

```bash
pnpm add @vue-js-spa-components/ui
```

```js
import '@vue-js-spa-components/ui/style.css'
import { Button, TextField, useForm } from '@vue-js-spa-components/ui'
```

Apps that already use Tailwind CSS 4 can import the tokens instead and get the same utilities:

```css
@import 'tailwindcss';
@import '@vue-js-spa-components/ui/theme.css';
@source '../node_modules/@vue-js-spa-components/ui/dist';
```

## License

[MIT](LICENSE) © MD Rumman Hossain
