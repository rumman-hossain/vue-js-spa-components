<script setup>
import { ChevronsUpDown } from 'lucide-vue-next'
import FieldFrame from '../_shared/FieldFrame.vue'
import { fieldBoxClass } from '../_shared/fieldClasses.js'
import { useField } from '../_shared/useField.js'

const props = defineProps({
  label: { type: String, required: true },
  labelHidden: { type: Boolean, default: false },
  options: { type: /** @type {import('vue').PropType<SelectOption[]>} */ (Array), required: true },
  /** Shown while nothing is selected. It cannot be chosen again once a value is picked. */
  placeholder: { type: String, default: undefined },
  hint: { type: String, default: undefined },
  error: { type: String, default: undefined },
  required: { type: Boolean, default: false },
  requiredLabel: { type: String, default: 'Required' },
  disabled: { type: Boolean, default: false },
  id: { type: String, default: undefined },
})

const emit = defineEmits({
  /** @param {FocusEvent} _event */
  blur: (_event) => true,
})

/** @typedef {{ value: string | number, label: string, disabled?: boolean }} SelectOption */

defineOptions({ inheritAttrs: false })

const model = defineModel({
  type: /** @type {import('vue').PropType<string | number | null>} */ ([String, Number]),
  default: null,
})

const { id, hintId, errorId, describedBy, rootAttrs, controlAttrs } = useField(props)
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
    <div class="relative" :class="fieldBoxClass({ invalid: !!error, disabled })">
      <select
        :id="id"
        v-model="model"
        v-bind="controlAttrs"
        :required="required"
        :disabled="disabled"
        :aria-invalid="error ? true : undefined"
        :aria-describedby="describedBy"
        class="absolute inset-0 appearance-none rounded-field bg-transparent pr-10 pl-3 outline-none disabled:cursor-not-allowed"
        :class="model === null ? 'text-placeholder' : 'text-label'"
        @blur="emit('blur', $event)"
      >
        <option v-if="placeholder !== undefined" :value="null" disabled>{{ placeholder }}</option>
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          :disabled="option.disabled"
          class="text-label"
        >
          {{ option.label }}
        </option>
      </select>
      <ChevronsUpDown
        aria-hidden="true"
        class="pointer-events-none ml-auto size-4 text-secondary-label"
      />
    </div>
  </FieldFrame>
</template>
