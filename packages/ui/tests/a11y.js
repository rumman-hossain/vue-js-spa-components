import axe from 'axe-core'
import { expect } from 'vitest'

/**
 * Runs axe-core against a rendered container and fails with a readable list of violations.
 * Color contrast is skipped because jsdom does not compute styles; contrast is covered by
 * `tokens.spec.js` and by the Playwright axe run in real browsers.
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
