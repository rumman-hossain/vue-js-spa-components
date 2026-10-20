import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { expectNoA11yViolations } from '../../../tests/a11y.js'
import Pagination from './Pagination.vue'

/** @param {Record<string, unknown>} props */
function renderPagination(props) {
  const onPage = vi.fn()
  const onPageSize = vi.fn()
  const utils = render(Pagination, {
    props: /** @type {any} */ ({
      'onUpdate:page': onPage,
      'onUpdate:pageSize': onPageSize,
      ...props,
    }),
  })
  return { ...utils, onPage, onPageSize }
}

const pageButtons = () =>
  screen
    .getAllByRole('button')
    .filter((button) => button.getAttribute('aria-label')?.startsWith('Page'))
    .map((button) => button.textContent?.trim())

describe('Pagination', () => {
  it('is a named navigation with the current page marked', async () => {
    const { container } = renderPagination({ total: 95, page: 5 })
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Page 5' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Page 4' })).not.toHaveAttribute('aria-current')
    expect(screen.getByText('Showing 41–50 of 95')).toBeInTheDocument()
    await expectNoA11yViolations(container)
  })

  it('shows first, last and ellipses around the current page', () => {
    const { rerender } = renderPagination({ total: 200, page: 1 })
    expect(pageButtons()).toEqual(['1', '2', '3', '4', '5', '20'])
    expect(screen.getAllByText('…')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()

    return rerender({ page: 10 }).then(async () => {
      expect(pageButtons()).toEqual(['1', '9', '10', '11', '20'])
      expect(screen.getAllByText('…')).toHaveLength(2)
      await rerender({ page: 20 })
      expect(pageButtons()).toEqual(['1', '16', '17', '18', '19', '20'])
      expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
      expect(screen.getByText('Showing 191–200 of 200')).toBeInTheDocument()
    })
  })

  it('emits page changes from previous, next and page buttons', async () => {
    const user = userEvent.setup()
    const { onPage } = renderPagination({ total: 50, page: 3 })
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(onPage).toHaveBeenLastCalledWith(4)
    // Controlled: the page stays 3 until the parent updates it.
    await user.click(screen.getByRole('button', { name: 'Previous' }))
    expect(onPage).toHaveBeenLastCalledWith(2)
    await user.click(screen.getByRole('button', { name: 'Page 5' }))
    expect(onPage).toHaveBeenLastCalledWith(5)
  })

  it('clamps an out-of-range page and handles an empty result', async () => {
    const { rerender } = renderPagination({ total: 30, page: 9 })
    expect(screen.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByText('Showing 21–30 of 30')).toBeInTheDocument()
    await rerender({ total: 0 })
    expect(screen.getByText('Showing 0–0 of 0')).toBeInTheDocument()
    expect(pageButtons()).toEqual(['1'])
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
  })

  it('formats numbers for the locale and accepts custom labels', () => {
    renderPagination({
      total: 12_345,
      page: 2,
      pageSize: 1000,
      locale: 'de-DE',
      label: 'Seiten',
      pageLabel: (/** @type {string} */ page) => `Seite ${page}`,
      summary: (/** @type {{ from: string, to: string, total: string }} */ range) =>
        `${range.from}–${range.to} von ${range.total}`,
    })
    expect(screen.getByRole('navigation', { name: 'Seiten' })).toBeInTheDocument()
    expect(screen.getByText('1.001–2.000 von 12.345')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Seite 2' })).toHaveAttribute('aria-current', 'page')
  })

  it('changes the page size and goes back to the first page', async () => {
    const user = userEvent.setup()
    const { container, onPage, onPageSize } = renderPagination({
      total: 100,
      page: 4,
      pageSizeOptions: [10, 25, 50],
    })
    const select = screen.getByRole('combobox', { name: 'Rows per page' })
    expect(select).toHaveValue('10')
    await user.selectOptions(select, '25')
    expect(onPageSize).toHaveBeenLastCalledWith(25)
    expect(onPage).toHaveBeenLastCalledWith(1)
    await expectNoA11yViolations(container)
  })
})
