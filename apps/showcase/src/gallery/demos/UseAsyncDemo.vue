<script setup>
import { Button, TextField, useAsync } from '@vue-js-spa-components/ui'
import { ref } from 'vue'

const code = ref('100-0001')
const aborted = ref(0)

/**
 * Simulated request that honours the abort signal like `fetch` does.
 * @param {string} postalCode
 * @param {AbortSignal} signal
 * @returns {Promise<string>}
 */
function lookupPostalCode(postalCode, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      if (!/^\d{3}-?\d{4}$/.test(postalCode)) reject(new Error('Postal codes look like 100-0001.'))
      else resolve(`${postalCode}: Chiyoda, Tokyo`)
    }, 900)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      aborted.value += 1
      reject(new DOMException('Superseded', 'AbortError'))
    })
  })
}

const lookup = useAsync(({ signal }, /** @type {string} */ value) =>
  lookupPostalCode(value, signal),
)
</script>

<template>
  <div class="flex max-w-md flex-col gap-4">
    <form class="flex items-end gap-2" @submit.prevent="lookup.execute(code)">
      <TextField v-model="code" label="Postal code" inputmode="numeric" class="flex-1" />
      <Button type="submit" variant="tinted">Look up</Button>
    </form>
    <p role="status" class="text-subhead text-label">
      <template v-if="lookup.isPending.value">Looking up…</template>
      <template v-else-if="lookup.error.value">{{ String(lookup.error.value) }}</template>
      <template v-else-if="lookup.data.value">{{ lookup.data.value }}</template>
    </p>
    <p class="text-footnote text-secondary-label">
      status: {{ lookup.status.value }}. Press “Look up” twice quickly: the first request is aborted
      ({{ aborted }} so far) and can never overwrite the newer answer.
    </p>
  </div>
</template>
