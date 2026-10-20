import AxeBuilder from '@axe-core/playwright'
import { expect, test as base } from '@playwright/test'

export const ADMIN = { email: 'admin@example.com', password: 'demo-password' }
export const VIEWER = { email: 'viewer@example.com', password: 'demo-password' }

/**
 * @param {import('@playwright/test').Page} page
 * @param {{ email: string, password: string }} [account]
 * @param {string} [path]
 */
export async function signIn(page, account = ADMIN, path = '/') {
  // Public pages do not redirect, so always start from the sign-in page with an explicit target.
  const target = path.startsWith('http')
    ? (new URL(path).searchParams.get('redirect') ?? '/')
    : path
  await page.goto(`/sign-in?redirect=${encodeURIComponent(target)}`)
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
  await page.getByRole('textbox', { name: 'Email' }).fill(account.email)
  await page.getByRole('textbox', { name: 'Password' }).fill(account.password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeHidden()
}

/**
 * Follows a sidebar link. On narrow screens the sidebar is off-canvas, so open it first.
 * @param {import('@playwright/test').Page} page
 * @param {string} name
 */
export async function navigate(page, name) {
  const menu = page.getByRole('button', { name: 'Open navigation' })
  if (await menu.isVisible()) await menu.click()
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name }).click()
}

/**
 * Runs axe against WCAG 2.x A/AA rules and fails with a readable summary.
 * @param {import('@playwright/test').Page} page
 */
export async function expectAccessible(page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze()
  const violations = results.violations
    .filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))
    .flatMap((violation) =>
      violation.nodes.map(
        (node) =>
          `${violation.id}: ${node.target.join(' ')} — ${node.failureSummary?.split('\n').pop()?.trim()}`,
      ),
    )
  expect(violations).toEqual([])
}

export const test = base.extend({
  // Every test starts in English regardless of the machine's language.
  locale: 'en-US',
})

export { expect }
