<script setup>
import { useTemplateRef } from 'vue'
import FieldFrame from '../_shared/FieldFrame.vue'
import { fieldBoxClass, fieldControlClass } from '../_shared/fieldClasses.js'
import { useField } from '../_shared/useField.js'

/** @typedef {'text' | 'email' | 'url' | 'tel' | 'password' | 'search'} TextFieldType */
/** @typedef {'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url'} InputMode */

const props = defineProps({
  label: { type: String, required: true },
  labelHidden: { type: Boolean, default: false },
  hint: { type: String, default: undefined },
  /** Error message. When set the field is marked invalid and the message is announced with it. */
  error: { type: String, default: undefined },
  type: {
    type: /** @type {import('vue').PropType<TextFieldType>} */ (String),
    default: 'text',
  },
  placeholder: { type: String, default: undefined },
  required: { type: Boolean, default: false },
  requiredLabel: { type: String, default: 'Required' },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  autocomplete: { type: String, default: undefined },
  inputmode: {
    type: /** @type {import('vue').PropType<InputMode>} */ (String),
    default: undefined,
  },
  maxlength: { type: Number, default: undefined },
  id: { type: String, default: undefined },
})

const emit = defineEmits({
  /** @param {FocusEvent} _event */
  blur: (_event) => true,
})

defineOptions({ inheritAttrs: false })

const model = defineModel({ type: String, default: '' })

const { id, hintId, errorId, describedBy, rootAttrs, controlAttrs } = useField(props)
const input = useTemplateRef('input')

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
      <!-- Native v-model already waits for compositionend, so IME input is never rewritten mid-word. -->
      <input
        :id="id"
        ref="input"
        v-model="model"
        v-bind="controlAttrs"
        :type="type"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :readonly="readonly"
        :autocomplete="autocomplete"
        :inputmode="inputmode"
        :maxlength="maxlength"
        :aria-invalid="error ? true : undefined"
        :aria-describedby="describedBy"
        :class="fieldControlClass"
        @blur="emit('blur', $event)"
      />
      <slot name="trailing" />
    </div>
  </FieldFrame>
</template>
