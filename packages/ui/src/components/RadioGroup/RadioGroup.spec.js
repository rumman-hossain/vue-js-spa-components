import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { expectNoA11yViolations } from '../../../tests/a11y.js'
import RadioGroup from './RadioGroup.vue'

const options = [
  { value: 'standard', label: 'Standard', description: '3–5 days' },
  { value: 'express', label: 'Express' },
  { value: 'drone', label: 'Drone', disabled: true },
]

describe('RadioGroup', () => {
  it('is a fieldset named by its legend', async () => {
    const { container } = render(RadioGroup, {
      props: { label: 'Shipping', options, hint: 'Choose one' },
    })
    const group = screen.getByRole('group', { name: 'Shipping' })
    expect(group).toHaveAccessibleDescription('Choose one')
    expect(screen.getByRole('radio', { name: 'Standard' })).toHaveAccessibleDescription('3–5 days')
    expect(screen.getByRole('radio', { name: 'Drone' })).toBeDisabled()
    await expectNoA11yViolations(container)
  })

  it('selects with click and arrow keys', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    render(RadioGroup, {
      props: { label: 'Shipping', options, 'onUpdate:modelValue': onUpdate },
    })
    await user.click(screen.getByRole('radio', { name: 'Standard' }))
    expect(onUpdate).toHaveBeenLastCalledWith('standard')

    await user.keyboard('{ArrowDown}')
    expect(onUpdate).toHaveBeenLastCalledWith('express')
    expect(screen.getByRole('radio', { name: 'Express' })).toHaveFocus()
  })

  it('reflects the model, shares one name and supports a custom name', async () => {
    const { rerender } = render(RadioGroup, {
      props: { label: 'Shipping', options, modelValue: 'express', name: 'shipping' },
    })
    expect(screen.getByRole('radio', { name: 'Express' })).toBeChecked()
    for (const radio of screen.getAllByRole('radio'))
      expect(radio).toHaveAttribute('name', 'shipping')

    await rerender({ modelValue: 'standard' })
    expect(screen.getByRole('radio', { name: 'Standard' })).toBeChecked()
  })

  it('reports errors, disables all options and lays out horizontally', async () => {
    const { container } = render(RadioGroup, {
      props: {
        label: 'Shipping',
        labelHidden: true,
        options,
        error: 'Pick a method',
        disabled: true,
        required: true,
        orientation: 'horizontal',
      },
    })
    const group = screen.getByRole('group', { name: 'Shipping' })
    expect(group).toHaveAccessibleDescription('Pick a method')
    expect(group).toHaveAttribute('aria-invalid', 'true')
    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).toBeDisabled()
      expect(radio).toBeRequired()
    }
    await expectNoA11yViolations(container)
  })
})
