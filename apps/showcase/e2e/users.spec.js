import { expect, navigate, signIn, test, VIEWER } from './fixtures.js'

test.describe('users', () => {
  test('search, sort and paging live in the URL', async ({ page }) => {
    await signIn(page, undefined, '/users')
    await page.getByRole('searchbox', { name: 'Search users' }).fill('sato')
    await expect(page).toHaveURL(/search=sato/)
    await expect(page.getByRole('cell', { name: /sato/i }).first()).toBeVisible()

    await page.getByRole('button', { name: 'Name' }).click()
    await expect(page).toHaveURL(/sort=name/)
    await expect(page.getByRole('columnheader', { name: 'Name' })).toHaveAttribute(
      'aria-sort',
      /ascending|descending/,
    )

    // Filters use history.replace, so a reload or a shared link restores the same view.
    await page.reload()
    await expect(page.getByRole('searchbox', { name: 'Search users' })).toHaveValue('sato')
    await expect(page.getByRole('columnheader', { name: 'Name' })).toHaveAttribute(
      'aria-sort',
      /ascending|descending/,
    )
  })

  test('changing rows per page keeps it in the URL and resets to page 1', async ({ page }) => {
    await signIn(page, undefined, '/users?page=3')
    await page.getByRole('combobox', { name: 'Rows per page' }).selectOption('25')
    await expect(page).toHaveURL(/size=25/)
    await expect(page).not.toHaveURL(/page=3/)
    await expect(page.getByText('Showing 1–25 of 57')).toBeVisible()
  })

  test('only the table scrolls; the header row stays pinned', async ({ page }) => {
    await signIn(page, undefined, '/users?size=50')
    const region = page.getByRole('region', { name: 'Users' })
    await region.evaluate((element) => element.scrollTo({ top: 400 }))
    await expect(page.getByRole('columnheader', { name: 'Name' })).toBeInViewport()
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
  })

  test('imports users from a CSV with progress and a per-line report', async ({ page }) => {
    await signIn(page, undefined, '/users')
    await page.getByRole('button', { name: 'Import CSV' }).click()
    const sheet = page.getByRole('dialog', { name: 'Import users' })
    await sheet.getByLabel('CSV file').setInputFiles({
      name: 'new-users.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(
        'name,email,role\n高橋 美咲,misaki.e2e@example.com,viewer\n,bad@example.com,viewer\n',
      ),
    })
    await expect(sheet.getByText('new-users.csv')).toBeVisible()
    await sheet.getByRole('button', { name: 'Import', exact: true }).click()
    await expect(
      sheet.getByRole('status').filter({ hasText: '1 imported, 1 skipped.' }),
    ).toBeVisible()
    await expect(sheet.getByText('Line 3: missing name or invalid email')).toBeVisible()
    await expect(page.getByRole('status').filter({ hasText: '1 users imported' })).toBeVisible()
  })

  test('the upload rejects files that are not CSV', async ({ page }) => {
    await signIn(page, undefined, '/users')
    await page.getByRole('button', { name: 'Import CSV' }).click()
    const sheet = page.getByRole('dialog', { name: 'Import users' })
    await sheet
      .getByLabel('CSV file')
      .setInputFiles({ name: 'photo.png', mimeType: 'image/png', buffer: Buffer.from([1, 2, 3]) })
    await expect(
      sheet.getByRole('listitem').filter({ hasText: 'photo.png is not a CSV file.' }),
    ).toBeVisible()
  })

  test('paginates on the server', async ({ page }) => {
    await signIn(page, undefined, '/users')
    await expect(page.getByText('Showing 1–10 of 57')).toBeVisible()
    await page.getByRole('button', { name: 'Next' }).click()
    await expect(page).toHaveURL(/page=2/)
    await expect(page.getByText('Showing 11–20 of 57')).toBeVisible()
  })

  test('deletes a user after confirmation', async ({ page }) => {
    await signIn(page, undefined, '/users?search=hina')
    const firstDelete = page.getByRole('button', { name: /^Delete: / }).first()
    const label = await firstDelete.getAttribute('aria-label')
    const name = label?.replace('Delete: ', '') ?? ''

    await firstDelete.click()
    const dialog = page.getByRole('alertdialog')
    await expect(dialog).toContainText(`Delete ${name}?`)
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused()
    await dialog.getByRole('button', { name: 'Delete' }).click()

    await expect(page.getByRole('status').filter({ hasText: `${name} was deleted` })).toBeVisible()
  })

  test('creating a user validates on the server and maps field errors', async ({ page }) => {
    await signIn(page, undefined, '/users/new')
    await page.getByRole('textbox', { name: 'Full name' }).fill('Test Person')
    const email = page.getByRole('textbox', { name: 'Email' })
    await email.fill('viewer@example.com')
    await email.blur()
    await expect(page.getByText('This email is already registered.')).toBeVisible()

    await email.fill('test.person@example.com')
    const quota = page.getByRole('textbox', { name: 'Monthly request quota' })
    await quota.fill('')
    await quota.pressSequentially('１２３４５')
    await expect(quota).toHaveValue('12,345')

    await page.getByRole('button', { name: 'Create user' }).click()
    await expect(page).toHaveURL(/\/users$/)
    await expect(
      page.getByRole('status').filter({ hasText: 'Test Person was added' }),
    ).toBeVisible()
  })

  test('leaving a dirty form asks for confirmation', async ({ page }) => {
    await signIn(page, undefined, '/users/new')
    await page.getByRole('textbox', { name: 'Full name' }).fill('Unsaved')
    await navigate(page, 'Dashboard')
    const dialog = page.getByRole('alertdialog', { name: 'Leave without saving?' })
    await expect(dialog).toBeVisible()
    await dialog.getByRole('button', { name: 'Keep editing' }).click()
    await expect(page).toHaveURL(/\/users\/new/)
  })

  test('viewers get a read-only list and cannot open admin pages', async ({ page }) => {
    await signIn(page, VIEWER, '/users')
    await expect(page.getByText('You have read-only access.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Add user' })).toHaveCount(0)
    await page.goto('/users/new')
    await expect(page.getByRole('heading', { name: 'No access' })).toBeVisible()
  })

  test('the users flow works with the keyboard only', async ({ page, browserName, isMobile }) => {
    test.skip(isMobile, 'touch devices have no Tab key')
    // Safari only moves focus to links with Option+Tab unless the user changes a system setting.
    const tab = browserName === 'webkit' ? 'Alt+Tab' : 'Tab'
    await signIn(page, undefined, '/users')
    await page.reload() // start from a fresh page load, as a keyboard user arriving by URL would
    await expect(page.getByRole('heading', { name: 'Users', level: 1 })).toBeVisible()
    await page.keyboard.press(tab)
    await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.locator('#main')).toBeFocused()
    await page.getByRole('button', { name: 'Name' }).focus()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/sort=name/)
  })
})
