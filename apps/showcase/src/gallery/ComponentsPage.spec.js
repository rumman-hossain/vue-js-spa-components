import { ConfirmProvider, ToastProvider } from '@vue-js-spa-components/ui'
import { render, screen, waitFor, within } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createAppI18n } from '@/i18n/index.js'
import ComponentsPage from '@/pages/ComponentsPage.vue'
import { entries } from './entries.js'
import { expectNoA11yViolations } from './testing/a11y.js'

/** The page as App.vue renders it: inside the toast and confirm providers some demos need. */
const Harness = defineComponent({
  setup: () => () =>
    h(ToastProvider, null, () => h(ConfirmProvider, null, () => h(ComponentsPage))),
})

async function renderPage() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/components', name: 'components', component: ComponentsPage }],
  })
  await router.push('/components')
  await router.isReady()
  const user = userEvent.setup()
  const result = render(Harness, { global: { plugins: [createAppI18n('en'), router] } })
  // Demos are async chunks; wait until every one has replaced its loading skeleton.
  await waitFor(() => expect(result.container.querySelector('[data-demo-loading]')).toBeNull(), {
    timeout: 10_000,
  })
  return { ...result, user }
}

/** @param {string} name */
const sectionHeading = (name) => screen.queryByRole('heading', { level: 2, name })

describe('ComponentsPage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders a section, an index link and a live demo for every entry', async () => {
    const { container } = await renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'Components' })).toBeInTheDocument()
    const index = screen.getByRole('navigation', { name: 'Component categories' })
    for (const entry of entries) {
      const section = container.querySelector(`section#${entry.id}`)
      expect(section, entry.id).not.toBeNull()
      expect(within(index).getByRole('link', { name: entry.name })).toHaveAttribute(
        'href',
        `#${entry.id}`,
      )
    }
    // No demo crashed into its ErrorBoundary fallback.
    expect(screen.queryByText('This section stopped working')).not.toBeInTheDocument()
  }, 30_000)

  it('filters the sections with the search field', async () => {
    const { user } = await renderPage()

    await user.type(screen.getByRole('searchbox', { name: 'Filter components' }), 'number')

    await waitFor(() => expect(sectionHeading('Button')).not.toBeInTheDocument())
    expect(sectionHeading('NumberField')).toBeInTheDocument()
    expect(screen.getByText(`1 of ${entries.length} shown`)).toBeInTheDocument()

    await user.clear(screen.getByRole('searchbox', { name: 'Filter components' }))
    await user.type(screen.getByRole('searchbox', { name: 'Filter components' }), 'qwertyuiop')
    expect(
      await screen.findByRole('heading', { name: 'Nothing matches “qwertyuiop”' }),
    ).toBeInTheDocument()
  }, 30_000)

  it('copies the usage code and announces it', async () => {
    const { user } = await renderPage()
    // user-event installs its own clipboard stub during setup; replace it afterwards.
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })

    const section = within(/** @type {HTMLElement} */ (document.getElementById('button')))
    await user.click(section.getByRole('button', { name: 'Copy code' }))

    expect(writeText).toHaveBeenCalledWith(entries.find((entry) => entry.id === 'button')?.code)
    expect(await section.findByRole('status')).toHaveTextContent('Copied')
  }, 30_000)

  it('explains a failed copy instead of failing silently', async () => {
    const { user } = await renderPage()
    const writeText = vi.fn().mockRejectedValue(new DOMException('Denied', 'NotAllowedError'))
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })

    const section = within(/** @type {HTMLElement} */ (document.getElementById('badge')))
    await user.click(section.getByRole('button', { name: 'Copy code' }))

    expect(await section.findByText(/Could not copy/)).toBeInTheDocument()
  }, 30_000)

  it('has no axe violations', async () => {
    const { container } = await renderPage()
    await expectNoA11yViolations(container)
  }, 60_000)
})
