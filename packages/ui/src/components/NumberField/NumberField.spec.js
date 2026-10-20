import { fireEvent, render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import { expectNoA11yViolations } from '../../../tests/a11y.js'
import NumberField from './NumberField.vue'

/** @param {Record<string, unknown>} [props] */
function setup(props = {}) {
  const onUpdate = vi.fn()
  const utils = render(NumberField, {
    props: { label: 'Amount', locale: 'en-US', 'onUpdate:modelValue': onUpdate, ...props },
  })
  const input = /** @type {HTMLInputElement} */ (screen.getByRole('textbox', { name: 'Amount' }))
  return { ...utils, input, onUpdate, user: userEvent.setup() }
}

describe('NumberField', () => {
  it('is a labelled text input with a numeric keyboard hint', async () => {
    const { container, input } = setup({ hint: 'Whole yen', required: true })
    expect(input).toHaveAttribute('type', 'text')
    expect(input).toHaveAttribute('inputmode', 'numeric')
    expect(input).toBeRequired()
    expect(input).toHaveAccessibleDescription('Whole yen')
    await expectNoA11yViolations(container)
  })

  it('asks for a decimal keyboard when fractions are allowed', () => {
    const { input } = setup({ maxFractionDigits: 2 })
    expect(input).toHaveAttribute('inputmode', 'decimal')
  })

  it('emits numbers and groups digits while typing', async () => {
    const { input, onUpdate, user } = setup()
    await user.type(input, '1234567')
    expect(input).toHaveValue('1,234,567')
    expect(onUpdate).toHaveBeenLastCalledWith(1234567)
    expect(input.selectionStart).toBe(input.value.length)
  })

  it('keeps the caret after the typed digit when editing mid-number', async () => {
    const { input, onUpdate, user } = setup({ modelValue: 1234 })
    expect(input).toHaveValue('1,234')

    // Caret after "1," → type 5 → "15,234" with the caret after "15".
    await user.type(input, '5', { initialSelectionStart: 2, initialSelectionEnd: 2 })
    expect(input).toHaveValue('15,234')
    expect(onUpdate).toHaveBeenLastCalledWith(15234)
    expect(input.selectionStart).toBe(2)

    await user.keyboard('9')
    expect(input).toHaveValue('159,234')
    expect(input.selectionStart).toBe(3)
  })

  it('deletes the digit before a grouping separator on Backspace', async () => {
    const { input, onUpdate, user } = setup({ modelValue: 1234 })
    await user.type(input, '{Backspace}', { initialSelectionStart: 2, initialSelectionEnd: 2 })
    expect(input).toHaveValue('234')
    expect(onUpdate).toHaveBeenLastCalledWith(234)
    expect(input.selectionStart).toBe(0)
  })

  it('deletes the digit after a grouping separator on Delete', async () => {
    const { input, user } = setup({ modelValue: 1234 })
    await user.type(input, '{Delete}', { initialSelectionStart: 1, initialSelectionEnd: 1 })
    expect(input).toHaveValue('134')
  })

  it('accepts full-width digits', async () => {
    const { input, onUpdate, user } = setup()
    await user.type(input, '１２３')
    expect(input).toHaveValue('123')
    expect(onUpdate).toHaveBeenLastCalledWith(123)
  })

  it('accepts pasted text with separators, full-width characters and noise', async () => {
    const { input, onUpdate, user } = setup()
    await user.click(input)
    await user.paste('￥１，２３４，５６７')
    expect(input).toHaveValue('1,234,567')
    expect(onUpdate).toHaveBeenLastCalledWith(1234567)
  })

  describe('IME composition', () => {
    it('leaves the text alone until composition ends', async () => {
      const { input, onUpdate } = setup()

      await fireEvent.compositionStart(input)
      input.value = '１２'
      await fireEvent.input(input, { isComposing: true })
      expect(input).toHaveValue('１２')
      input.value = '１２３４'
      await fireEvent.input(input, { isComposing: true })
      expect(input).toHaveValue('１２３４')
      expect(onUpdate).not.toHaveBeenCalled()

      await fireEvent.compositionEnd(input)
      expect(input).toHaveValue('1,234')
      expect(onUpdate).toHaveBeenLastCalledWith(1234)
    })

    it('trusts isComposing even when compositionstart was missed', async () => {
      const { input, onUpdate } = setup()
      input.value = '１２３４'
      await fireEvent.input(input, { isComposing: true })
      expect(input).toHaveValue('１２３４')
      expect(onUpdate).not.toHaveBeenCalled()
    })

    it('does not step with arrow keys while composing', async () => {
      const { input, onUpdate } = setup({ modelValue: 5 })
      await fireEvent.compositionStart(input)
      await fireEvent.keyDown(input, { key: 'ArrowUp' })
      expect(onUpdate).not.toHaveBeenCalled()
    })

    it('reads the prolonged sound mark an IME produces as a minus sign', async () => {
      const { input, onUpdate } = setup()
      await fireEvent.compositionStart(input)
      input.value = 'ー１２３'
      await fireEvent.input(input, { isComposing: true })
      await fireEvent.compositionEnd(input)
      expect(input).toHaveValue('-123')
      expect(onUpdate).toHaveBeenLastCalledWith(-123)
    })
  })

  it('handles negative numbers and ignores the sign when negatives are off', async () => {
    const { input, onUpdate, user } = setup()
    await user.type(input, '-')
    expect(input).toHaveValue('-')
    expect(onUpdate).not.toHaveBeenCalled()
    await user.type(input, '1500')
    expect(input).toHaveValue('-1,500')
    expect(onUpdate).toHaveBeenLastCalledWith(-1500)
  })

  it('drops the minus sign when negatives are not allowed', async () => {
    const { input, onUpdate, user } = setup({ allowNegative: false })
    await user.type(input, '-42')
    expect(input).toHaveValue('42')
    expect(onUpdate).toHaveBeenLastCalledWith(42)
  })

  it('accepts up to maxFractionDigits decimals', async () => {
    const { input, onUpdate, user } = setup({ maxFractionDigits: 2 })
    await user.type(input, '1234.567')
    expect(input).toHaveValue('1,234.56')
    expect(onUpdate).toHaveBeenLastCalledWith(1234.56)
  })

  it('ignores the decimal point when fractions are not allowed', async () => {
    const { input, user } = setup()
    await user.type(input, '1.5')
    expect(input).toHaveValue('15')
  })

  it('refuses digits beyond maxDigits and keeps the caret in place', async () => {
    const { input, onUpdate, user } = setup({ maxDigits: 4 })
    await user.type(input, '12345')
    expect(input).toHaveValue('1,234')
    expect(onUpdate).toHaveBeenLastCalledWith(1234)

    await user.type(input, '9', { initialSelectionStart: 1, initialSelectionEnd: 1 })
    expect(input).toHaveValue('1,234')
    expect(input.selectionStart).toBe(1)
  })

  it('clamps to min and max on blur, not while typing', async () => {
    const { input, onUpdate, user } = setup({ min: 10, max: 100 })
    await user.type(input, '5')
    expect(onUpdate).toHaveBeenLastCalledWith(5)
    await user.tab()
    expect(input).toHaveValue('10')
    expect(onUpdate).toHaveBeenLastCalledWith(10)

    await user.clear(input)
    await user.type(input, '1000')
    expect(input).toHaveValue('1,000')
    await user.tab()
    expect(input).toHaveValue('100')
    expect(onUpdate).toHaveBeenLastCalledWith(100)
  })

  it('tidies incomplete input on blur and emits blur', async () => {
    const onBlur = vi.fn()
    const { input, user } = setup({ maxFractionDigits: 2, onBlur })
    await user.type(input, '12.')
    expect(input).toHaveValue('12.')
    await user.tab()
    expect(input).toHaveValue('12')
    expect(onBlur).toHaveBeenCalledOnce()
  })

  it('emits null when cleared', async () => {
    const { input, onUpdate, user } = setup({ modelValue: 42 })
    await user.clear(input)
    expect(input).toHaveValue('')
    expect(onUpdate).toHaveBeenLastCalledWith(null)
    await user.tab()
    expect(onUpdate).toHaveBeenLastCalledWith(null)
  })

  it('steps with ArrowUp and ArrowDown within the bounds', async () => {
    const { input, onUpdate, user } = setup({ step: 5, max: 12 })
    await user.click(input)
    await user.keyboard('{ArrowUp}')
    expect(onUpdate).toHaveBeenLastCalledWith(5)
    await user.keyboard('{ArrowUp}{ArrowUp}')
    expect(input).toHaveValue('12')
    expect(onUpdate).toHaveBeenLastCalledWith(12)
    await user.keyboard('{ArrowDown}')
    expect(onUpdate).toHaveBeenLastCalledWith(7)
  })

  it('steps fractions without floating point noise', async () => {
    const { input, user } = setup({ step: 0.1, maxFractionDigits: 1, modelValue: 0.2 })
    await user.click(input)
    await user.keyboard('{ArrowUp}')
    expect(input).toHaveValue('0.3')
  })

  it('does not step below zero when negatives are off, or when read-only', async () => {
    const { input, onUpdate, user, rerender } = setup({ allowNegative: false })
    await user.click(input)
    await user.keyboard('{ArrowDown}')
    expect(onUpdate).toHaveBeenLastCalledWith(0)

    onUpdate.mockClear()
    await rerender({ readonly: true })
    await user.keyboard('{ArrowUp}')
    expect(onUpdate).not.toHaveBeenCalled()
  })

  it('formats a number given by the parent and follows later changes', async () => {
    const { input, rerender } = setup({ modelValue: 1234567.5, maxFractionDigits: 2 })
    expect(input).toHaveValue('1,234,567.5')
    await rerender({ modelValue: 42 })
    expect(input).toHaveValue('42')
    await rerender({ modelValue: null })
    expect(input).toHaveValue('')
  })

  it('uses the grouping of the given locale', () => {
    const { input } = setup({ modelValue: 1234567.25, maxFractionDigits: 2, locale: 'de-DE' })
    expect(input).toHaveValue('1.234.567,25')
  })

  it('works with v-model', async () => {
    const amount = ref(/** @type {number | null} */ (1000))
    const Harness = defineComponent({
      components: { NumberField },
      setup: () => ({ amount }),
      template: `<NumberField v-model="amount" label="Amount" locale="en-US" />`,
    })
    const user = userEvent.setup()
    render(Harness)
    const input = screen.getByRole('textbox', { name: 'Amount' })
    await user.type(input, '0')
    expect(amount.value).toBe(10000)
    expect(input).toHaveValue('10,000')
  })

  it('marks errors as invalid and describes the field with them', async () => {
    const { container, input } = setup({ error: 'Enter an amount', hint: 'In yen' })
    expect(input).toBeInvalid()
    expect(input).toHaveAccessibleDescription('Enter an amount In yen')
    await expectNoA11yViolations(container)
  })

  it('can be disabled', async () => {
    const { input, rerender } = setup({ disabled: true })
    expect(input).toBeDisabled()
    await rerender({ disabled: false })
    expect(input).toBeEnabled()
  })
})
