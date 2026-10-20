<script setup>
import { Button } from '@vue-js-spa-components/ui'
import { Download, Trash2 } from 'lucide-vue-next'
import { onBeforeUnmount, ref } from 'vue'

const saving = ref(false)
const savedAt = ref('')

/** @type {ReturnType<typeof setTimeout> | undefined} */
let timer

function save() {
  saving.value = true
  timer = setTimeout(() => {
    saving.value = false
    savedAt.value = new Date().toLocaleTimeString()
  }, 1200)
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-3">
      <Button :loading="saving" @click="save">Save changes</Button>
      <Button variant="tinted">
        <template #leading><Download :size="16" /></template>
        Export CSV
      </Button>
      <Button variant="gray">Cancel</Button>
      <Button variant="plain" tone="danger">
        <template #leading><Trash2 :size="16" /></template>
        Delete
      </Button>
    </div>
    <div class="flex flex-wrap items-center gap-3">
      <Button size="sm" variant="tinted">Small</Button>
      <Button size="lg">Large</Button>
      <Button disabled>Disabled</Button>
      <Button variant="plain" href="#button">Link styled as a button</Button>
    </div>
    <p class="text-footnote text-secondary-label" aria-live="polite">
      {{ savedAt ? `Saved at ${savedAt}.` : 'Press “Save changes” to see the loading state.' }}
    </p>
  </div>
</template>
