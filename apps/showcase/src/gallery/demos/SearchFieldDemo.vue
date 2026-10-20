<script setup>
import { SearchField } from '@vue-js-spa-components/ui'
import { computed, ref } from 'vue'

const CITIES = [
  'Fukuoka',
  'Hiroshima',
  'Kanazawa',
  'Kobe',
  'Kyoto',
  'Nagoya',
  'Naha',
  'Osaka',
  'Sapporo',
  'Sendai',
  'Tokyo',
  'Yokohama',
]

const text = ref('')
/** Updated by the `search` event: after a pause in typing, on Enter, or when cleared. */
const query = ref('')

const results = computed(() =>
  CITIES.filter((city) => city.toLowerCase().includes(query.value.trim().toLowerCase())),
)
</script>

<template>
  <div class="flex max-w-md flex-col gap-3">
    <SearchField
      v-model="text"
      label="Search cities"
      placeholder="Search cities"
      :debounce="250"
      @search="query = $event"
    />
    <p role="status" class="text-footnote text-secondary-label">
      {{ results.length }} {{ results.length === 1 ? 'city' : 'cities' }}
    </p>
    <ul class="flex flex-wrap gap-2">
      <li
        v-for="city in results"
        :key="city"
        class="rounded-full bg-fill px-3 py-1 text-subhead text-label"
      >
        {{ city }}
      </li>
    </ul>
  </div>
</template>
