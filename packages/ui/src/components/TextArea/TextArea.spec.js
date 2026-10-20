import { fireEvent, render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { expectNoA11yViolations } from '../../../tests/a11y.js'
import TextArea from './TextArea.vue'

describe('TextArea', () => {
  it('is a labelled multi-line field with v-model', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    const { container } = render(TextArea, {
      props: { label: 'Notes', rows: 5, 'onUpdate:modelValue': onUpdate },
    })
    const textarea = screen.getByRole('textbox', { name: 'Notes' })
    expect(textarea).toHaveAttribute('rows', '5')
    await user.type(textarea, 'Line 1{Enter}Line 2')
    expect(onUpdate).toHaveBeenLastCalledWith('Line 1\nLine 2')
    await expectNoA11yViolations(container)
  })

  it('shows a polite live character count when maxlength is set', async () => {
    const { container, rerender } = render(TextArea, {
      props: { label: 'Bio', maxlength: 160, modelValue: 'Hello', hint: 'Public' },
    })
    const textarea = screen.getByRole('textbox', { name: 'Bio' })
    const count = screen.getByText('5/160')
    expect(count).toHaveAttribute('aria-live', 'polite')
    expect(textarea).toHaveAttribute('maxlength', '160')
    expect(textarea).toHaveAccessibleDescription('Public 5/160')

    await rerender({ modelValue: 'Hello there' })
    expect(screen.getByText('11/160')).toBeInTheDocument()
    await expectNoA11yViolations(container)
  })

  it('has no counter without maxlength', () => {
    render(TextArea, { props: { label: 'Notes', modelValue: 'abc' } })
    expect(screen.queryByText(/\/\d+$/)).not.toBeInTheDocument()
  })

  it('grows with its content when autoGrow is on', async () => {
    const onUpdate = vi.fn()
    render(TextArea, { props: { label: 'Notes', autoGrow: true, 'onUpdate:modelValue': onUpdate } })
    const textarea = /** @type {HTMLTextAreaElement} */ (screen.getByRole('textbox'))
    Object.defineProperty(textarea, 'scrollHeight', { configurable: true, value: 120 })
    textarea.value = 'a\nb\nc\nd'
    await fireEvent.input(textarea)
    await new Promise((resolve) => setTimeout(resolve))
    expect(textarea.style.height).toBe('120px')
  })

  it('reports errors and supports disabled and read-only', async () => {
    const onBlur = vi.fn()
    const user = userEvent.setup()
    const { rerender } = render(TextArea, {
      props: { label: 'Notes', error: 'Too short', required: true },
      attrs: { onBlur },
    })
    const textarea = screen.getByRole('textbox', { name: 'Notes' })
    expect(textarea).toBeInvalid()
    expect(textarea).toBeRequired()
    expect(textarea).toHaveAccessibleDescription('Too short')
    await user.click(textarea)
    await user.tab()
    expect(onBlur).toHaveBeenCalledOnce()

    await rerender({ disabled: true, readonly: true })
    expect(textarea).toBeDisabled()
    expect(textarea).toHaveAttribute('readonly')
  })
})
