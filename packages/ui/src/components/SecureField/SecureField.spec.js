import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { expectNoA11yViolations } from '../../../tests/a11y.js'
import SecureField from './SecureField.vue'

describe('SecureField', () => {
  it('renders a password input with a reveal toggle', async () => {
    const { container } = render(SecureField, { props: { label: 'Password' } })
    const input = screen.getByLabelText('Password')
    expect(input).toHaveAttribute('type', 'password')
    expect(input).toHaveAttribute('autocomplete', 'current-password')
    expect(screen.getByRole('button', { name: 'Show password', pressed: false })).toBeVisible()
    await expectNoA11yViolations(container)
  })

  it('reveals and hides the password, reporting the state with aria-pressed', async () => {
    const user = userEvent.setup()
    render(SecureField, { props: { label: 'Password' } })
    const input = screen.getByLabelText('Password')
    const toggle = screen.getByRole('button', { name: 'Show password' })

    await user.click(toggle)
    expect(input).toHaveAttribute('type', 'text')
    expect(toggle).toHaveAttribute('aria-pressed', 'true')

    await user.keyboard('{Enter}')
    expect(input).toHaveAttribute('type', 'password')
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
  })

  it('supports v-model, blur and new-password autocomplete', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    const onBlur = vi.fn()
    render(SecureField, {
      props: {
        label: 'New password',
        autocomplete: 'new-password',
        'onUpdate:modelValue': onUpdate,
      },
      attrs: { onBlur },
    })
    const input = screen.getByLabelText('New password')
    expect(input).toHaveAttribute('autocomplete', 'new-password')
    await user.type(input, 's3cret')
    expect(onUpdate).toHaveBeenLastCalledWith('s3cret')
    await user.tab()
    expect(onBlur).toHaveBeenCalledOnce()
  })

  it('disables the toggle with the field', () => {
    render(SecureField, { props: { label: 'Password', disabled: true, toggleLabel: 'Reveal' } })
    expect(screen.getByLabelText('Password')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Reveal' })).toBeDisabled()
  })
})
