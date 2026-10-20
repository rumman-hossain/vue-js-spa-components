<script setup>
defineProps({
  shape: {
    type: /** @type {import('vue').PropType<'text' | 'rect' | 'circle'>} */ (String),
    default: 'text',
    validator: (/** @type {string} */ value) => ['text', 'rect', 'circle'].includes(value),
  },
})

const SHAPES = {
  text: 'h-[1em] w-full rounded-control',
  rect: 'h-24 w-full rounded-card',
  circle: 'size-10 rounded-full',
}
</script>

<template>
  <!-- Decorative: the region being loaded should carry aria-busy and a status message instead. -->
  <span aria-hidden="true" class="shimmer block" :class="SHAPES[shape]" />
</template>

<style scoped>
/* Reduced motion is handled globally by the theme: the animation runs once and stops. */
.shimmer {
  background: linear-gradient(
    90deg,
    var(--ui-fill) 25%,
    var(--ui-tertiary-fill) 50%,
    var(--ui-fill) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.6s linear infinite;
}

@keyframes shimmer {
  from {
    background-position: 100% 0;
  }
  to {
    background-position: -100% 0;
  }
}
</style>
