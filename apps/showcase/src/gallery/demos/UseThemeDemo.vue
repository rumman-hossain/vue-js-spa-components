<script setup>
import { SegmentedControl, useTheme } from '@vue-js-spa-components/ui'
import { computed } from 'vue'

const theme = useTheme()

const LABELS = { system: 'Automatic', light: 'Light', dark: 'Dark' }
const options = theme.modes.map((mode) => ({ value: mode, label: LABELS[mode] }))

const mode = computed({
  get: () => theme.mode.value,
  set: (value) => theme.setMode(value),
})
</script>

<template>
  <div class="flex flex-col gap-3">
    <SegmentedControl v-model="mode" label="Appearance" label-visible :options="options" />
    <p class="text-footnote text-secondary-label">
      mode: {{ theme.mode.value }}, showing {{ theme.isDark.value ? 'dark' : 'light' }} colors. The
      choice is saved and shared with the Settings page.
    </p>
  </div>
</template>
