import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { expectNoA11yViolations } from '../../../tests/a11y.js'
import Card from './Card.vue'

describe('Card', () => {
  it('is a region named by its title', async () => {
    const { container } = render(Card, {
      props: { title: 'Billing', description: 'Your plan and invoices' },
      slots: { default: '<p>Body</p>', actions: '<button>Edit</button>', footer: 'Footer' },
    })
    expect(screen.getByRole('region', { name: 'Billing' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Billing' })).toBeInTheDocument()
    expect(screen.getByText('Your plan and invoices')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()
    await expectNoA11yViolations(container)
  })

  it('accepts title and description slots and a heading level', () => {
    render(Card, {
      props: { headingLevel: 3, material: true },
      slots: { title: 'Slotted', description: 'More', default: 'Body' },
    })
    expect(screen.getByRole('heading', { level: 3, name: 'Slotted' })).toBeInTheDocument()
    expect(screen.getByText('More')).toBeInTheDocument()
  })

  it('renders without a header when untitled', async () => {
    const { container } = render(Card, { slots: { default: 'Just content' } })
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    expect(screen.queryByRole('region')).not.toBeInTheDocument()
    expect(screen.getByText('Just content')).toBeInTheDocument()
    await expectNoA11yViolations(container)
  })

  it('supports a level 1 heading for full-page cards', () => {
    render(Card, { props: { title: 'Overview', headingLevel: 1 } })
    expect(screen.getByRole('heading', { level: 1, name: 'Overview' })).toBeInTheDocument()
  })
})
