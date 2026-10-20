<script setup>
import { Button, useToast } from '@vue-js-spa-components/ui'

// useToast() needs a <ToastProvider> higher up; this app renders one in App.vue.
const toast = useToast()
</script>

<template>
  <div class="flex flex-wrap gap-3">
    <Button @click="toast.show({ title: 'Draft saved', tone: 'success' })">Save draft</Button>
    <Button
      variant="gray"
      @click="
        toast.show({ title: 'Sync started', description: 'We will tell you when it finishes.' })
      "
    >
      Start sync
    </Button>
    <Button
      variant="tinted"
      tone="danger"
      @click="
        toast.show({
          title: 'Payment failed',
          description: 'The card was declined.',
          tone: 'danger',
        })
      "
    >
      Simulate an error
    </Button>
    <Button
      variant="plain"
      @click="
        toast.show({ title: 'Pinned message', description: 'Stays until dismissed.', duration: 0 })
      "
    >
      Show a sticky toast
    </Button>
  </div>
</template>
