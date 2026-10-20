import { render, screen, within } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { expectNoA11yViolations } from '../../../tests/a11y.js'
import DataTable from './DataTable.vue'

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'role', label: 'Role' },
  { key: 'age', label: 'Age', sortable: true, align: /** @type {const} */ ('end'), width: '6rem' },
]

const rows = [
  { id: 1, name: 'Grace', role: 'Admiral', age: 85 },
  { id: 2, name: 'ada', role: 'Analyst', age: 36 },
  { id: 3, name: 'Linus', role: 'Engineer', age: null },
  { id: 4, name: 'Barbara', role: 'Professor', age: 9 },
]

/** @param {Record<string, unknown>} [props] */
function renderTable(props = {}, slots = {}) {
  const onSort = vi.fn()
  const utils = render(DataTable, {
    props: { columns, rows, rowKey: 'id', caption: 'Team', 'onUpdate:sort': onSort, ...props },
    slots,
  })
  return { ...utils, onSort }
}

/** Text of the first cell of every body row. */
const firstColumn = () =>
  screen
    .getAllByRole('row')
    .slice(1)
    .map((row) => within(row).getAllByRole('cell')[0].textContent?.trim())

describe('DataTable', () => {
  it('renders a captioned table inside a focusable, labelled scroll region', async () => {
    const { container } = renderTable()
    const table = screen.getByRole('table', { name: 'Team' })
    expect(screen.getAllByRole('columnheader')).toHaveLength(3)
    expect(within(table).getAllByRole('row')).toHaveLength(5)
    const region = screen.getByRole('region', { name: 'Team' })
    expect(region).toHaveAttribute('tabindex', '0')
    expect(screen.getByRole('columnheader', { name: 'Age' })).toHaveAttribute(
      'style',
      'width: 6rem;',
    )
    expect(screen.getByRole('button', { name: 'Name' })).toBeInTheDocument()
    expect(
      within(screen.getByRole('columnheader', { name: 'Role' })).queryByRole('button'),
    ).toBeNull()
    await expectNoA11yViolations(container)
  })

  it('emits sort changes from header buttons and reflects them in aria-sort', async () => {
    const user = userEvent.setup()
    const { onSort, rerender } = renderTable()
    await user.click(screen.getByRole('button', { name: 'Name' }))
    expect(onSort).toHaveBeenLastCalledWith({ key: 'name', order: 'asc' })

    await rerender({ sort: { key: 'name', order: 'asc' } })
    expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveAttribute(
      'aria-sort',
      'ascending',
    )
    expect(screen.getByRole('columnheader', { name: 'Age' })).not.toHaveAttribute('aria-sort')
    expect(firstColumn()).toEqual(['ada', 'Barbara', 'Grace', 'Linus'])

    await user.click(screen.getByRole('button', { name: 'Name' }))
    expect(onSort).toHaveBeenLastCalledWith({ key: 'name', order: 'desc' })
    await rerender({ sort: { key: 'name', order: 'desc' } })
    expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveAttribute(
      'aria-sort',
      'descending',
    )
    expect(firstColumn()).toEqual(['Linus', 'Grace', 'Barbara', 'ada'])

    await user.click(screen.getByRole('button', { name: 'Age' }))
    expect(onSort).toHaveBeenLastCalledWith({ key: 'age', order: 'asc' })
  })

  it('sorts numbers numerically and keeps empty values last', async () => {
    const { rerender } = renderTable({ sort: { key: 'age', order: 'asc' } })
    expect(firstColumn()).toEqual(['Barbara', 'ada', 'Grace', 'Linus'])
    await rerender({ sort: { key: 'age', order: 'desc' } })
    expect(firstColumn()).toEqual(['Grace', 'ada', 'Barbara', 'Linus'])
    await rerender({ manualSort: true })
    expect(firstColumn()).toEqual(['Grace', 'ada', 'Linus', 'Barbara'])
  })

  it('renders cell slots with row and value, and accepts a rowKey function', () => {
    renderTable(
      { rowKey: (/** @type {{ id: number }} */ row) => `user-${row.id}` },
      {
        'cell-name':
          '<template #cell-name="{ row, value }"><strong>{{ value }} #{{ row.id }}</strong></template>',
      },
    )
    expect(screen.getByText('Grace #1').tagName).toBe('STRONG')
  })

  it('shows skeleton rows and aria-busy while loading', async () => {
    const { container } = renderTable({ loading: true, skeletonRows: 3, captionHidden: true })
    const table = screen.getByRole('table', { name: 'Team' })
    expect(table).toHaveAttribute('aria-busy', 'true')
    expect(within(table).getAllByRole('row')).toHaveLength(4)
    expect(screen.getByRole('status')).toHaveTextContent('Loading')
    expect(screen.getByText('Team')).toHaveClass('visually-hidden')
    await expectNoA11yViolations(container)
  })

  it('shows an error state with a retry event', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const { container } = renderTable({ error: 'The server did not respond.', onRetry })
    expect(screen.getByRole('alert')).toHaveTextContent('The server did not respond.')
    expect(
      screen.getByRole('heading', { level: 3, name: 'Could not load data' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(onRetry).toHaveBeenCalledOnce()
    await expectNoA11yViolations(container)
  })

  it('shows an empty state, or the empty slot', () => {
    const { unmount } = renderTable({
      rows: [],
      emptyTitle: 'No members',
      emptyDescription: 'Invite someone.',
    })
    expect(screen.getByRole('heading', { name: 'No members' })).toBeInTheDocument()
    expect(screen.getByText('Invite someone.')).toBeInTheDocument()
    unmount()
    renderTable({ rows: [] }, { empty: '<p>Custom empty</p>' })
    expect(screen.getByText('Custom empty')).toBeInTheDocument()
  })

  it('scrolls inside its own region with a pinned header when maxHeight is set', () => {
    render(DataTable, {
      props: {
        columns: [{ key: 'name', label: 'Name' }],
        rows: [{ id: 1, name: 'A' }],
        rowKey: 'id',
        caption: 'People',
        maxHeight: '50dvh',
      },
    })
    const region = screen.getByRole('region', { name: 'People' })
    expect(region).toHaveStyle({ maxHeight: '50dvh' })
    expect(region).toHaveClass('overflow-y-auto')
    expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveClass('sticky')
  })
})
