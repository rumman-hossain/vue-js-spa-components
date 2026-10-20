<script setup>
import { Button, FileUpload } from '@vue-js-spa-components/ui'
import { computed, onBeforeUnmount, ref } from 'vue'

/** @type {import('vue').Ref<any[]>} */
const files = ref([])
const timers = new Set()

const ready = computed(() => files.value.filter((item) => item.status === 'ready'))

/** Simulated upload so the demo shows progress without a server. */
function uploadAll() {
  for (const item of ready.value) {
    item.status = 'uploading'
    item.progress = 0
    const timer = setInterval(() => {
      item.progress = Math.min(100, item.progress + 10 + Math.round(Math.random() * 15))
      if (item.progress === 100) {
        clearInterval(timer)
        timers.delete(timer)
        // Files named like "fail…" show the error state.
        if (item.file.name.toLowerCase().startsWith('fail')) {
          item.status = 'error'
          item.error = 'The server rejected this file.'
        } else {
          item.status = 'done'
        }
      }
    }, 150)
    timers.add(timer)
  }
}

onBeforeUnmount(() => timers.forEach((timer) => clearInterval(timer)))
</script>

<template>
  <div class="grid max-w-lg gap-3">
    <FileUpload
      v-model="files"
      label="Receipts"
      hint="Images or PDF, up to 5 MB each, 4 files at most."
      accept="image/*,.pdf"
      :max-size="5 * 1024 * 1024"
      :max-files="4"
      multiple
    />
    <div>
      <Button :disabled="ready.length === 0" @click="uploadAll"
        >Upload {{ ready.length || '' }}</Button
      >
    </div>
    <p class="text-footnote text-secondary-label">
      Upload is simulated here. The Users page imports a real CSV with live progress.
    </p>
  </div>
</template>
