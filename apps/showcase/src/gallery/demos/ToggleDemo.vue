<script setup>
import { Toggle } from '@vue-js-spa-components/ui'
import { ref } from 'vue'

const autoJoin = ref(true)
const lowPower = ref(false)
</script>

<template>
  <div class="flex max-w-md flex-col gap-1">
    <Toggle
      v-model="autoJoin"
      label="Join known networks"
      description="Connects automatically when one is in range."
    />
    <Toggle v-model="lowPower" label="Low power mode" />
    <Toggle label="Beta updates" description="Managed by your organization." disabled />
    <p class="mt-2 text-footnote text-secondary-label">
      autoJoin: {{ autoJoin }}, lowPower: {{ lowPower }}
    </p>
  </div>
</template>
