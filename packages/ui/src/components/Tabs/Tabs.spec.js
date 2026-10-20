import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { expectNoA11yViolations } from '../../../tests/a11y.js'
import Tabs from './Tabs.vue'

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'activity', label: 'Activity' },
  { id: 'billing', label: 'Billing', disabled: true },
  { id: 'settings', label: 'Settings' },
]

const slots = {
  'panel-overview': '<p>Overview content</p>',
  'panel-activity': '<p>Activity content</p>',
  'panel-settings': '<p>Settings content</p>',
}

/** @param {Record<string, unknown>} [props] */
function renderTabs(props = {}) {
  const onUpdate = vi.fn()
  const utils = render(Tabs, {
    props: { tabs, label: 'Project', 'onUpdate:modelValue': onUpdate, ...props },
    slots,
  })
  return { ...utils, onUpdate }
}

/** @param {string} name */
const tab = (name) => screen.getByRole('tab', { name })

describe('Tabs', () => {
  it('wires tablist, tabs and panels', async () => {
    const { container } = renderTabs()
    expect(screen.getByRole('tablist', { name: 'Project' })).toBeInTheDocument()
    expect(tab('Overview')).toHaveAttribute('aria-selected', 'true')
    expect(tab('Overview')).toHaveAttribute('tabindex', '0')
    expect(tab('Activity')).toHaveAttribute('aria-selected', 'false')
    expect(tab('Activity')).toHaveAttribute('tabindex', '-1')

    const panel = screen.getByRole('tabpanel', { name: 'Overview' })
    expect(tab('Overview')).toHaveAttribute('aria-controls', panel.id)
    expect(panel).toHaveTextContent('Overview content')
    expect(screen.getByText('Activity content').parentElement).not.toBeVisible()
    await expectNoA11yViolations(container)
  })

  it('selects on arrow keys with wrap, skipping disabled tabs, and Home/End', async () => {
    const user = userEvent.setup()
    const { onUpdate } = renderTabs()
    await user.tab()
    expect(tab('Overview')).toHaveFocus()

    await user.keyboard('{ArrowRight}')
    expect(tab('Activity')).toHaveFocus()
    expect(tab('Activity')).toHaveAttribute('aria-selected', 'true')
    expect(onUpdate).toHaveBeenLastCalledWith('activity')

    await user.keyboard('{ArrowRight}')
    expect(tab('Settings')).toHaveFocus()
    await user.keyboard('{ArrowRight}')
    expect(tab('Overview')).toHaveFocus()
    await user.keyboard('{ArrowLeft}')
    expect(tab('Settings')).toHaveFocus()
    await user.keyboard('{Home}')
    expect(tab('Overview')).toHaveFocus()
    await user.keyboard('{End}')
    expect(tab('Settings')).toHaveFocus()
    expect(screen.getByRole('tabpanel', { name: 'Settings' })).toHaveTextContent('Settings content')

    // Tab moves from the tab list into the active panel.
    await user.tab()
    expect(screen.getByRole('tabpanel', { name: 'Settings' })).toHaveFocus()
    // Other keys are ignored.
    tab('Settings').focus()
    await user.keyboard('{ArrowDown}')
    expect(tab('Settings')).toHaveFocus()
  })

  it('follows v-model, selects on click and falls back from disabled ids', async () => {
    const user = userEvent.setup()
    const { rerender, onUpdate } = renderTabs({ modelValue: 'activity' })
    expect(tab('Activity')).toHaveAttribute('aria-selected', 'true')

    await user.click(tab('Settings'))
    expect(onUpdate).toHaveBeenLastCalledWith('settings')

    await rerender({ modelValue: 'billing' })
    expect(tab('Overview')).toHaveAttribute('aria-selected', 'true')
  })

  it('stays put when every other tab is disabled', async () => {
    const user = userEvent.setup()
    renderTabs({
      tabs: [
        { id: 'only', label: 'Only' },
        { id: 'off', label: 'Off', disabled: true },
      ],
    })
    await user.tab()
    await user.keyboard('{ArrowRight}')
    expect(tab('Only')).toHaveFocus()
  })
})
