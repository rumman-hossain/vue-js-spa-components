<script setup>
import { Badge } from '@vue-js-spa-components/ui'
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-2">
      <Badge>Draft</Badge>
      <Badge tone="accent">Invited</Badge>
      <Badge tone="success">Active</Badge>
      <Badge tone="warning">Suspended</Badge>
      <Badge tone="danger">Overdue</Badge>
    </div>
    <p class="flex items-center gap-2 text-body text-label">
      Invoices
      <Badge tone="danger">3 overdue</Badge>
    </p>
  </div>
</template>
