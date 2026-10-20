<script setup>
import { computed } from 'vue'
import Spinner from '../Spinner/Spinner.vue'
import {
  BUTTON_SIZES,
  BUTTON_TONES,
  BUTTON_VARIANTS,
  buttonVariantClass,
} from '../_shared/buttonClasses.js'

const props = defineProps({
  variant: {
    type: /** @type {import('vue').PropType<import('../_shared/buttonClasses.js').ButtonVariant>} */ (
      String
    ),
    default: 'filled',
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
  /** Renders a link instead of a button. */
  href: { type: String, default: undefined },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  /** Stretches to the full width of the container. */
  block: { type: Boolean, default: false },
})

const SIZE_CLASSES = {
  sm: 'min-h-8 gap-1 rounded-control px-3 text-subhead',
  md: 'min-h-11 gap-1.5 rounded-field px-4 text-body',
  lg: 'min-h-[3.125rem] gap-2 rounded-card px-5 text-headline',
}

const inactive = computed(() => props.disabled || props.loading)

// Links cannot be disabled natively: drop `href` so they stop navigating and mark them instead.
const elementAttrs = computed(() =>
  props.href
    ? {
        href: inactive.value ? undefined : props.href,
        role: inactive.value ? 'link' : undefined,
        'aria-disabled': inactive.value || undefined,
      }
    : { type: props.type, disabled: inactive.value },
)
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    v-bind="elementAttrs"
    :aria-busy="loading || undefined"
    class="relative"
    :class="[buttonVariantClass(variant, tone), SIZE_CLASSES[size], { 'w-full': block }]"
  >
    <!-- Transparent rather than hidden while loading: keeps the width and the accessible name. -->
    <span class="inline-flex items-center gap-[inherit]" :class="{ 'opacity-0': loading }">
      <span v-if="$slots.leading" aria-hidden="true" class="inline-flex">
        <slot name="leading" />
      </span>
      <slot />
      <span v-if="$slots.trailing" aria-hidden="true" class="inline-flex">
        <slot name="trailing" />
      </span>
    </span>
    <span v-if="loading" aria-hidden="true" class="absolute inset-0 grid place-items-center">
      <Spinner size="sm" class="text-current" />
    </span>
  </component>
</template>
