<script setup>
import { SegmentedControl } from '@vue-js-spa-components/ui'
import { ref } from 'vue'

const view = ref(/** @type {string | number | null} */ ('list'))
const range = ref(/** @type {string | number | null} */ ('week'))
</script>

<template>
  <div class="flex flex-col gap-5">
    <SegmentedControl
      v-model="view"
      label="View"
      label-visible
      :options="[
        { value: 'list', label: 'List' },
        { value: 'board', label: 'Board' },
        { value: 'calendar', label: 'Calendar' },
      ]"
    />
    <SegmentedControl
      v-model="range"
      label="Time range"
      size="sm"
      :options="[
        { value: 'day', label: 'Day' },
        { value: 'week', label: 'Week' },
        { value: 'month', label: 'Month' },
        { value: 'year', label: 'Year', disabled: true },
      ]"
    />
    <p class="text-footnote text-secondary-label">
      Showing the {{ view }} view for one {{ range }}.
    </p>
  </div>
</template>
