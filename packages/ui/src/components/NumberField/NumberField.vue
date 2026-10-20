<script setup>
import { computed, ref, useTemplateRef, watch } from 'vue'
import FieldFrame from '../_shared/FieldFrame.vue'
import { fieldBoxClass, fieldControlClass } from '../_shared/fieldClasses.js'
import { useField } from '../_shared/useField.js'
import {
  caretFromCount,
  countSignificant,
  format,
  fromNumber,
  getSeparators,
  normalize,
  sanitize,
  toNumber,
} from './numberText.js'

const props = defineProps({
  label: { type: String, required: true },
  labelHidden: { type: Boolean, default: false },
  hint: { type: String, default: undefined },
  error: { type: String, default: undefined },
  required: { type: Boolean, default: false },
  requiredLabel: { type: String, default: 'Required' },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  placeholder: { type: String, default: undefined },
  /** Lower bound, applied on blur and by the arrow keys. */
  min: { type: Number, default: undefined },
  /** Upper bound, applied on blur and by the arrow keys. */
  max: { type: Number, default: undefined },
  /** Amount added or removed by ArrowUp / ArrowDown. */
  step: { type: Number, default: 1 },
  allowNegative: { type: Boolean, default: true },
  maxFractionDigits: { type: Number, default: 0 },
  /** Maximum number of digits before the decimal point. */
  maxDigits: { type: Number, default: 15 },
  /** BCP 47 locale for grouping. Defaults to the browser's. */
  locale: { type: String, default: undefined },
  id: { type: String, default: undefined },
})

const emit = defineEmits({
  /** @param {FocusEvent} _event */
  blur: (_event) => true,
})

defineOptions({ inheritAttrs: false })

const model = defineModel({ type: [Number, null], default: null })

const { id, hintId, errorId, describedBy, rootAttrs, controlAttrs } = useField(props)
const input = useTemplateRef('input')

const separators = computed(() => getSeparators(props.locale))
const rules = computed(() => ({
  allowNegative: props.allowNegative,
  maxFractionDigits: props.maxFractionDigits,
  maxDigits: props.maxDigits,
}))

/** What the user has entered, as a possibly incomplete canonical string ("-", "12."). */
const canonical = ref(fromNumber(model.value, props.maxFractionDigits))
const display = computed(() => format(canonical.value, props.locale, separators.value))

let composing = false

watch(model, (value) => {
  if (value !== toNumber(canonical.value)) {
    canonical.value = fromNumber(value, props.maxFractionDigits)
  }
})

const lowerBound = computed(() => {
  if (props.allowNegative) return props.min ?? -Infinity
  return Math.max(props.min ?? 0, 0)
})

/** @param {number} value */
function clamp(value) {
  return Math.min(props.max ?? Infinity, Math.max(lowerBound.value, value))
}

/** @param {number | null} value */
function setValue(value) {
  canonical.value = fromNumber(value, props.maxFractionDigits)
  if (value !== model.value) model.value = value
}

/**
 * Reads the input, reformats it in place and puts the caret back after the same digit it
 * followed before grouping separators moved.
 *
 * @param {HTMLInputElement} element
 * @param {string} [inputType]
 */
function commit(element, inputType) {
  let text = element.value
  let caret = element.selectionStart ?? text.length
  let next = sanitize(normalize(text, separators.value), rules.value)

  // Deleting only a grouping separator would change nothing; delete the digit beside it instead.
  if (next === canonical.value && inputType === 'deleteContentBackward' && caret > 0) {
    text = text.slice(0, caret - 1) + text.slice(caret)
    caret -= 1
    next = sanitize(normalize(text, separators.value), rules.value)
  } else if (next === canonical.value && inputType === 'deleteContentForward') {
    text = text.slice(0, caret) + text.slice(caret + 1)
    next = sanitize(normalize(text, separators.value), rules.value)
  }

  if (next === null) {
    // Too many digits: keep the previous text and the caret where the insertion started.
    const inserted = Math.max(0, text.length - display.value.length)
    element.value = display.value
    const position = Math.max(0, caret - inserted)
    element.setSelectionRange(position, position)
    return
  }

  const count = countSignificant(text, caret, separators.value)
  const formatted = format(next, props.locale, separators.value)
  if (element.value !== formatted) element.value = formatted
  const position = caretFromCount(formatted, count, separators.value)
  element.setSelectionRange(position, position)

  canonical.value = next
  const value = toNumber(next)
  if (value !== model.value) model.value = value
}

/** @param {Event} event */
function onInput(event) {
  // During IME composition the text belongs to the IME; rewriting it would cancel the candidate.
  if (composing || /** @type {InputEvent} */ (event).isComposing) return
  commit(
    /** @type {HTMLInputElement} */ (event.target),
    /** @type {InputEvent} */ (event).inputType,
  )
}

function onCompositionStart() {
  composing = true
}

/** @param {CompositionEvent} event */
function onCompositionEnd(event) {
  composing = false
  commit(/** @type {HTMLInputElement} */ (event.target))
}

/** @param {KeyboardEvent} event */
function onKeydown(event) {
  if (composing || event.isComposing || props.readonly) return
  if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
  event.preventDefault()
  const current = toNumber(canonical.value) ?? clamp(0)
  const next = clamp(current + (event.key === 'ArrowUp' ? props.step : -props.step))
  setValue(Number(next.toFixed(props.maxFractionDigits)))
}

/** @param {FocusEvent} event */
function onBlur(event) {
  const value = toNumber(canonical.value)
  // Clamping waits for blur so typing "1" on the way to "15" with min 10 is not overwritten.
  setValue(value === null ? null : clamp(value))
  emit('blur', event)
}

defineExpose({ focus: () => input.value?.focus() })
</script>

<template>
  <FieldFrame
    v-bind="rootAttrs"
    :control-id="id"
    :hint-id="hintId"
    :error-id="errorId"
    :label="label"
    :label-hidden="labelHidden"
    :hint="hint"
    :error="error"
    :required="required"
    :required-label="requiredLabel"
  >
    <div :class="fieldBoxClass({ invalid: !!error, disabled })">
      <span v-if="$slots.leading" aria-hidden="true" class="flex text-secondary-label">
        <slot name="leading" />
      </span>
      <input
        :id="id"
        ref="input"
        v-bind="controlAttrs"
        :value="display"
        type="text"
        :inputmode="maxFractionDigits > 0 ? 'decimal' : 'numeric'"
        autocomplete="off"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :readonly="readonly"
        :aria-invalid="error ? true : undefined"
        :aria-describedby="describedBy"
        class="tabular-nums"
        :class="fieldControlClass"
        @input="onInput"
        @compositionstart="onCompositionStart"
        @compositionend="onCompositionEnd"
        @keydown="onKeydown"
        @blur="onBlur"
      />
      <span v-if="$slots.trailing" aria-hidden="true" class="flex text-secondary-label">
        <slot name="trailing" />
      </span>
    </div>
  </FieldFrame>
</template>
