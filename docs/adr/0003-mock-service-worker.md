# 0003 — Mock Service Worker for the demo backend and for tests

**Status:** accepted

## Context

The public demo must work without a server, and tests should exercise the real HTTP client rather
than mocked functions.

## Decision

One set of MSW handlers (`src/mocks/handlers.js`) backs the browser demo (service worker) and the
Vitest suite (`setupServer`). A fault-injection module powers the Error lab.

## Consequences

- The same code paths (headers, retries, refresh) run in demo, unit tests and e2e tests.
- Mocks are loaded with a dynamic import only when `VITE_ENABLE_MOCKS=true`, so a production build
  with a real API never ships them.
