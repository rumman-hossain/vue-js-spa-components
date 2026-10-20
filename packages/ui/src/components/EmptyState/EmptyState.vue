<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: undefined },
  headingLevel: {
    type: /** @type {import('vue').PropType<2 | 3 | 4 | 5 | 6>} */ (Number),
    default: 2,
  },
})
</script>

<template>
  <div class="flex flex-col items-center gap-2 px-6 py-12 text-center">
    <span
      v-if="$slots.icon"
      aria-hidden="true"
      class="mb-2 flex text-tertiary-label [&_svg]:size-12"
    >
      <slot name="icon" />
    </span>
    <component :is="`h${headingLevel}`" class="text-title-3 text-label">{{ title }}</component>
    <p v-if="description" class="max-w-prose text-subhead text-secondary-label">
      {{ description }}
    </p>
    <div v-if="$slots.actions" class="mt-4 flex flex-wrap justify-center gap-3">
      <slot name="actions" />
    </div>
  </div>
</template>
