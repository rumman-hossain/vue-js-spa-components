<script setup>
import { TriangleAlert } from 'lucide-vue-next'
import Button from '../Button/Button.vue'

defineProps({
  title: { type: String, default: 'Something went wrong' },
  message: { type: String, default: undefined },
  /** Label of the retry button. An empty string hides the button. */
  retryLabel: { type: String, default: 'Try again' },
  /** Shows a spinner on the retry button while a retry is in flight. */
  retrying: { type: Boolean, default: false },
  /** Announces the error immediately. Use when it replaces content the user was waiting for. */
  alert: { type: Boolean, default: false },
  headingLevel: {
    type: /** @type {import('vue').PropType<2 | 3 | 4 | 5 | 6>} */ (Number),
    default: 2,
  },
})

const emit = defineEmits(['retry'])
</script>

<template>
  <div
    :role="alert ? 'alert' : undefined"
    class="flex flex-col items-center gap-2 px-6 py-12 text-center"
  >
    <TriangleAlert aria-hidden="true" class="mb-2 size-12 text-warning" />
    <component :is="`h${headingLevel}`" class="text-title-3 text-label">{{ title }}</component>
    <p v-if="message" class="max-w-prose text-subhead text-secondary-label">{{ message }}</p>
    <Button
      v-if="retryLabel"
      variant="tinted"
      class="mt-4"
      :loading="retrying"
      @click="emit('retry')"
    >
      {{ retryLabel }}
    </Button>
  </div>
</template>
