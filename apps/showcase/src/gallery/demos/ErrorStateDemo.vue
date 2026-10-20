<script setup>
import { ErrorState } from '@vue-js-spa-components/ui'
import { onBeforeUnmount, ref } from 'vue'

const retrying = ref(false)
const attempts = ref(0)

/** @type {ReturnType<typeof setTimeout> | undefined} */
let timer

function retry() {
  retrying.value = true
  timer = setTimeout(() => {
    retrying.value = false
    attempts.value += 1
  }, 1000)
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <ErrorState
    title="Could not load invoices"
    :message="`The billing service did not respond. Retries so far: ${attempts}.`"
    :retrying="retrying"
    :heading-level="3"
    @retry="retry"
  />
</template>
