<script setup>
import { Combobox } from '@vue-js-spa-components/ui'
import { ref } from 'vue'

const AIRPORTS = [
  { value: 'HND', label: 'Tokyo Haneda (HND)' },
  { value: 'NRT', label: 'Tokyo Narita (NRT)' },
  { value: 'KIX', label: 'Osaka Kansai (KIX)' },
  { value: 'ITM', label: 'Osaka Itami (ITM)' },
  { value: 'NGO', label: 'Nagoya Chubu (NGO)' },
  { value: 'CTS', label: 'Sapporo New Chitose (CTS)' },
  { value: 'FUK', label: 'Fukuoka (FUK)' },
  { value: 'OKA', label: 'Okinawa Naha (OKA)', disabled: true },
]

const airport = ref(/** @type {string | number | null} */ (null))
</script>

<template>
  <div class="flex max-w-md flex-col gap-4">
    <Combobox
      v-model="airport"
      label="Departure airport"
      placeholder="Type a city or code"
      :options="AIRPORTS"
      hint="Arrow keys move through the list, Enter picks, Escape closes or clears."
      no-results-label="No airports match"
    />
    <p class="text-footnote text-secondary-label">
      v-model: <span class="font-mono">{{ JSON.stringify(airport) }}</span>
    </p>
  </div>
</template>
