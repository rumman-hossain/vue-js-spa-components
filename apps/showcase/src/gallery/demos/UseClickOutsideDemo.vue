<script setup>
import { Button, TextArea, useClickOutside } from '@vue-js-spa-components/ui'
import { ref, useId, useTemplateRef } from 'vue'

const box = useTemplateRef('box')
const panelId = useId()
const open = ref(false)
const note = ref('')
const closedOutside = ref(0)

// Listens only while `open` is true.
useClickOutside(
  [box],
  () => {
    open.value = false
    closedOutside.value += 1
  },
  open,
)
</script>

<template>
  <div class="flex max-w-md flex-col gap-3">
    <div ref="box" class="flex flex-col gap-3">
      <Button
        variant="gray"
        :aria-expanded="open"
        :aria-controls="panelId"
        class="self-start"
        @click="open = !open"
      >
        Quick note
      </Button>
      <div v-show="open" :id="panelId" class="rounded-card border border-separator p-3">
        <TextArea v-model="note" label="Note" :rows="2" />
      </div>
    </div>
    <p class="text-footnote text-secondary-label">
      Closed by a press outside: {{ closedOutside }} times.
    </p>
  </div>
</template>
