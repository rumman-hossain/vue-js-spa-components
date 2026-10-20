// The showcase has no direct axe-core dependency; reuse the copy installed for the library tests.
import axe from 'axe-core'
import { expect } from 'vitest'

/**
 * Runs axe-core against a rendered container and fails with a readable list of violations.
 * Copied from `packages/ui/tests/a11y.js`. Color contrast is skipped because jsdom does not compute
 * styles; contrast is covered by the library's token tests and the Playwright axe run.
 *
 * @param {Element} container
 */
export async function expectNoA11yViolations(container) {
  const { violations } = await axe.run(container, {
    rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
  })
  const summary = violations.map(
    (violation) =>
      `${violation.id} (${violation.impact}): ${violation.help}\n  ${violation.nodes
        .map((node) => node.target.join(' '))
        .join('\n  ')}`,
  )
  expect(summary, 'axe violations').toEqual([])
}
