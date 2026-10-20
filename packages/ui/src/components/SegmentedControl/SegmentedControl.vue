<script setup>
import { computed, useId } from 'vue'

/** @typedef {{ value: string | number, label: string, disabled?: boolean }} SegmentOption */

const props = defineProps({
  /** Accessible name of the group. Hidden visually unless `labelVisible` is set. */
  label: { type: String, required: true },
  labelVisible: { type: Boolean, default: false },
  options: { type: /** @type {import('vue').PropType<SegmentOption[]>} */ (Array), required: true },
  size: { type: /** @type {import('vue').PropType<'sm' | 'md'>} */ (String), default: 'md' },
  disabled: { type: Boolean, default: false },
  name: { type: String, default: undefined },
})

const model = defineModel({
  type: /** @type {import('vue').PropType<string | number | null>} */ ([String, Number]),
  default: null,
})

const baseId = useId()
const groupName = computed(() => props.name ?? baseId)
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <span
      :id="`${baseId}-label`"
      class="text-subhead font-medium text-label"
      :class="{ 'visually-hidden': !labelVisible }"
    >
      {{ label }}
    </span>
    <!-- Native radios give arrow-key selection and form submission for free; only the look changes. -->
    <div
      role="radiogroup"
      :aria-labelledby="`${baseId}-label`"
      class="inline-grid auto-cols-fr grid-flow-col gap-0.5 rounded-field bg-fill p-0.5"
      :class="{ 'opacity-40': disabled }"
    >
      <label
        v-for="(option, index) in options"
        :key="option.value"
        :for="`${baseId}-${index}`"
        class="relative flex"
        :class="disabled || option.disabled ? 'cursor-not-allowed' : 'cursor-pointer'"
      >
        <input
          :id="`${baseId}-${index}`"
          v-model="model"
          type="radio"
          :name="groupName"
          :value="option.value"
          :disabled="disabled || option.disabled"
          class="peer visually-hidden"
        />
        <span
          class="flex flex-1 items-center justify-center rounded-control px-3 text-center text-subhead font-medium text-label transition-[background-color,box-shadow] duration-200 ease-standard peer-checked:bg-elevated peer-checked:shadow-card peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-tint/55 peer-disabled:text-tertiary-label"
          :class="size === 'sm' ? 'min-h-7' : 'min-h-10'"
        >
          {{ option.label }}
        </span>
      </label>
    </div>
  </div>
</template>
