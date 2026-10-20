import { fireEvent, render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import { expectNoA11yViolations } from '../../../tests/a11y.js'
import TextField from './TextField.vue'

describe('TextField', () => {
  it('associates the visible label with the input', async () => {
    const { container } = render(TextField, { props: { label: 'Email', type: 'email' } })
    const input = screen.getByRole('textbox', { name: 'Email' })
    expect(input).toHaveAttribute('type', 'email')
    expect(screen.getByText('Email')).toBeVisible()
    await expectNoA11yViolations(container)
  })

  it('emits updates as the user types', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    render(TextField, { props: { label: 'Name', 'onUpdate:modelValue': onUpdate } })
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Ada')
    expect(onUpdate).toHaveBeenLastCalledWith('Ada')
  })

  it('shows the value given by the parent', async () => {
    const { rerender } = render(TextField, { props: { label: 'Name', modelValue: 'Ada' } })
    const input = screen.getByRole('textbox', { name: 'Name' })
    expect(input).toHaveValue('Ada')
    await rerender({ modelValue: 'Grace' })
    expect(input).toHaveValue('Grace')
  })

  it('does not update the model in the middle of an IME composition', async () => {
    const onUpdate = vi.fn()
    render(TextField, { props: { label: 'Name', 'onUpdate:modelValue': onUpdate } })
    const input = /** @type {HTMLInputElement} */ (screen.getByRole('textbox', { name: 'Name' }))

    await fireEvent.compositionStart(input)
    input.value = 'やまだ'
    await fireEvent.input(input, { isComposing: true })
    expect(input).toHaveValue('やまだ')
    expect(onUpdate).not.toHaveBeenCalled()

    input.value = '山田'
    await fireEvent.compositionEnd(input)
    expect(onUpdate).toHaveBeenLastCalledWith('山田')
    expect(input).toHaveValue('山田')
  })

  it('links hint and error through aria-describedby and marks the field invalid', async () => {
    const { container, rerender } = render(TextField, {
      props: { label: 'Email', hint: 'We never share it' },
    })
    const input = screen.getByRole('textbox', { name: 'Email' })
    expect(input).toHaveAccessibleDescription('We never share it')
    expect(input).not.toHaveAttribute('aria-invalid')

    await rerender({ error: 'Enter a valid email' })
    expect(input).toBeInvalid()
    expect(input).toHaveAccessibleDescription('Enter a valid email We never share it')
    await expectNoA11yViolations(container)
  })

  it('shows a required marker that is not read twice', () => {
    render(TextField, { props: { label: 'Name', required: true, requiredLabel: 'Pflicht' } })
    const input = screen.getByRole('textbox', { name: 'Name' })
    expect(input).toBeRequired()
    expect(screen.getByText('Pflicht')).toHaveAttribute('aria-hidden', 'true')
  })

  it('passes native attributes through to the input and classes to the wrapper', () => {
    const { container } = render(TextField, {
      props: {
        label: 'Code',
        placeholder: '123456',
        autocomplete: 'one-time-code',
        inputmode: 'numeric',
        maxlength: 6,
        readonly: true,
      },
      attrs: { name: 'code', class: 'custom' },
    })
    const input = screen.getByRole('textbox', { name: 'Code' })
    expect(input).toHaveAttribute('name', 'code')
    expect(input).toHaveAttribute('placeholder', '123456')
    expect(input).toHaveAttribute('autocomplete', 'one-time-code')
    expect(input).toHaveAttribute('inputmode', 'numeric')
    expect(input).toHaveAttribute('maxlength', '6')
    expect(input).toHaveAttribute('readonly')
    expect(input).not.toHaveClass('custom')
    expect(container.firstElementChild).toHaveClass('custom')
  })

  it('uses a given id', () => {
    render(TextField, { props: { label: 'Name', id: 'person-name' } })
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveAttribute('id', 'person-name')
  })

  it('can be disabled', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    render(TextField, {
      props: { label: 'Name', disabled: true, 'onUpdate:modelValue': onUpdate },
    })
    const input = screen.getByRole('textbox', { name: 'Name' })
    expect(input).toBeDisabled()
    await user.type(input, 'x')
    expect(onUpdate).not.toHaveBeenCalled()
  })

  it('emits blur and keeps the leading slot decorative', async () => {
    const user = userEvent.setup()
    const onBlur = vi.fn()
    render(TextField, {
      props: { label: 'Name' },
      attrs: { onBlur },
      slots: { leading: '<svg data-testid="icon" />' },
    })
    expect(screen.getByTestId('icon').parentElement).toHaveAttribute('aria-hidden', 'true')
    await user.click(screen.getByRole('textbox', { name: 'Name' }))
    await user.tab()
    expect(onBlur).toHaveBeenCalledOnce()
  })

  it('exposes focus()', async () => {
    const field = ref(/** @type {InstanceType<typeof TextField> | null} */ (null))
    const Harness = defineComponent({
      components: { TextField },
      setup: () => ({ field }),
      template: `<TextField ref="field" label="Name" />`,
    })
    render(Harness)
    field.value?.focus()
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveFocus()
  })
})
