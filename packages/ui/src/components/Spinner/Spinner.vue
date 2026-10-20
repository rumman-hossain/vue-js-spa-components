<script setup>
defineProps({
  /** Announced to assistive technology; never shown. */
  label: { type: String, default: 'Loading' },
  size: {
    type: /** @type {import('vue').PropType<'sm' | 'md' | 'lg'>} */ (String),
    default: 'md',
    validator: (/** @type {string} */ value) => ['sm', 'md', 'lg'].includes(value),
  },
})

const SIZES = {
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-8',
}
</script>

<template>
  <span role="status" class="inline-flex text-secondary-label">
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      class="animate-spin"
      :class="SIZES[size]"
    >
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" stroke-width="3" opacity="0.25" />
      <path
        d="M12 2.5a9.5 9.5 0 0 1 9.5 9.5"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
      />
    </svg>
    <span class="visually-hidden">{{ label }}</span>
  </span>
</template>
