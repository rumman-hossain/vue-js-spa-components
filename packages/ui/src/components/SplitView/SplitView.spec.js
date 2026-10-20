import { render, screen, within } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { expectNoA11yViolations } from '../../../tests/a11y.js'
import Sidebar from '../Sidebar/Sidebar.vue'
import Toolbar from '../Toolbar/Toolbar.vue'
import SplitView from './SplitView.vue'

const sections = [{ id: 'main', items: [{ id: 'home', label: 'Home', href: '#home' }] }]

/** @type {((event: { matches: boolean }) => void) | undefined} */
let onWideChange

function mockMatchMedia() {
  const removeEventListener = vi.fn()
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: (
      /** @type {string} */ _type,
      /** @type {(event: { matches: boolean }) => void} */ listener,
    ) => (onWideChange = listener),
    removeEventListener,
  })
  return { removeEventListener }
}

function renderShell(toolbarProps = {}) {
  const open = ref(false)
  const Harness = defineComponent({
    components: { SplitView, Sidebar, Toolbar },
    setup: () => ({ open, sections, toolbarProps }),
    template: `
      <SplitView v-model:sidebar-open="open" sidebar-label="Navigation">
        <template #sidebar><Sidebar label="Main" :sections="sections" /></template>
        <template #toolbar><Toolbar title="Home" v-bind="toolbarProps" /></template>
        <template #default="{ openSidebar }">
          <p>Content</p>
          <button type="button" @click="openSidebar">Menu</button>
        </template>
      </SplitView>
    `,
  })
  return { ...render(Harness), open }
}

describe('SplitView', () => {
  afterEach(() => {
    // @ts-expect-error -- jsdom has no matchMedia; each test installs its own.
    delete window.matchMedia
    onWideChange = undefined
  })

  it('lays out a sidebar column, toolbar and main landmark', async () => {
    const { container } = renderShell()
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main')
    expect(screen.getByRole('main')).toHaveTextContent('Content')
    expect(container.querySelector('[data-sidebar-column]')).toHaveClass('hidden', 'lg:block')
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Show sidebar' })).toHaveClass('lg:hidden')
    await expectNoA11yViolations(container)
  })

  it('opens the sidebar as a modal panel and returns focus when it closes', async () => {
    const user = userEvent.setup()
    const { open } = renderShell()
    const toggle = screen.getByRole('button', { name: 'Show sidebar' })
    await user.click(toggle)
    const panel = screen.getByRole('dialog', { name: 'Navigation' })
    expect(panel).toHaveFocus()
    expect(within(panel).getByRole('link', { name: 'Home' })).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(open.value).toBe(false)
    expect(toggle).toHaveFocus()
  })

  it('closes after following a link inside the panel', async () => {
    const user = userEvent.setup()
    const { open } = renderShell()
    await user.click(screen.getByRole('button', { name: 'Menu' }))
    const panel = screen.getByRole('dialog', { name: 'Navigation' })
    await user.click(within(panel).getByText('Home').closest('nav') ?? panel)
    expect(open.value).toBe(true)
    await user.click(within(panel).getByRole('link', { name: 'Home' }))
    expect(open.value).toBe(false)
  })

  it('closes the panel when the screen becomes wide and cleans up', async () => {
    const { removeEventListener } = mockMatchMedia()
    const { open, unmount } = renderShell({ sidebarToggle: false })
    expect(screen.queryByRole('button', { name: 'Show sidebar' })).not.toBeInTheDocument()
    open.value = true
    await nextTick()
    onWideChange?.({ matches: false })
    expect(open.value).toBe(true)
    onWideChange?.({ matches: true })
    expect(open.value).toBe(false)
    unmount()
    expect(removeEventListener).toHaveBeenCalled()
  })
})
