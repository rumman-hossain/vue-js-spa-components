import { expect, signIn, test } from './fixtures.js'

test.describe('error lab', () => {
  test.beforeEach(async ({ page }) => signIn(page, undefined, '/error-lab'))

  const result = (/** @type {import('@playwright/test').Page} */ page) =>
    page.getByRole('status').filter({ hasText: / ms$/ })

  test('a 500 on a read is retried and recovers', async ({ page }) => {
    await page.getByRole('button', { name: 'Send a test request' }).first().click()
    await expect(result(page)).toContainText('Request succeeded')
  })

  test('an expired access token is refreshed silently', async ({ page }) => {
    await page
      .getByRole('listitem')
      .filter({ hasText: 'Expire access token' })
      .getByRole('button')
      .click()
    await expect(result(page)).toContainText('Token was refreshed silently')
  })

  test('going offline shows a network message', async ({ page }) => {
    await page.getByRole('button', { name: 'Go offline' }).click()
    await expect(result(page)).toContainText('You appear to be offline')
    await page.getByRole('button', { name: 'Go back online' }).click()
  })

  test('a revoked session signs the user out', async ({ page }) => {
    await page.getByRole('listitem').filter({ hasText: 'End session' }).getByRole('button').click()
    await expect(page).toHaveURL(/\/sign-in/)
    await expect(
      page.getByRole('status').filter({ hasText: 'Your session has ended' }),
    ).toBeVisible()
  })

  test('a crashing component is contained by the error boundary', async ({ page }) => {
    await page.getByRole('button', { name: 'Crash a component' }).click()
    await expect(
      page.getByRole('alert').filter({ hasText: 'This section stopped working' }),
    ).toBeVisible()
    // The rest of the page keeps working.
    await expect(page.getByRole('heading', { name: 'Error lab', level: 1 })).toBeVisible()
    await page.getByRole('button', { name: 'Try again' }).first().click()
    await expect(page.getByText('Rendering normally')).toBeVisible()
  })
})
