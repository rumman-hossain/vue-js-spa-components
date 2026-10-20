import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { h, markRaw } from 'vue'
import { expectNoA11yViolations } from '../../../tests/a11y.js'
import Menu from './Menu.vue'

const Icon = markRaw(() => h('svg', { 'data-testid': 'icon' }))

const items = [
  { id: 'edit', label: 'Edit', icon: Icon },
  { id: 'duplicate', label: 'Duplicate' },
  { id: 'archive', label: 'Archive', disabled: true },
  { id: 'delete', label: 'Delete', tone: /** @type {const} */ ('danger') },
]

function renderMenu(props = {}) {
  const onSelect = vi.fn()
  const utils = render({
    components: { Menu },
    setup: () => ({ items, onSelect, props }),
    template: `
      <Menu label="Actions" :items="items" v-bind="props" @select="onSelect" />
      <button type="button">After</button>
    `,
  })
  const trigger = screen.getByRole('button', { name: 'Actions' })
  return { ...utils, onSelect, trigger }
}

/** @param {string} name */
const item = (name) => screen.getByRole('menuitem', { name })

describe('Menu', () => {
  it('wires the menu button pattern', async () => {
    const user = userEvent.setup()
    const { container, trigger } = renderMenu()
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    await user.click(trigger)
    const menu = screen.getByRole('menu', { name: 'Actions' })
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(trigger).toHaveAttribute('aria-controls', menu.id)
    expect(screen.getAllByRole('menuitem')).toHaveLength(4)
    expect(item('Archive')).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByTestId('icon').parentElement).toHaveAttribute('aria-hidden', 'true')
    expect(item('Edit')).toHaveFocus()
    await expectNoA11yViolations(container)
  })

  it.each([
    ['{Enter}', 'Edit'],
    [' ', 'Edit'],
    ['{ArrowDown}', 'Edit'],
    ['{ArrowUp}', 'Delete'],
  ])('opens from the trigger with %s and focuses %s', async (key, expected) => {
    const user = userEvent.setup()
    const { trigger } = renderMenu()
    trigger.focus()
    await user.keyboard(key)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(item(expected)).toHaveFocus()
  })

  it('moves with arrows (wrapping), Home, End and typeahead', async () => {
    const user = userEvent.setup()
    const { trigger } = renderMenu()
    trigger.focus()
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{ArrowDown}')
    expect(item('Duplicate')).toHaveFocus()
    await user.keyboard('{ArrowUp}{ArrowUp}')
    expect(item('Delete')).toHaveFocus()
    await user.keyboard('{ArrowDown}')
    expect(item('Edit')).toHaveFocus()
    await user.keyboard('{End}')
    expect(item('Delete')).toHaveFocus()
    await user.keyboard('{Home}')
    expect(item('Edit')).toHaveFocus()
    await user.keyboard('d')
    expect(item('Duplicate')).toHaveFocus()
    await user.keyboard('d')
    expect(item('Delete')).toHaveFocus()
    await user.keyboard('a')
    expect(item('Archive')).toHaveFocus()
    await user.keyboard('z')
    expect(item('Archive')).toHaveFocus()
  })

  it('selects with Enter or click, closes and returns focus; ignores disabled items', async () => {
    const user = userEvent.setup()
    const { trigger, onSelect } = renderMenu()
    trigger.focus()
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}')
    expect(onSelect).toHaveBeenLastCalledWith('duplicate')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveFocus()

    await user.click(trigger)
    await user.click(item('Archive'))
    expect(onSelect).toHaveBeenCalledOnce()
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await user.click(item('Delete'))
    expect(onSelect).toHaveBeenLastCalledWith('delete')
  })

  it('closes with Escape (focus to trigger), Tab, outside press and a second click', async () => {
    const user = userEvent.setup()
    const { trigger } = renderMenu({ align: 'end', labelHidden: true })
    await user.click(trigger)
    await user.keyboard('{Escape}')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveFocus()

    await user.keyboard('{ArrowDown}')
    await user.tab()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus()

    await user.click(trigger)
    await user.click(screen.getByRole('button', { name: 'After' }))
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await user.click(trigger)
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })
})
