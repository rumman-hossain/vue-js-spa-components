import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { expectNoA11yViolations } from '../../../tests/a11y.js'
import ProgressBar from './ProgressBar.vue'

describe('ProgressBar', () => {
  it('exposes value, range and a readable value text', async () => {
    const { container } = render(ProgressBar, { props: { label: 'Upload', value: 40 } })
    const bar = screen.getByRole('progressbar', { name: 'Upload' })
    expect(bar).toHaveAttribute('aria-valuenow', '40')
    expect(bar).toHaveAttribute('aria-valuemin', '0')
    expect(bar).toHaveAttribute('aria-valuemax', '100')
    expect(bar).toHaveAttribute('aria-valuetext', '40%')
    await expectNoA11yViolations(container)
  })

  it('computes the percentage for a custom range and clamps out-of-range values', async () => {
    const { rerender } = render(ProgressBar, {
      props: { label: 'Files', value: 3, min: 0, max: 8, valueText: '3 of 8 files' },
    })
    const bar = screen.getByRole('progressbar', { name: 'Files' })
    expect(bar).toHaveAttribute('aria-valuetext', '3 of 8 files')

    await rerender({ value: 12, valueText: undefined })
    expect(bar).toHaveAttribute('aria-valuenow', '8')
    expect(bar).toHaveAttribute('aria-valuetext', '100%')
  })

  it('omits aria-valuenow when indeterminate', async () => {
    const { container, rerender } = render(ProgressBar, {
      props: { label: 'Syncing', labelHidden: true },
    })
    const bar = screen.getByRole('progressbar', { name: 'Syncing' })
    expect(bar).not.toHaveAttribute('aria-valuenow')
    expect(bar).not.toHaveAttribute('aria-valuetext')
    await expectNoA11yViolations(container)

    await rerender({ value: 50, indeterminate: true })
    expect(bar).not.toHaveAttribute('aria-valuenow')
  })

  it('handles an empty range without dividing by zero', () => {
    render(ProgressBar, { props: { label: 'Empty', value: 0, min: 0, max: 0 } })
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '0%')
  })
})
