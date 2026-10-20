import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { expectNoA11yViolations } from '../../../tests/a11y.js'
import Checkbox from './Checkbox.vue'

describe('Checkbox', () => {
  it('is a native checkbox labelled by its text', async () => {
    const { container } = render(Checkbox, {
      props: { label: 'Subscribe', description: 'Weekly, no spam' },
    })
    const checkbox = screen.getByRole('checkbox', { name: 'Subscribe' })
    expect(checkbox).not.toBeChecked()
    expect(checkbox).toHaveAccessibleDescription('Weekly, no spam')
    await expectNoA11yViolations(container)
  })

  it('toggles with click on the label and with Space', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    render(Checkbox, { props: { label: 'Subscribe', 'onUpdate:modelValue': onUpdate } })

    await user.click(screen.getByText('Subscribe'))
    expect(onUpdate).toHaveBeenLastCalledWith(true)

    await user.keyboard(' ')
    expect(onUpdate).toHaveBeenLastCalledWith(false)
    expect(screen.getByRole('checkbox', { name: 'Subscribe' })).toHaveFocus()
  })

  it('reflects the model and the indeterminate state', async () => {
    const { rerender } = render(Checkbox, {
      props: { modelValue: true },
      slots: { default: 'Select all' },
    })
    const checkbox = /** @type {HTMLInputElement} */ (
      screen.getByRole('checkbox', { name: 'Select all' })
    )
    expect(checkbox).toBeChecked()

    await rerender({ modelValue: false, indeterminate: true })
    expect(checkbox.indeterminate).toBe(true)
    expect(checkbox).toBePartiallyChecked()
    await rerender({ indeterminate: false })
    expect(checkbox.indeterminate).toBe(false)
  })

  it('passes name to the input and supports required and disabled', () => {
    render(Checkbox, {
      props: { label: 'Accept terms', required: true, disabled: true },
      attrs: { name: 'terms' },
    })
    const checkbox = screen.getByRole('checkbox', { name: 'Accept terms' })
    expect(checkbox).toHaveAttribute('name', 'terms')
    expect(checkbox).toBeRequired()
    expect(checkbox).toBeDisabled()
  })
})
