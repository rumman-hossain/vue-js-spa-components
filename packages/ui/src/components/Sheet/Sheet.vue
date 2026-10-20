<script setup>
import Dialog from '../Dialog/Dialog.vue'

/**
 * A Dialog that slides up from the bottom edge on small screens and is centered on wide ones.
 * Same behaviour, props and slots as Dialog; only the placement differs.
 */
const props = defineProps({
  title: { type: String, required: true },
  titleHidden: { type: Boolean, default: false },
  description: { type: String, default: undefined },
  size: {
    type: /** @type {import('vue').PropType<'sm' | 'md' | 'lg'>} */ (String),
    default: 'md',
  },
  dismissible: { type: Boolean, default: true },
  closeLabel: { type: String, default: 'Close' },
})

const emit = defineEmits(['close'])

const open = defineModel('open', { type: Boolean, default: false })
</script>

<template>
  <Dialog v-model:open="open" v-bind="props" placement="sheet" @close="emit('close')">
    <template v-if="$slots.default" #default><slot /></template>
    <template v-if="$slots.footer" #footer><slot name="footer" /></template>
  </Dialog>
</template>
