<script setup>
import { onBeforeUnmount, provide, ref, shallowRef } from 'vue'
import { CONFIRM_KEY } from '../../composables/useConfirm.js'
import AlertDialog from '../AlertDialog/AlertDialog.vue'

/**
 * Renders one shared AlertDialog and provides the `confirm()` function returned by
 * `useConfirm()` to everything in its default slot.
 */

const open = ref(false)
const options = shallowRef(
  /** @type {import('../../composables/useConfirm.js').ConfirmOptions} */ ({ title: '' }),
)

/** @type {((answer: boolean) => void) | null} */
let resolvePending = null

/** @param {boolean} answer */
function settle(answer) {
  resolvePending?.(answer)
  resolvePending = null
}

/** @type {import('../../composables/useConfirm.js').ConfirmFunction} */
function confirm(next) {
  // Only one question at a time: a newer request replaces (and cancels) the one on screen.
  settle(false)
  options.value = next
  open.value = true
  return new Promise((resolve) => {
    resolvePending = resolve
  })
}

provide(CONFIRM_KEY, confirm)
onBeforeUnmount(() => settle(false))
</script>

<template>
  <slot />
  <AlertDialog
    v-model:open="open"
    :title="options.title"
    :message="options.message"
    :confirm-label="options.confirmLabel"
    :cancel-label="options.cancelLabel"
    :tone="options.tone"
    @confirm="settle(true)"
    @cancel="settle(false)"
  />
</template>
