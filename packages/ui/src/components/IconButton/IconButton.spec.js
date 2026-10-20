import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { expectNoA11yViolations } from '../../../tests/a11y.js'
import IconButton from './IconButton.vue'

describe('IconButton', () => {
  it('uses the label as its accessible name and hides the icon', async () => {
    const { container } = render(IconButton, {
      props: { label: 'Close' },
      slots: { default: '<svg data-testid="icon" />' },
    })
    expect(screen.getByRole('button', { name: 'Close' })).toHaveAttribute('type', 'button')
    expect(screen.getByTestId('icon').parentElement).toHaveAttribute('aria-hidden', 'true')
    await expectNoA11yViolations(container)
  })

  it('can be operated with the keyboard', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(IconButton, { props: { label: 'Add', variant: 'filled' }, attrs: { onClick } })
    await user.tab()
    expect(screen.getByRole('button', { name: 'Add' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('forwards aria-pressed for toggle buttons', () => {
    render(IconButton, { props: { label: 'Bold', size: 'sm' }, attrs: { 'aria-pressed': 'true' } })
    expect(screen.getByRole('button', { name: 'Bold', pressed: true })).toBeInTheDocument()
  })

  it('supports the disabled state', () => {
    render(IconButton, { props: { label: 'Delete', tone: 'danger', size: 'lg', disabled: true } })
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled()
  })
})
