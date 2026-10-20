<script setup>
defineProps({
  tone: {
    type: /** @type {import('vue').PropType<'neutral' | 'accent' | 'success' | 'warning' | 'danger'>} */ (
      String
    ),
    default: 'neutral',
    validator: (/** @type {string} */ value) =>
      ['neutral', 'accent', 'success', 'warning', 'danger'].includes(value),
  },
})

const TONES = {
  neutral: 'bg-fill text-secondary-label',
  accent: 'bg-tint/15 text-tint',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-danger/15 text-danger',
}
</script>

<template>
  <span
    class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-caption font-semibold whitespace-nowrap"
    :class="TONES[tone]"
  >
    <slot />
  </span>
</template>
