# 0006 — Native `<dialog>` for modal surfaces

**Status:** accepted

## Context

Hand-built modals usually miss focus containment, `inert` backgrounds, Escape handling and correct
top-layer stacking.

## Decision

Dialog, Sheet and AlertDialog wrap `<dialog>` with `showModal()`. The browser makes the rest of the
page inert and handles the top layer; the component adds labelling, focus return and an
`alertdialog` mode where Cancel is focused first for destructive actions.

## Consequences

- Less code and fewer accessibility bugs.
- jsdom lacks `showModal`, so the test setup includes a small, documented stand-in.
