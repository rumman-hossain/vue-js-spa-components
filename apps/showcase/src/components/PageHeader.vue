<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: undefined },
})
</script>

<template>
  <header class="flex flex-wrap items-end justify-between gap-4 pb-6">
    <div class="min-w-0">
      <h1 class="text-large-title text-label outline-none">{{ title }}</h1>
      <p v-if="subtitle" class="mt-1 max-w-prose text-subhead text-secondary-label">
        {{ subtitle }}
      </p>
    </div>
    <div v-if="$slots.actions" class="flex flex-wrap gap-2">
      <slot name="actions" />
    </div>
  </header>
</template>
