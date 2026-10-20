<script setup>
import { watch } from 'vue'
import Button from '../Button/Button.vue'
import Dialog from '../Dialog/Dialog.vue'

const props = defineProps({
  title: { type: String, required: true },
  /** Explains the consequence; wired as the accessible description, as alert dialogs require. */
  message: { type: String, default: undefined },
  confirmLabel: { type: String, default: 'Confirm' },
  cancelLabel: { type: String, default: 'Cancel' },
  /** `danger` styles the confirm button as destructive and puts initial focus on Cancel. */
  tone: {
    type: /** @type {import('vue').PropType<'accent' | 'danger'>} */ (String),
    default: 'accent',
    validator: (/** @type {string} */ value) => ['accent', 'danger'].includes(value),
  },
})

const emit = defineEmits(['confirm', 'cancel'])

const open = defineModel('open', { type: Boolean, default: false })

/** Whether the current opening was already answered with confirm. */
let confirmed = false
// Sync: a confirm followed immediately by a new opening must start a fresh answer.
watch(open, (isOpen) => isOpen && (confirmed = false), { flush: 'sync' })

function confirm() {
  confirmed = true
  emit('confirm')
  open.value = false
}

/** Every way of closing that is not the confirm button (Cancel, Escape) counts as cancel. */
function onClose() {
  if (!confirmed) emit('cancel')
  confirmed = false
}

const dangerous = () => props.tone === 'danger'
</script>

<template>
  <Dialog
    v-model:open="open"
    :title="title"
    :description="message"
    size="sm"
    alert
    @close="onClose"
  >
    <template v-if="$slots.default" #default><slot /></template>
    <template #footer>
      <!-- The least destructive action gets focus first when the confirm action is destructive. -->
      <Button variant="gray" :data-autofocus="dangerous() ? '' : undefined" @click="open = false">
        {{ cancelLabel }}
      </Button>
      <Button :tone="tone" :data-autofocus="dangerous() ? undefined : ''" @click="confirm">
        {{ confirmLabel }}
      </Button>
    </template>
  </Dialog>
</template>
