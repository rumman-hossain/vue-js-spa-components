import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { expectNoA11yViolations } from '../../../tests/a11y.js'
import ErrorState from './ErrorState.vue'

describe('ErrorState', () => {
  it('shows a default title and a retry button that emits retry', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const { container } = render(ErrorState, {
      props: { message: 'The server did not respond.', onRetry },
    })
    expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument()
    expect(screen.getByText('The server did not respond.')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    await user.tab()
    await user.keyboard('{Enter}')
    expect(onRetry).toHaveBeenCalledOnce()
    await expectNoA11yViolations(container)
  })

  it('can announce itself as an alert with custom text', async () => {
    const { container } = render(ErrorState, {
      props: { alert: true, title: 'Offline', retryLabel: 'Reload', headingLevel: 3 },
    })
    expect(screen.getByRole('alert')).toHaveTextContent('Offline')
    expect(screen.getByRole('heading', { level: 3, name: 'Offline' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument()
    await expectNoA11yViolations(container)
  })

  it('shows progress while retrying and hides the button for an empty label', async () => {
    const { rerender } = render(ErrorState, { props: { retrying: true } })
    expect(screen.getByRole('button', { name: 'Try again' })).toHaveAttribute('aria-busy', 'true')
    await rerender({ retryLabel: '' })
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('supports a level 1 heading for full-page errors', () => {
    render(ErrorState, { props: { title: 'Page failed to load', headingLevel: 1 } })
    expect(
      screen.getByRole('heading', { level: 1, name: 'Page failed to load' }),
    ).toBeInTheDocument()
  })
})
