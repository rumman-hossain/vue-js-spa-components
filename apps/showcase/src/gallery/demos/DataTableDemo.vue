<script setup>
import { Badge, DataTable, SegmentedControl } from '@vue-js-spa-components/ui'
import { computed, ref } from 'vue'

const INVOICES = [
  {
    id: 'INV-1042',
    customer: 'Kobayashi Design',
    amount: 128000,
    status: 'Paid',
    due: '2026-09-30',
  },
  {
    id: 'INV-1043',
    customer: 'Northwind Foods',
    amount: 54500,
    status: 'Overdue',
    due: '2026-09-12',
  },
  { id: 'INV-1044', customer: 'Sakura Clinic', amount: 9800, status: 'Paid', due: '2026-10-02' },
  {
    id: 'INV-1045',
    customer: 'Blue Harbor Ltd',
    amount: 312000,
    status: 'Open',
    due: '2026-10-28',
  },
]

const COLUMNS = [
  { key: 'id', label: 'Invoice' },
  { key: 'customer', label: 'Customer', sortable: true },
  { key: 'amount', label: 'Amount', sortable: true, align: /** @type {const} */ ('end') },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'due', label: 'Due', sortable: true },
]

const STATUS_TONE = /** @type {const} */ ({ Paid: 'success', Overdue: 'danger', Open: 'accent' })
const toneOf = (/** @type {string} */ status) =>
  STATUS_TONE[/** @type {keyof typeof STATUS_TONE} */ (status)] ?? 'neutral'

const state = ref(/** @type {string | number | null} */ ('ready'))
const sort = ref(
  /** @type {{ key: string, order: 'asc' | 'desc' } | null} */ ({ key: 'amount', order: 'desc' }),
)
const rows = computed(() => (state.value === 'empty' ? [] : INVOICES))

const yen = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' })
</script>

<template>
  <div class="flex flex-col gap-4">
    <SegmentedControl
      v-model="state"
      label="Table state"
      label-visible
      size="sm"
      :options="[
        { value: 'ready', label: 'Data' },
        { value: 'loading', label: 'Loading' },
        { value: 'empty', label: 'Empty' },
        { value: 'error', label: 'Error' },
      ]"
    />
    <DataTable
      v-model:sort="sort"
      :columns="COLUMNS"
      :rows="rows"
      row-key="id"
      caption="Invoices"
      :loading="state === 'loading'"
      :skeleton-rows="3"
      :error="state === 'error' ? 'The billing service timed out.' : undefined"
      empty-title="No invoices"
      empty-description="Invoices appear after the first billing cycle."
      @retry="state = 'ready'"
    >
      <template #cell-amount="{ value }">{{ yen.format(value) }}</template>
      <template #cell-status="{ value }">
        <Badge :tone="toneOf(value)">{{ value }}</Badge>
      </template>
    </DataTable>
  </div>
</template>
