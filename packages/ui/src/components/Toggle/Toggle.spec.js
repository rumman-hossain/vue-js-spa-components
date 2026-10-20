import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { expectNoA11yViolations } from '../../../tests/a11y.js'
import Toggle from './Toggle.vue'

describe('Toggle', () => {
  it('is a switch named by its visible label and described by its description', async () => {
    const { container } = render(Toggle, {
      props: { label: 'Notifications', description: 'Alerts and sounds' },
    })
    const toggle = screen.getByRole('switch', { name: 'Notifications' })
    expect(toggle).toHaveAttribute('aria-checked', 'false')
    expect(toggle).toHaveAccessibleDescription('Alerts and sounds')
    await expectNoA11yViolations(container)
  })

  it('toggles with click, Space and Enter', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    render(Toggle, { props: { label: 'Notifications', 'onUpdate:modelValue': onUpdate } })
    const toggle = screen.getByRole('switch', { name: 'Notifications' })

    await user.click(toggle)
    expect(onUpdate).toHaveBeenLastCalledWith(true)
    expect(toggle).toHaveAttribute('aria-checked', 'true')

    await user.keyboard(' ')
    expect(onUpdate).toHaveBeenLastCalledWith(false)
    await user.keyboard('{Enter}')
    expect(onUpdate).toHaveBeenLastCalledWith(true)
  })

  it('reflects the model from the parent and accepts a label slot', async () => {
    const { rerender } = render(Toggle, {
      props: { modelValue: true },
      slots: { default: 'Auto-update' },
    })
    const toggle = screen.getByRole('switch', { name: 'Auto-update' })
    expect(toggle).toBeChecked()
    await rerender({ modelValue: false })
    expect(toggle).not.toBeChecked()
  })

  it('does nothing when disabled', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    render(Toggle, {
      props: { label: 'Notifications', disabled: true, 'onUpdate:modelValue': onUpdate },
    })
    const toggle = screen.getByRole('switch', { name: 'Notifications' })
    expect(toggle).toBeDisabled()
    await user.click(toggle)
    expect(onUpdate).not.toHaveBeenCalled()
  })
})
