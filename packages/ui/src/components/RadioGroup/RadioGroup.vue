<script setup>
import { computed, useId } from 'vue'

/**
 * @typedef {{ value: string | number, label: string, description?: string, disabled?: boolean }} RadioOption
 */

const props = defineProps({
  /** Rendered as the fieldset legend. */
  label: { type: String, required: true },
  labelHidden: { type: Boolean, default: false },
  options: { type: /** @type {import('vue').PropType<RadioOption[]>} */ (Array), required: true },
  hint: { type: String, default: undefined },
  error: { type: String, default: undefined },
  orientation: {
    type: /** @type {import('vue').PropType<'vertical' | 'horizontal'>} */ (String),
    default: 'vertical',
  },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  /** Form field name. Generated when omitted so groups never share arrow-key navigation. */
  name: { type: String, default: undefined },
})

const model = defineModel({
  type: /** @type {import('vue').PropType<string | number | null>} */ ([String, Number]),
  default: null,
})

const baseId = useId()
const groupName = computed(() => props.name ?? baseId)
const describedBy = computed(
  () =>
    [props.error && `${baseId}-error`, props.hint && `${baseId}-hint`].filter(Boolean).join(' ') ||
    undefined,
)
</script>

<template>
  <fieldset
    :disabled="disabled"
    :aria-describedby="describedBy"
    :aria-invalid="error ? true : undefined"
    class="m-0 min-w-0 border-0 p-0"
  >
    <legend
      class="mb-1.5 p-0 text-subhead font-medium text-label"
      :class="{ 'visually-hidden': labelHidden }"
    >
      {{ label }}
    </legend>
    <div class="flex" :class="orientation === 'horizontal' ? 'flex-wrap gap-x-6' : 'flex-col'">
      <label
        v-for="(option, index) in options"
        :key="option.value"
        :for="`${baseId}-${index}`"
        class="flex min-h-11 items-start gap-3 py-2.5"
        :class="disabled || option.disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'"
      >
        <input
          :id="`${baseId}-${index}`"
          v-model="model"
          type="radio"
          :name="groupName"
          :value="option.value"
          :disabled="option.disabled"
          :required="required"
          :aria-labelledby="option.description ? `${baseId}-${index}-label` : undefined"
          :aria-describedby="option.description ? `${baseId}-${index}-description` : undefined"
          class="focus-ring mt-px size-[1.375rem] shrink-0 appearance-none rounded-full border-2 border-control-border bg-background transition-[border] duration-150 ease-standard checked:border-[0.4375rem] checked:border-tint-fill disabled:cursor-not-allowed"
        />
        <span class="flex flex-col">
          <span :id="`${baseId}-${index}-label`" class="text-body text-label">
            {{ option.label }}
          </span>
          <span
            v-if="option.description"
            :id="`${baseId}-${index}-description`"
            class="text-footnote text-secondary-label"
          >
            {{ option.description }}
          </span>
        </span>
      </label>
    </div>
    <p v-if="error" :id="`${baseId}-error`" class="mt-1.5 text-footnote text-danger">
      {{ error }}
    </p>
    <p v-if="hint" :id="`${baseId}-hint`" class="mt-1.5 text-footnote text-secondary-label">
      {{ hint }}
    </p>
  </fieldset>
</template>
