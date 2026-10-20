<script setup>
import { SecureField } from '@vue-js-spa-components/ui'
import { computed, ref } from 'vue'

const MIN_LENGTH = 12
const password = ref('')

const hint = computed(() =>
  password.value.length >= MIN_LENGTH
    ? 'Long enough. Your password manager can save it now.'
    : `Use at least ${MIN_LENGTH} characters (${password.value.length} so far).`,
)
</script>

<template>
  <div class="flex max-w-md flex-col gap-4">
    <SecureField
      v-model="password"
      label="New password"
      autocomplete="new-password"
      :hint="hint"
      :maxlength="128"
      required
    />
  </div>
</template>
