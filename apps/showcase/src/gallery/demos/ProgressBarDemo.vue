<script setup>
import { Button, ProgressBar } from '@vue-js-spa-components/ui'
import { computed, ref } from 'vue'

const TOTAL = 8
const uploaded = ref(3)
const valueText = computed(() => `${uploaded.value} of ${TOTAL} photos`)
</script>

<template>
  <div class="flex max-w-md flex-col gap-6">
    <ProgressBar label="Uploading photos" :value="uploaded" :max="TOTAL" :value-text="valueText" />
    <div class="flex flex-wrap gap-2">
      <Button size="sm" variant="gray" :disabled="uploaded === 0" @click="uploaded -= 1">
        Undo one
      </Button>
      <Button size="sm" variant="gray" :disabled="uploaded === TOTAL" @click="uploaded += 1">
        Upload next
      </Button>
    </div>
    <ProgressBar label="Preparing export" indeterminate />
  </div>
</template>
