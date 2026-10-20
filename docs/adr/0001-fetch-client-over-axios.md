# 0001 — A small fetch-based HTTP client instead of axios

**Status:** accepted

## Context

The client needs timeouts, cancellation, retries for reads, typed errors and a token refresh that
concurrent requests share. axios offers interceptors but adds ~13 kB gzipped, and its interceptor
refresh pattern commonly resolves failed requests with `undefined`, which crashes callers far from
the cause.

## Decision

`createHttpClient` (≈200 lines) wraps `fetch` with `AbortSignal.timeout` / `AbortSignal.any`,
maps every failure to an `ApiError { status, code, details }`, retries only idempotent requests,
and keeps one in-flight refresh promise that all 401s await. A failed refresh **rejects**.

## Consequences

- No third-party HTTP dependency; behaviour is fully covered by MSW-backed tests.
- Upload progress events are not available through `fetch`; an XHR path would be needed for that.
