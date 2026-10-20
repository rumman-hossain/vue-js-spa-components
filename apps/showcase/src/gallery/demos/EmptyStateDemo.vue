<script setup>
import { Button, EmptyState } from '@vue-js-spa-components/ui'
import { Receipt } from 'lucide-vue-next'
</script>

<template>
  <EmptyState
    title="No invoices yet"
    description="Invoices appear here after your first billing cycle closes."
    :heading-level="3"
  >
    <template #icon><Receipt /></template>
    <template #actions>
      <Button>Create invoice</Button>
      <Button variant="gray">Import from CSV</Button>
    </template>
  </EmptyState>
</template>
