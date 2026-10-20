import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { expectNoA11yViolations } from '../../../tests/a11y.js'
import SearchField from './SearchField.vue'

describe('SearchField', () => {
  // Fake timers only where debouncing is under test: axe relies on real ones.
  afterEach(() => vi.useRealTimers())

  /** @param {Record<string, unknown>} [props] */
  function setup(props = {}) {
    const onUpdate = vi.fn()
    const onSearch = vi.fn()
    const utils = render(SearchField, {
      props: { 'onUpdate:modelValue': onUpdate, ...props },
      attrs: { onSearch },
    })
    const user = userEvent.setup(vi.isFakeTimers() ? { advanceTimers: vi.advanceTimersByTime } : {})
    return { ...utils, onUpdate, onSearch, user, input: screen.getByRole('searchbox') }
  }

  it('is a labelled search input', async () => {
    const { container, input } = setup()
    expect(input).toHaveAccessibleName('Search')
    expect(input).toHaveAttribute('placeholder', 'Search')
    await expectNoA11yViolations(container)
  })

  it('updates the model immediately and debounces the search event', async () => {
    vi.useFakeTimers()
    const { input, onUpdate, onSearch, user } = setup({ debounce: 200 })
    await user.type(input, 'vue')
    expect(onUpdate).toHaveBeenLastCalledWith('vue')
    expect(onSearch).not.toHaveBeenCalled()

    vi.advanceTimersByTime(199)
    expect(onSearch).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(onSearch).toHaveBeenCalledExactlyOnceWith('vue')
  })

  it('searches immediately on Enter', async () => {
    vi.useFakeTimers()
    const { input, onSearch, user } = setup()
    await user.type(input, 'tokyo{Enter}')
    expect(onSearch).toHaveBeenCalledExactlyOnceWith('tokyo')
    vi.advanceTimersByTime(1000)
    expect(onSearch).toHaveBeenCalledOnce()
  })

  it('clears with the clear button and returns focus to the input', async () => {
    const { input, onSearch, user } = setup()
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument()
    await user.type(input, 'abc')
    await user.click(screen.getByRole('button', { name: 'Clear search' }))
    expect(input).toHaveValue('')
    expect(input).toHaveFocus()
    expect(onSearch).toHaveBeenLastCalledWith('')
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument()
  })

  it('clears with Escape', async () => {
    const { input, onUpdate, user } = setup()
    await user.type(input, 'abc{Escape}')
    expect(input).toHaveValue('')
    expect(onUpdate).toHaveBeenLastCalledWith('')
  })

  it('ignores Enter while an IME is composing', async () => {
    const { input, onSearch } = setup()
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', isComposing: true, bubbles: true }),
    )
    expect(onSearch).not.toHaveBeenCalled()
  })

  it('can be a search landmark with a visible label', async () => {
    const { container } = setup({ landmark: true, label: 'Search docs', labelVisible: true })
    expect(screen.getByRole('search')).toBeInTheDocument()
    expect(screen.getByText('Search docs')).not.toHaveClass('visually-hidden')
    await expectNoA11yViolations(container)
  })

  it('stops a pending search when unmounted', async () => {
    vi.useFakeTimers()
    const { input, onSearch, user, unmount } = setup()
    await user.type(input, 'a')
    unmount()
    vi.advanceTimersByTime(1000)
    expect(onSearch).not.toHaveBeenCalled()
  })
})
