<script setup>
import { TextField } from '@vue-js-spa-components/ui'
import { Mail } from 'lucide-vue-next'
import { computed, ref } from 'vue'

const email = ref('')
const touched = ref(false)

// Judged on blur, so nobody is told off while still typing.
const error = computed(() =>
  touched.value && email.value !== '' && !/^\S+@\S+\.\S+$/.test(email.value)
    ? 'Enter an address like name@example.com.'
    : undefined,
)
</script>

<template>
  <div class="flex max-w-md flex-col gap-4">
    <TextField
      v-model="email"
      label="Work email"
      type="email"
      autocomplete="email"
      hint="We send invoices to this address."
      required
      :error="error"
      @blur="touched = true"
    >
      <template #leading><Mail :size="18" /></template>
    </TextField>
    <TextField model-value="ACME-2041" label="Customer number" readonly />
    <p class="text-footnote text-secondary-label">
      v-model: <span class="font-mono">{{ JSON.stringify(email) }}</span>
    </p>
  </div>
</template>
