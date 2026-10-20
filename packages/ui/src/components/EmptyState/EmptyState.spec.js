import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { expectNoA11yViolations } from '../../../tests/a11y.js'
import EmptyState from './EmptyState.vue'

describe('EmptyState', () => {
  it('shows a heading, description, decorative icon and actions', async () => {
    const { container } = render(EmptyState, {
      props: { title: 'No orders yet', description: 'Orders you place appear here.' },
      slots: { icon: '<svg data-testid="icon" />', actions: '<button>Browse</button>' },
    })
    expect(screen.getByRole('heading', { level: 2, name: 'No orders yet' })).toBeInTheDocument()
    expect(screen.getByText('Orders you place appear here.')).toBeInTheDocument()
    expect(screen.getByTestId('icon').parentElement).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByRole('button', { name: 'Browse' })).toBeInTheDocument()
    await expectNoA11yViolations(container)
  })

  it('renders only the title when nothing else is given', () => {
    render(EmptyState, { props: { title: 'Empty', headingLevel: 3 } })
    expect(screen.getByRole('heading', { level: 3, name: 'Empty' })).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
