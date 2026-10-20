<script setup>
import { Spinner } from '@vue-js-spa-components/ui'
</script>

<template>
  <div class="flex flex-wrap items-center gap-8">
    <Spinner size="sm" label="Refreshing inbox" />
    <Spinner label="Loading orders" />
    <Spinner size="lg" label="Loading the quarterly report" />
    <span class="inline-flex items-center gap-2 rounded-field bg-tint-fill px-3 py-2 text-on-tint">
      <Spinner size="sm" color="inherit" label="Syncing" />
      <span aria-hidden="true" class="text-subhead font-semibold">Syncing</span>
    </span>
  </div>
</template>
