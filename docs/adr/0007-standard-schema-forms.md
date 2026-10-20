# 0007 — `useForm` accepts any Standard Schema validator

**Status:** accepted

## Context

Binding the library to one validation package forces that choice on every consumer.

## Decision

`useForm` calls `schema['~standard'].validate()` from the [Standard Schema](https://standardschema.dev)
spec, implemented by zod 4, Valibot and ArkType. The app uses zod; the library has no validation
dependency. Errors appear after blur or the first submit, server `422` codes map onto fields, and
focus moves to the first invalid field.

## Consequences

- The library's own tests use a tiny hand-written schema.
- Async rules (email availability) are separate `asyncValidators`, because schemas run synchronously
  on every keystroke.
