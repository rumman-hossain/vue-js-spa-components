<script setup>
import { AlertDialog, Button, useConfirm } from '@vue-js-spa-components/ui'
import { ref } from 'vue'

// useConfirm() needs a <ConfirmProvider> higher up; this app renders one in App.vue.
const confirm = useConfirm()

const deleteOpen = ref(false)
const log = ref('No answer yet.')

async function archive() {
  const confirmed = await confirm({
    title: 'Archive 3 projects?',
    message: 'Archived projects become read-only. You can restore them later.',
    confirmLabel: 'Archive',
  })
  log.value = confirmed ? 'Archived: confirm() resolved true.' : 'Kept: confirm() resolved false.'
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap gap-3">
      <Button variant="tinted" @click="archive">Archive projects…</Button>
      <Button variant="plain" tone="danger" @click="deleteOpen = true">Delete workspace…</Button>
    </div>
    <p class="text-footnote text-secondary-label" aria-live="polite">{{ log }}</p>
    <AlertDialog
      v-model:open="deleteOpen"
      title="Delete workspace?"
      message="All projects and files are removed for everyone. This cannot be undone."
      confirm-label="Delete"
      tone="danger"
      @confirm="log = 'Deleted: the confirm event fired.'"
      @cancel="log = 'Cancelled: the cancel event fired.'"
    />
  </div>
</template>
