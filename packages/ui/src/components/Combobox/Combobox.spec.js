/* eslint-disable vue/one-component-per-file -- small test harness components, one per scenario */
import { fireEvent, render, screen, within } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import { expectNoA11yViolations } from '../../../tests/a11y.js'
import Combobox from './Combobox.vue'

const options = [
  { value: 'tokyo', label: 'Tokyo' },
  { value: 'osaka', label: 'Osaka' },
  { value: 'kyoto', label: 'Kyoto', disabled: true },
  { value: 'berlin', label: 'Berlin' },
]

/** @param {Record<string, unknown>} [props] */
function renderCombobox(props = {}) {
  const value = ref(/** @type {string | number | null} */ (null))
  const Harness = defineComponent({
    components: { Combobox },
    setup: () => ({ value, options, props }),
    template: `
      <form @submit.prevent>
        <Combobox v-model="value" label="City" :options="options" v-bind="props" />
        <button type="button">Next</button>
      </form>
    `,
  })
  const utils = render(Harness)
  const input = screen.getByRole('combobox', { name: 'City' })
  return { ...utils, value, input }
}

/** @param {string} name */
const option = (name) => screen.getByRole('option', { name })
const visibleOptions = () =>
  within(screen.getByRole('listbox', { hidden: true })).queryAllByRole('option')

describe('Combobox', () => {
  it('wires the combobox and listbox roles', async () => {
    const user = userEvent.setup()
    const { container, input } = renderCombobox({ hint: 'Where you live' })
    expect(input).toHaveAttribute('aria-autocomplete', 'list')
    expect(input).toHaveAttribute('aria-expanded', 'false')
    expect(input).toHaveAccessibleDescription('Where you live')
    const listbox = screen.getByRole('listbox', { hidden: true })
    expect(input).toHaveAttribute('aria-controls', listbox.id)
    expect(listbox).not.toBeVisible()
    await expectNoA11yViolations(container)

    await user.click(input)
    await user.keyboard('{ArrowDown}')
    expect(input).toHaveAttribute('aria-expanded', 'true')
    expect(listbox).toBeVisible()
    expect(option('Tokyo')).toHaveAttribute('aria-selected', 'true')
    expect(input).toHaveAttribute('aria-activedescendant', option('Tokyo').id)
    expect(option('Kyoto')).toHaveAttribute('aria-disabled', 'true')
    await expectNoA11yViolations(container)
  })

  it('moves the active option with wrap, skipping disabled, and selects with Enter', async () => {
    const user = userEvent.setup()
    const { input, value } = renderCombobox()
    await user.click(input)
    await user.keyboard('{ArrowUp}')
    expect(input).toHaveAttribute('aria-activedescendant', option('Berlin').id)
    await user.keyboard('{ArrowDown}')
    expect(input).toHaveAttribute('aria-activedescendant', option('Tokyo').id)
    await user.keyboard('{ArrowDown}{ArrowDown}')
    expect(input).toHaveAttribute('aria-activedescendant', option('Berlin').id)
    await user.keyboard('{ArrowUp}')
    expect(input).toHaveAttribute('aria-activedescendant', option('Osaka').id)

    await user.keyboard('{Enter}')
    expect(value.value).toBe('osaka')
    expect(input).toHaveValue('Osaka')
    expect(input).toHaveAttribute('aria-expanded', 'false')
    expect(input).not.toHaveAttribute('aria-activedescendant')

    // Alt+ArrowDown only opens the list.
    await user.keyboard('{Alt>}{ArrowDown}{/Alt}')
    expect(input).toHaveAttribute('aria-expanded', 'true')
    expect(input).not.toHaveAttribute('aria-activedescendant')
    // Enter without an active option does nothing.
    await user.keyboard('{Enter}')
    expect(value.value).toBe('osaka')
  })

  it('filters case-insensitively and announces when nothing matches', async () => {
    const user = userEvent.setup()
    const { input } = renderCombobox()
    await user.type(input, 'O')
    expect(visibleOptions().map((element) => element.textContent?.trim())).toEqual([
      'Tokyo',
      'Osaka',
      'Kyoto',
    ])
    await user.type(input, 'SA')
    expect(visibleOptions().map((element) => element.textContent?.trim())).toEqual(['Osaka'])

    await user.type(input, 'xyz')
    expect(screen.getByRole('status')).toHaveTextContent('No results')
    expect(screen.getByRole('listbox', { hidden: true })).not.toBeVisible()
    await user.keyboard('{ArrowDown}{Enter}')
  })

  it('does not filter in the middle of an IME composition', async () => {
    const { input } = renderCombobox({
      options: [
        { value: 'tokyo', label: '東京' },
        { value: 'kyoto', label: '京都' },
      ],
    })
    await fireEvent.compositionStart(input)
    await fireEvent.update(input, 'とう')
    expect(input).toHaveAttribute('aria-expanded', 'false')
    await fireEvent.keyDown(input, { key: 'Enter', isComposing: true })
    await fireEvent.keyDown(input, { key: 'Enter' })

    const field = /** @type {HTMLInputElement} */ (input)
    field.value = '東'
    await fireEvent.compositionEnd(input)
    expect(input).toHaveAttribute('aria-expanded', 'true')
    expect(visibleOptions().map((element) => element.textContent?.trim())).toEqual(['東京'])

    await fireEvent.input(input, { isComposing: true })
    expect(visibleOptions()).toHaveLength(1)
  })

  it('closes with Escape, then clears with a second Escape', async () => {
    const user = userEvent.setup()
    const { input, value } = renderCombobox()
    await user.click(input)
    await user.keyboard('{ArrowDown}{Enter}')
    expect(value.value).toBe('tokyo')

    await user.type(input, 'x')
    expect(input).toHaveAttribute('aria-expanded', 'true')
    await user.keyboard('{Escape}')
    expect(input).toHaveAttribute('aria-expanded', 'false')
    expect(input).toHaveValue('Tokyox')
    await user.keyboard('{Escape}')
    expect(input).toHaveValue('')
    expect(value.value).toBeNull()
    // Nothing left to clear: Escape is not consumed.
    await user.keyboard('{Escape}')
  })

  it('Tab closes without selecting and blur restores the selected label', async () => {
    const user = userEvent.setup()
    const { input, value } = renderCombobox()
    value.value = 'berlin'
    await vi.waitFor(() => expect(input).toHaveValue('Berlin'))
    await user.clear(input)
    await user.type(input, 'tok')
    await user.keyboard('{ArrowDown}')
    await user.tab()
    expect(value.value).toBe('berlin')
    expect(input).toHaveValue('Berlin')
    expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus()
  })

  it('selects with the pointer and ignores disabled options', async () => {
    const user = userEvent.setup()
    const { input, value } = renderCombobox({ error: 'Pick a city' })
    expect(input).toBeInvalid()
    await user.click(screen.getByRole('button', { name: 'Show options' }))
    expect(input).toHaveFocus()
    expect(input).toHaveAttribute('aria-expanded', 'true')
    await user.click(option('Kyoto'))
    expect(value.value).toBeNull()
    await user.click(option('Berlin'))
    expect(value.value).toBe('berlin')

    await user.click(screen.getByRole('button', { name: 'Show options' }))
    // The selected option carries a decorative check mark.
    expect(option('Berlin').querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(option('Tokyo').querySelector('svg')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Show options' }))
    expect(input).toHaveAttribute('aria-expanded', 'false')
  })

  it('handles an empty option list and exposes focus()', async () => {
    const field = ref(/** @type {InstanceType<typeof Combobox> | null} */ (null))
    const Harness = defineComponent({
      components: { Combobox },
      setup: () => ({ field }),
      template: `<Combobox ref="field" label="Empty" :options="[]" />`,
    })
    const user = userEvent.setup()
    render(Harness)
    field.value?.focus()
    const input = screen.getByRole('combobox', { name: 'Empty' })
    expect(input).toHaveFocus()
    await user.keyboard('{ArrowDown}')
    expect(input).not.toHaveAttribute('aria-activedescendant')
    expect(screen.getByRole('status')).toHaveTextContent('No results')
  })
})
