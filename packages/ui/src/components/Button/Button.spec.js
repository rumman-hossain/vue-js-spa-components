import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { expectNoA11yViolations } from '../../../tests/a11y.js'
import Button from './Button.vue'

describe('Button', () => {
  it('renders a native button that does not submit forms by default', async () => {
    const { container } = render(Button, { slots: { default: 'Save' } })
    const button = screen.getByRole('button', { name: 'Save' })
    expect(button).toHaveAttribute('type', 'button')
    await expectNoA11yViolations(container)
  })

  it('accepts submit and reset types', () => {
    render(Button, { props: { type: 'submit' }, slots: { default: 'Send' } })
    expect(screen.getByRole('button', { name: 'Send' })).toHaveAttribute('type', 'submit')
  })

  it('activates with click, Enter and Space', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(Button, { attrs: { onClick }, slots: { default: 'Go' } })
    const button = screen.getByRole('button', { name: 'Go' })

    await user.tab()
    expect(button).toHaveFocus()
    await user.keyboard('{Enter}')
    await user.keyboard(' ')
    await user.click(button)
    expect(onClick).toHaveBeenCalledTimes(3)
  })

  it('keeps icons out of the accessible name', () => {
    render(Button, {
      slots: { default: 'Delete', leading: '<svg data-testid="lead" />', trailing: '<svg />' },
    })
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    expect(screen.getByTestId('lead').parentElement).toHaveAttribute('aria-hidden', 'true')
  })

  it('is disabled natively and ignores clicks', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(Button, { props: { disabled: true }, attrs: { onClick }, slots: { default: 'Save' } })
    const button = screen.getByRole('button', { name: 'Save' })
    expect(button).toBeDisabled()
    await user.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('marks itself busy while loading but keeps its name', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const { container } = render(Button, {
      props: { loading: true },
      attrs: { onClick },
      slots: { default: 'Save' },
    })
    const button = screen.getByRole('button', { name: 'Save' })
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button).toBeDisabled()
    // The spinner is decorative here: aria-busy already tells assistive technology.
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    await user.click(button)
    expect(onClick).not.toHaveBeenCalled()
    await expectNoA11yViolations(container)
  })

  it('renders a link when given href', async () => {
    const { container } = render(Button, {
      props: { href: '/docs', variant: 'plain' },
      slots: { default: 'Docs' },
    })
    const link = screen.getByRole('link', { name: 'Docs' })
    expect(link).toHaveAttribute('href', '/docs')
    expect(link).not.toHaveAttribute('type')
    await expectNoA11yViolations(container)
  })

  it('removes href from a disabled link and marks it disabled', () => {
    render(Button, { props: { href: '/docs', disabled: true }, slots: { default: 'Docs' } })
    const link = screen.getByRole('link', { name: 'Docs' })
    expect(link).not.toHaveAttribute('href')
    expect(link).toHaveAttribute('aria-disabled', 'true')
  })

  it.each(
    /** @type {const} */ ([
      ['filled', 'accent'],
      ['tinted', 'danger'],
      ['gray', 'accent'],
      ['plain', 'danger'],
    ]),
  )('renders the %s %s variant', (variant, tone) => {
    render(Button, { props: { variant, tone, size: 'lg', block: true }, slots: { default: 'Ok' } })
    expect(screen.getByRole('button', { name: 'Ok' })).toBeEnabled()
  })
})
