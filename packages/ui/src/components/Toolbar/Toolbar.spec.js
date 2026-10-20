import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { expectNoA11yViolations } from '../../../tests/a11y.js'
import Toolbar from './Toolbar.vue'

describe('Toolbar', () => {
  it('renders a banner with a title heading and leading/trailing slots', async () => {
    const { container } = render(Toolbar, {
      props: { title: 'Inbox' },
      slots: {
        leading: '<button type="button">Back</button>',
        trailing: '<button type="button">Compose</button>',
        default: '<input aria-label="Search mail" />',
      },
    })
    const header = screen.getByRole('banner')
    expect(header).toHaveClass('material', 'sticky')
    expect(screen.getByRole('heading', { level: 1, name: 'Inbox' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Compose' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Search mail' })).toBeInTheDocument()
    // Outside a SplitView there is no sidebar button.
    expect(screen.queryByRole('button', { name: 'Show sidebar' })).not.toBeInTheDocument()
    await expectNoA11yViolations(container)
  })

  it('supports a slotted title, another heading level, or no title', async () => {
    const { rerender } = render(Toolbar, { props: { headingLevel: 2 }, slots: { title: 'Drafts' } })
    expect(screen.getByRole('heading', { level: 2, name: 'Drafts' })).toBeInTheDocument()
    await rerender({ headingLevel: 2 })
    expect(screen.getAllByRole('heading')).toHaveLength(1)
  })

  it('renders without any title', () => {
    render(Toolbar)
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })
})
