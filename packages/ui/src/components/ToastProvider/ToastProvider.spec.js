/* eslint-disable vue/one-component-per-file -- small test harness components, one per scenario */
import { fireEvent, render, screen, within } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { expectNoA11yViolations } from '../../../tests/a11y.js'
import { useToast } from '../../composables/useToast.js'
import ToastProvider from './ToastProvider.vue'

/** @type {import('../../composables/useToast.js').ToastApi} */
let toast

const Consumer = defineComponent({
  setup() {
    toast = useToast()
    return () => h('p', 'App')
  },
})

/** @param {Record<string, unknown>} [props] */
function renderProvider(props = {}) {
  return render(ToastProvider, { props, slots: { default: () => h(Consumer) } })
}

describe('ToastProvider and useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('announces neutral and success politely and errors assertively', async () => {
    const { container } = renderProvider()
    toast.show({ title: 'Saved', description: 'All changes stored.', tone: 'success' })
    toast.show({ title: 'Copied' })
    toast.show({ title: 'Upload failed', tone: 'danger' })
    await nextTick()

    const polite = screen.getByRole('status')
    expect(within(polite).getByText('Saved')).toBeInTheDocument()
    expect(within(polite).getByText('All changes stored.')).toBeInTheDocument()
    expect(within(polite).getByText('Copied')).toBeInTheDocument()
    expect(within(screen.getByRole('alert')).getByText('Upload failed')).toBeInTheDocument()
    vi.useRealTimers()
    await expectNoA11yViolations(container)
  })

  it('hides after 5s by default and after 8s for errors', async () => {
    renderProvider()
    toast.show({ title: 'Info' })
    toast.show({ title: 'Error', tone: 'danger' })
    await nextTick()
    await vi.advanceTimersByTimeAsync(4999)
    expect(screen.getByText('Info')).toBeInTheDocument()
    await vi.advanceTimersByTimeAsync(1)
    expect(screen.queryByText('Info')).not.toBeInTheDocument()
    await vi.advanceTimersByTimeAsync(2999)
    expect(screen.getByText('Error')).toBeInTheDocument()
    await vi.advanceTimersByTimeAsync(1)
    expect(screen.queryByText('Error')).not.toBeInTheDocument()
  })

  it('pauses while hovered and resumes with the remaining time', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderProvider()
    toast.show({ title: 'Hover me', duration: 1000 })
    await nextTick()
    await vi.advanceTimersByTimeAsync(600)
    const card = screen.getByText('Hover me').closest('div.material')
    await user.hover(/** @type {HTMLElement} */ (card))
    await vi.advanceTimersByTimeAsync(10_000)
    expect(screen.getByText('Hover me')).toBeInTheDocument()
    await user.unhover(/** @type {HTMLElement} */ (card))
    await vi.advanceTimersByTimeAsync(399)
    expect(screen.getByText('Hover me')).toBeInTheDocument()
    await vi.advanceTimersByTimeAsync(1)
    expect(screen.queryByText('Hover me')).not.toBeInTheDocument()
  })

  it('pauses while focus is inside the toast', async () => {
    renderProvider()
    toast.show({ title: 'Focus me', duration: 1000 })
    await nextTick()
    const button = screen.getByRole('button', { name: 'Dismiss notification' })
    await fireEvent.focusIn(button)
    await vi.advanceTimersByTimeAsync(5000)
    expect(screen.getByText('Focus me')).toBeInTheDocument()
    // Moving focus within the toast keeps it paused.
    await fireEvent.focusOut(button, { relatedTarget: button })
    await vi.advanceTimersByTimeAsync(5000)
    expect(screen.getByText('Focus me')).toBeInTheDocument()
    await fireEvent.focusOut(button, { relatedTarget: document.body })
    await vi.advanceTimersByTimeAsync(1000)
    expect(screen.queryByText('Focus me')).not.toBeInTheDocument()
  })

  it('keeps at most three, dismisses by button or id, and supports sticky toasts', async () => {
    renderProvider({ dismissLabel: 'Close' })
    for (const title of ['One', 'Two', 'Three', 'Four']) toast.show({ title, duration: 0 })
    await nextTick()
    expect(screen.queryByText('One')).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Close' })).toHaveLength(3)

    await fireEvent.click(screen.getAllByRole('button', { name: 'Close' })[0])
    expect(screen.queryByText('Two')).not.toBeInTheDocument()

    const id = toast.show({ title: 'Five', duration: Infinity })
    await nextTick()
    toast.dismiss(id)
    await nextTick()
    expect(screen.queryByText('Five')).not.toBeInTheDocument()
    await vi.advanceTimersByTimeAsync(60_000)
    expect(screen.getByText('Three')).toBeInTheDocument()
  })

  it('throws a clear error without a provider', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const Orphan = defineComponent({
      setup() {
        useToast()
        return () => null
      },
    })
    expect(() => render(Orphan)).toThrow(/ToastProvider/)
    vi.mocked(console.warn).mockRestore()
  })
})
