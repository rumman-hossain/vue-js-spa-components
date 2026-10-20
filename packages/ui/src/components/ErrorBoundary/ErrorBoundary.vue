<script setup>
import { onErrorCaptured, ref, shallowRef } from 'vue'
import ErrorState from '../ErrorState/ErrorState.vue'

/**
 * Catches errors thrown while rendering, setting up or updating the components in its slot
 * (including their lifecycle hooks and event handlers) and shows a fallback instead of a broken
 * screen. "Try again" re-creates the slot content from scratch.
 *
 * The raw error message is not shown by default: it may contain internals not meant for users.
 * Report it through the `error` event and use the `#fallback="{ error, reset }"` slot to customise.
 */
defineProps({
  fallbackTitle: { type: String, default: 'Something went wrong' },
  fallbackMessage: { type: String, default: 'This part of the page could not be shown.' },
  retryLabel: { type: String, default: 'Try again' },
  headingLevel: {
    type: /** @type {import('vue').PropType<1 | 2 | 3 | 4 | 5 | 6>} */ (Number),
    default: 2,
  },
})

const emit = defineEmits({
  /**
   * @param {unknown} _error
   * @param {string} _info Vue's description of where it was thrown, e.g. "render function".
   */
  error: (_error, _info) => true,
})

const error = shallowRef(/** @type {unknown} */ (null))
const failed = ref(false)
/** Bumped on reset so the slot content is mounted again with fresh state. */
const generation = ref(0)

onErrorCaptured((caught, _instance, info) => {
  error.value = caught
  failed.value = true
  emit('error', caught, info)
  return false // handled here: do not reach app.config.errorHandler or the console
})

function reset() {
  error.value = null
  failed.value = false
  generation.value++
}

defineExpose({ reset })
</script>

<template>
  <slot v-if="failed" name="fallback" :error="error" :reset="reset">
    <ErrorState
      :title="fallbackTitle"
      :message="fallbackMessage"
      :retry-label="retryLabel"
      :heading-level="headingLevel"
      alert
      @retry="reset"
    />
  </slot>
  <div v-else :key="generation" class="contents">
    <slot />
  </div>
</template>
