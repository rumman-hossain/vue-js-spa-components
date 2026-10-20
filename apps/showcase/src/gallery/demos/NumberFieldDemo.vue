<script setup>
import { NumberField } from '@vue-js-spa-components/ui'
import { computed, ref } from 'vue'

const budget = ref(/** @type {number | null} */ (1280000))
const rate = ref(/** @type {number | null} */ (1234.5))

const yen = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' })
const budgetText = computed(() => (budget.value === null ? 'empty' : yen.format(budget.value)))
</script>

<template>
  <div class="flex max-w-xl flex-col gap-5">
    <div class="grid gap-4 sm:grid-cols-2">
      <NumberField
        v-model="budget"
        label="Budget"
        locale="ja-JP"
        :min="0"
        :step="1000"
        :allow-negative="false"
        hint="Try typing １２３ with a Japanese IME: full-width digits become 123."
      >
        <template #leading>¥</template>
      </NumberField>
      <NumberField
        v-model="rate"
        label="Exchange rate"
        locale="de-DE"
        :max-fraction-digits="2"
        hint="German grouping: 1.234,5. Arrow Up and Down step by 1."
      />
    </div>
    <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-footnote">
      <dt class="text-secondary-label">budget</dt>
      <dd class="font-mono text-label">
        {{ budget === null ? 'null' : budget }} ({{ budgetText }})
      </dd>
      <dt class="text-secondary-label">rate</dt>
      <dd class="font-mono text-label">{{ rate === null ? 'null' : rate }}</dd>
    </dl>
  </div>
</template>
