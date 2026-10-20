<script setup>
import { TextArea } from '@vue-js-spa-components/ui'
import { ref } from 'vue'

const notes = ref('Fixed: invoices now show the tax rate.')
</script>

<template>
  <div class="flex max-w-lg flex-col gap-4">
    <TextArea
      v-model="notes"
      label="Release notes"
      hint="Grows with its content. The counter is read out politely."
      :maxlength="280"
      :rows="2"
      auto-grow
    />
  </div>
</template>
