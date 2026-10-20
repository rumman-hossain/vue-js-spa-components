# 0002 — Access token in memory, refresh token in an httpOnly cookie

**Status:** accepted

## Context

Tokens in `localStorage` are readable by any injected script. Storing the user's role there also lets
anyone grant themselves admin screens from DevTools.

## Decision

The short-lived access token lives in a module variable. The refresh token is an httpOnly,
`SameSite` cookie set by the server. On load the app calls `/auth/refresh` and then `/auth/me`; the
role always comes from the server.

## Consequences

- XSS cannot exfiltrate the token from storage (a test asserts it never reaches web storage).
- Each page load costs one refresh round trip, shown as a boot spinner.
- The API must still enforce authorization; client guards only shape the UI.
