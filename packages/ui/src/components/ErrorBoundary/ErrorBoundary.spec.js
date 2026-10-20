/* eslint-disable vue/one-component-per-file -- small test harness components, one per scenario */
import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { expectNoA11yViolations } from '../../../tests/a11y.js'
import ErrorBoundary from './ErrorBoundary.vue'

let shouldThrow = true

const Fragile = defineComponent({
  setup() {
    if (shouldThrow) throw new Error('database password leaked in this message')
    return () => h('p', 'Loaded fine')
  },
})

describe('ErrorBoundary', () => {
  it('renders its slot when nothing fails', () => {
    shouldThrow = false
    render(ErrorBoundary, { slots: { default: () => h(Fragile) } })
    expect(screen.getByText('Loaded fine')).toBeInTheDocument()
  })

  it('catches a throwing child, reports it and recovers with Try again', async () => {
    const user = userEvent.setup()
    shouldThrow = true
    // Vue warns that the throwing component has no render function; expected here.
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const onError = vi.fn()
    const { container } = render(ErrorBoundary, {
      props: { fallbackTitle: 'Chart unavailable', onError },
      slots: { default: () => h(Fragile) },
    })

    // The fallback replaces the slot on the next render tick.
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Chart unavailable')
    expect(alert).not.toHaveTextContent('password')
    expect(onError).toHaveBeenCalledWith(expect.any(Error), 'setup function')
    await expectNoA11yViolations(container)

    shouldThrow = false
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(screen.getByText('Loaded fine')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    vi.mocked(console.warn).mockRestore()
  })

  it('catches render errors and offers a custom fallback slot', async () => {
    const user = userEvent.setup()
    let broken = true
    const BadRender = defineComponent({
      setup: () => () => {
        if (broken) throw new TypeError('bad render')
        return h('p', 'Rendered')
      },
    })
    render(ErrorBoundary, {
      slots: {
        default: () => h(BadRender),
        fallback: (/** @type {{ error: Error, reset: () => void }} */ { error, reset }) =>
          h('button', { type: 'button', onClick: reset }, `Retry after ${error.message}`),
      },
    })
    broken = false
    await user.click(await screen.findByRole('button', { name: 'Retry after bad render' }))
    expect(screen.getByText('Rendered')).toBeInTheDocument()
  })
})
