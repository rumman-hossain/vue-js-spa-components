# 0005 — CSS-first design tokens with Tailwind CSS 4

**Status:** accepted

## Context

Components need one source of truth for colors, type and spacing that switches between light, dark
and increased-contrast modes without `dark:` variants scattered through templates.

## Decision

`theme.css` defines semantic CSS variables (`--ui-label`, `--ui-grouped-row`, `--ui-tint`, …) per
mode and exposes them to Tailwind with `@theme inline`. Components only use semantic utilities.
A unit test computes WCAG contrast for every text/background pair, including text on translucent
tinted fills.

## Consequences

- Theme switching is a class on `<html>`; components never change.
- Tailwind users import the same tokens; others use the prebuilt `style.css`.
