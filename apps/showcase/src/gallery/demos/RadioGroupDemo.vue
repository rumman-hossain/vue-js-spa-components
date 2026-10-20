<script setup>
import { RadioGroup } from '@vue-js-spa-components/ui'
import { ref } from 'vue'

const SPEEDS = [
  { value: 'standard', label: 'Standard', description: '3–5 business days, free' },
  { value: 'express', label: 'Express', description: 'Next business day, ¥800' },
  {
    value: 'same-day',
    label: 'Same day',
    description: 'Not available for this address',
    disabled: true,
  },
]
const SIZES = [
  { value: 's', label: 'Small' },
  { value: 'm', label: 'Medium' },
  { value: 'l', label: 'Large' },
]

const speed = ref(/** @type {string | number | null} */ ('standard'))
const size = ref(/** @type {string | number | null} */ ('m'))
</script>

<template>
  <div class="flex max-w-md flex-col gap-6">
    <RadioGroup
      v-model="speed"
      label="Delivery speed"
      :options="SPEEDS"
      hint="Prices include tax."
    />
    <RadioGroup v-model="size" label="Box size" orientation="horizontal" :options="SIZES" />
    <p class="text-footnote text-secondary-label">speed: {{ speed }}, size: {{ size }}</p>
  </div>
</template>
