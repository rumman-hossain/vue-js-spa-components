import { ADMIN, expect, navigate, signIn, test } from './fixtures.js'

test.describe('authentication', () => {
  test('protected pages redirect to sign-in and come back afterwards', async ({ page }) => {
    await page.goto('/users?page=2')
    await expect(page).toHaveURL(/\/sign-in\?redirect=/)
    await signIn(page, ADMIN, page.url())
    await expect(page).toHaveURL(/\/users\?page=2$/)
    await expect(page.getByRole('heading', { name: 'Users', level: 1 })).toBeVisible()
  })

  test('in-app navigation moves focus to the new page heading', async ({ page }) => {
    await signIn(page)
    await navigate(page, 'Users')
    await expect(page.getByRole('heading', { name: 'Users', level: 1 })).toBeFocused()
  })

  test('shows validation errors and moves focus to the first invalid field', async ({ page }) => {
    await page.goto('/sign-in')
    await page.getByRole('button', { name: 'Sign in' }).click()
    const email = page.getByRole('textbox', { name: 'Email' })
    await expect(email).toHaveAttribute('aria-invalid', 'true')
    await expect(email).toBeFocused()
    await expect(page.getByText('Enter a valid email address.')).toBeVisible()
  })

  test('wrong credentials show a translated error from the error code', async ({ page }) => {
    await page.goto('/sign-in')
    await page.getByRole('textbox', { name: 'Email' }).fill(ADMIN.email)
    await page.getByRole('textbox', { name: 'Password' }).fill('wrong-password')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByRole('alert').filter({ hasText: 'incorrect' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Password' })).toHaveValue('')
  })

  test('the session survives a reload without storing the token', async ({ page }) => {
    await signIn(page)
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible()

    const stored = await page.evaluate(() =>
      [localStorage, sessionStorage].flatMap((storage) =>
        Object.keys(storage).map((key) => `${key}=${storage.getItem(key)}`),
      ),
    )
    expect(stored.join(' ')).not.toMatch(/mock-access-/)
  })

  test('signing out returns to the sign-in page', async ({ page }) => {
    await signIn(page)
    await page.getByRole('button', { name: /Signed in as/ }).click()
    await page.getByRole('menuitem', { name: 'Sign out' }).click()
    await expect(page).toHaveURL(/\/sign-in/)
    await page.goto('/')
    await expect(page).toHaveURL(/\/sign-in/)
  })

  test('an open redirect target is ignored', async ({ page }) => {
    await page.goto('/sign-in?redirect=//evil.example')
    await signIn(page, ADMIN, page.url())
    await expect(page).toHaveURL(/localhost:\d+\/$/)
  })
})
