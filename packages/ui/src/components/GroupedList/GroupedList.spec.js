import { render, screen, within } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { expectNoA11yViolations } from '../../../tests/a11y.js'
import ListRow from '../ListRow/ListRow.vue'
import GroupedList from './GroupedList.vue'

describe('GroupedList', () => {
  it('renders a list named by its header and described by its footer', async () => {
    const { container } = render(GroupedList, {
      props: { header: 'Account', footer: 'Changes apply to all devices.' },
      slots: {
        default: () => [
          h(ListRow, { title: 'Name', value: 'Ada' }),
          h(ListRow, { title: 'Email' }),
        ],
      },
    })
    const list = screen.getByRole('list', { name: 'Account' })
    expect(list).toHaveAccessibleDescription('Changes apply to all devices.')
    expect(within(list).getAllByRole('listitem')).toHaveLength(2)
    await expectNoA11yViolations(container)
  })

  it('works without header and footer, or with slotted ones', () => {
    const { unmount } = render(GroupedList, {
      slots: { default: () => h(ListRow, { title: 'A' }) },
    })
    expect(screen.getByRole('list')).not.toHaveAttribute('aria-labelledby')
    unmount()

    render(GroupedList, {
      slots: {
        header: 'Slotted header',
        footer: 'Slotted footer',
        default: () => h(ListRow, { title: 'A' }),
      },
    })
    expect(screen.getByRole('list', { name: 'Slotted header' })).toHaveAccessibleDescription(
      'Slotted footer',
    )
  })

  it('renders the header as a level-2 heading by default and accepts other levels', async () => {
    const { rerender } = render(GroupedList, { props: { header: 'Account' } })
    expect(screen.getByRole('heading', { name: 'Account', level: 2 })).toBeInTheDocument()
    await rerender({ header: 'Account', headingLevel: 3 })
    expect(screen.getByRole('heading', { name: 'Account', level: 3 })).toBeInTheDocument()
  })
})
