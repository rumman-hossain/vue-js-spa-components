import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { expectNoA11yViolations } from '../../../tests/a11y.js'
import SegmentedControl from './SegmentedControl.vue'

const options = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
]

describe('SegmentedControl', () => {
  it('is a named radiogroup of native radios', async () => {
    const { container } = render(SegmentedControl, {
      props: { label: 'Range', options, modelValue: 'week' },
    })
    expect(screen.getByRole('radiogroup', { name: 'Range' })).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(3)
    expect(screen.getByRole('radio', { name: 'Week' })).toBeChecked()
    await expectNoA11yViolations(container)
  })

  it('selects with click and arrow keys', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    render(SegmentedControl, {
      props: { label: 'Range', options, 'onUpdate:modelValue': onUpdate },
    })
    await user.click(screen.getByText('Day'))
    expect(onUpdate).toHaveBeenLastCalledWith('day')

    await user.keyboard('{ArrowRight}')
    expect(onUpdate).toHaveBeenLastCalledWith('week')
    expect(screen.getByRole('radio', { name: 'Week' })).toHaveFocus()
  })

  it('follows the parent value', async () => {
    const { rerender } = render(SegmentedControl, {
      props: { label: 'Range', options, modelValue: 'day' },
    })
    await rerender({ modelValue: 'month' })
    expect(screen.getByRole('radio', { name: 'Month' })).toBeChecked()
  })

  it('supports a visible label, small size and disabled options', async () => {
    const { container } = render(SegmentedControl, {
      props: {
        label: 'Range',
        labelVisible: true,
        size: 'sm',
        name: 'range',
        options: [...options, { value: 'year', label: 'Year', disabled: true }],
      },
    })
    expect(screen.getByText('Range')).not.toHaveClass('visually-hidden')
    expect(screen.getByRole('radio', { name: 'Year' })).toBeDisabled()
    expect(screen.getByRole('radio', { name: 'Day' })).toHaveAttribute('name', 'range')
    await expectNoA11yViolations(container)
  })

  it('disables every segment', () => {
    render(SegmentedControl, { props: { label: 'Range', options, disabled: true } })
    for (const radio of screen.getAllByRole('radio')) expect(radio).toBeDisabled()
  })
})
