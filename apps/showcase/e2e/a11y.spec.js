import { expect, expectAccessible, signIn, test } from './fixtures.js'

const PAGES = [
  { path: '/', heading: 'Dashboard' },
  { path: '/users', heading: 'Users' },
  { path: '/users/new', heading: 'New user' },
  { path: '/error-lab', heading: 'Error lab' },
  { path: '/components', heading: 'Components' },
  { path: '/security', heading: 'Security' },
  { path: '/settings', heading: 'Settings' },
  { path: '/does-not-exist', heading: 'Page not found' },
]

for (const colorScheme of /** @type {const} */ (['light', 'dark'])) {
  test.describe(`accessibility (${colorScheme}) @a11y`, () => {
    test.use({ colorScheme })

    test('sign-in page has no serious violations', async ({ page }) => {
      await page.goto('/sign-in')
      await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
      await expectAccessible(page)
    })

    for (const { path, heading } of PAGES) {
      test(`${path} has no serious violations`, async ({ page }) => {
        await signIn(page, undefined, path)
        await expect(page.getByRole('heading', { name: heading, level: 1 })).toBeVisible()
        await page.waitForLoadState('networkidle')
        await expectAccessible(page)
      })
    }
  })
}

test('Japanese locale switches copy and the document language @a11y', async ({ page }) => {
  await signIn(page, undefined, '/settings')
  await page.locator('label').filter({ hasText: '日本語' }).click()
  await expect(page.getByRole('radio', { name: '日本語' })).toBeChecked()
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja')
  await expect(page.getByRole('heading', { name: '設定', level: 1 })).toBeVisible()
  await expectAccessible(page)
})
