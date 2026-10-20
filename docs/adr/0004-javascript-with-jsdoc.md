# 0004 — JavaScript with JSDoc, type-checked by vue-tsc

**Status:** accepted

## Context

The goal is type safety without a compile step in the authoring loop, in a codebase that teams used
to plain JavaScript can adopt incrementally.

## Decision

Source is JavaScript with JSDoc types, `checkJs` and `strict` enabled, checked by `vue-tsc` in CI.
TypeScript is pinned to 6.x: TypeScript 7 (the native compiler) does not yet expose the programmatic
API that Vue's type checker relies on.

## Consequences

- Generic composables (`useForm`, `useAsync`) are fully typed for consumers.
- Some JSDoc casts are more verbose than TypeScript syntax. Revisit when TypeScript 7.1 ships its API.
