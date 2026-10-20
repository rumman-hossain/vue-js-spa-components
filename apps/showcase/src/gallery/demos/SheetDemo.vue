<script setup>
import { Button, RadioGroup, Sheet } from '@vue-js-spa-components/ui'
import { computed, ref } from 'vue'

const ORDERS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'amount', label: 'Highest amount' },
]

const open = ref(false)
const order = ref(/** @type {string | number | null} */ ('newest'))
const orderLabel = computed(() => ORDERS.find((option) => option.value === order.value)?.label)
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <Button variant="tinted" @click="open = true">Sort orders</Button>
    <span class="text-subhead text-label">Sorted by: {{ orderLabel }}</span>
    <Sheet
      v-model:open="open"
      title="Sort orders"
      description="Slides up from the bottom on phones."
      size="sm"
    >
      <RadioGroup v-model="order" label="Sort by" label-hidden :options="ORDERS" />
      <template #footer>
        <Button @click="open = false">Done</Button>
      </template>
    </Sheet>
  </div>
</template>
