import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { expectNoA11yViolations } from '../../../tests/a11y.js'
import Select from './Select.vue'

const options = [
  { value: 'jp', label: 'Japan' },
  { value: 'us', label: 'United States' },
  { value: 'xx', label: 'Unavailable', disabled: true },
]

describe('Select', () => {
  it('is a labelled native select with a placeholder', async () => {
    const { container } = render(Select, {
      props: { label: 'Country', options, placeholder: 'Choose a country' },
    })
    const select = screen.getByRole('combobox', { name: 'Country' })
    expect(screen.getByRole('option', { name: 'Choose a country' })).toBeDisabled()
    expect(screen.getByRole('option', { name: 'Unavailable' })).toBeDisabled()
    expect(select).toHaveDisplayValue('Choose a country')
    await expectNoA11yViolations(container)
  })

  it('emits the selected option value', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    render(Select, { props: { label: 'Country', options, 'onUpdate:modelValue': onUpdate } })
    await user.selectOptions(screen.getByRole('combobox', { name: 'Country' }), 'United States')
    expect(onUpdate).toHaveBeenLastCalledWith('us')
  })

  it('keeps numeric values as numbers and follows the parent', async () => {
    const onUpdate = vi.fn()
    const user = userEvent.setup()
    const { rerender } = render(Select, {
      props: {
        label: 'Size',
        options: [
          { value: 1, label: 'Small' },
          { value: 2, label: 'Large' },
        ],
        modelValue: 1,
        'onUpdate:modelValue': onUpdate,
      },
    })
    const select = screen.getByRole('combobox', { name: 'Size' })
    expect(select).toHaveDisplayValue('Small')
    await user.selectOptions(select, 'Large')
    expect(onUpdate).toHaveBeenLastCalledWith(2)
    await rerender({ modelValue: 2 })
    expect(select).toHaveDisplayValue('Large')
  })

  it('wires hint, error, required and disabled', async () => {
    const onBlur = vi.fn()
    const user = userEvent.setup()
    const { rerender } = render(Select, {
      props: {
        label: 'Country',
        options,
        hint: 'Where you live',
        error: 'Required',
        required: true,
      },
      attrs: { onBlur },
    })
    const select = screen.getByRole('combobox', { name: 'Country' })
    expect(select).toBeInvalid()
    expect(select).toBeRequired()
    expect(select).toHaveAccessibleDescription('Required Where you live')
    await user.click(select)
    await user.tab()
    expect(onBlur).toHaveBeenCalledOnce()

    await rerender({ disabled: true })
    expect(select).toBeDisabled()
  })
})
