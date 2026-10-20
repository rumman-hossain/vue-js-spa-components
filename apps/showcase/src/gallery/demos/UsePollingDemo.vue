<script setup>
import { Button, ProgressBar, usePolling } from '@vue-js-spa-components/ui'
import { ref } from 'vue'

let load = 42
const failNext = ref(false)

/**
 * Simulated metrics endpoint: the current load in percent.
 * @returns {Promise<number>}
 */
function fetchLoad() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (failNext.value) {
        failNext.value = false
        reject(new Error('Timed out'))
        return
      }
      load = Math.min(100, Math.max(0, load + Math.round(Math.random() * 16 - 8)))
      resolve(load)
    }, 300)
  })
}

const polling = usePolling(fetchLoad, { interval: 3000, maxInterval: 24_000 })
</script>

<template>
  <div class="flex max-w-md flex-col gap-4">
    <ProgressBar label="Server load" :value="polling.data.value ?? null" />
    <div class="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant="gray"
        @click="polling.isActive.value ? polling.pause() : polling.resume()"
      >
        {{ polling.isActive.value ? 'Pause' : 'Resume' }}
      </Button>
      <Button
        size="sm"
        variant="gray"
        :loading="polling.isFetching.value"
        @click="polling.refresh()"
      >
        Refresh now
      </Button>
      <Button size="sm" variant="plain" tone="danger" @click="failNext = true">
        Fail the next request
      </Button>
    </div>
    <p class="text-footnote text-secondary-label">
      Every 3 s while active. Failures in a row: {{ polling.failures.value }} (the delay doubles
      each time). {{ polling.error.value ? `Last error: ${String(polling.error.value)}` : '' }}
    </p>
  </div>
</template>
