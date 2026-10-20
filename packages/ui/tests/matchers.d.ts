// jest-dom 7 augments Vitest's old single-generic `Assertion`. Vitest 5 expects custom matchers
// on `Matchers<R, T>`, so the DOM matchers are registered there instead.
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers'

declare module 'vitest' {
  interface Matchers<
    R extends void | Promise<void> = void | Promise<void>,
    T = unknown,
  > extends TestingLibraryMatchers<unknown, R> {}
}
