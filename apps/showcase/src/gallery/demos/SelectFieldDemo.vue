<script setup>
import { SelectField } from '@vue-js-spa-components/ui'
import { ref } from 'vue'

const PLANS = [
  { value: 'starter', label: 'Starter (free)' },
  { value: 'team', label: 'Team (¥1,200 per seat)' },
  { value: 'enterprise', label: 'Enterprise (contact sales)', disabled: true },
]

const plan = ref(/** @type {string | number | null} */ (null))
</script>

<template>
  <div class="flex max-w-md flex-col gap-4">
    <SelectField
      v-model="plan"
      label="Plan"
      placeholder="Choose a plan"
      :options="PLANS"
      hint="Enterprise needs a call with our sales team."
      required
    />
    <p class="text-footnote text-secondary-label">
      v-model: <span class="font-mono">{{ JSON.stringify(plan) }}</span>
    </p>
  </div>
</template>
