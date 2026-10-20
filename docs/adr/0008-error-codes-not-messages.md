# 0008 — The UI branches on error codes, never on server messages

**Status:** accepted

## Context

Matching on server message text breaks when wording changes, cannot be translated and may leak
internals to users.

## Decision

The API returns `{ error: { code, message, details } }`. The client maps `code` (and, for 422,
per-field codes) to translated copy in `errors.*` and `userForm.validation.*`. Unknown codes fall back
to a generic message. Expected failures (validation, aborts, expired sessions) are not reported as
bugs.

## Consequences

- English and Japanese messages stay consistent and testable.
- New server error codes need a translation entry, otherwise users see the generic message.
