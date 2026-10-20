<script setup>
import {
  BUTTON_SIZES,
  BUTTON_TONES,
  BUTTON_VARIANTS,
  buttonVariantClass,
} from '../_shared/buttonClasses.js'

defineProps({
  /** Accessible name. Required because the button shows only an icon. */
  label: { type: String, required: true },
  variant: {
    type: /** @type {import('vue').PropType<import('../_shared/buttonClasses.js').ButtonVariant>} */ (
      String
    ),
    default: 'plain',
    validator: (/** @type {any} */ value) => BUTTON_VARIANTS.includes(value),
  },
  tone: {
    type: /** @type {import('vue').PropType<import('../_shared/buttonClasses.js').ButtonTone>} */ (
      String
    ),
    default: 'accent',
    validator: (/** @type {any} */ value) => BUTTON_TONES.includes(value),
  },
  size: {
    type: /** @type {import('vue').PropType<import('../_shared/buttonClasses.js').ButtonSize>} */ (
      String
    ),
    default: 'md',
    validator: (/** @type {any} */ value) => BUTTON_SIZES.includes(value),
  },
  type: {
    type: /** @type {import('vue').PropType<'button' | 'submit' | 'reset'>} */ (String),
    default: 'button',
  },
  disabled: { type: Boolean, default: false },
})

const SIZE_CLASSES = {
  sm: 'size-8 [&_svg]:size-4',
  md: 'size-11 [&_svg]:size-5',
  lg: 'size-[3.125rem] [&_svg]:size-6',
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :aria-label="label"
    class="rounded-full"
    :class="[buttonVariantClass(variant, tone), SIZE_CLASSES[size]]"
  >
    <span aria-hidden="true" class="inline-flex">
      <slot />
    </span>
  </button>
</template>
