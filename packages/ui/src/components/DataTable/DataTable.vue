<script setup>
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-vue-next'
import { computed, useId } from 'vue'
import EmptyState from '../EmptyState/EmptyState.vue'
import ErrorState from '../ErrorState/ErrorState.vue'
import Skeleton from '../Skeleton/Skeleton.vue'

/**
 * @typedef {object} DataTableColumn
 * @property {string} key Property read from each row; also names the `#cell-<key>` slot.
 * @property {string} label
 * @property {boolean} [sortable]
 * @property {'start' | 'end'} [align] Use `end` for numbers so digits line up.
 * @property {string} [width] Any CSS width, e.g. `'8rem'`.
 */
/** @typedef {{ key: string, order: 'asc' | 'desc' }} DataTableSort */
/** @typedef {Record<string, any>} DataTableRow */

const props = defineProps({
  columns: {
    type: /** @type {import('vue').PropType<DataTableColumn[]>} */ (Array),
    required: true,
  },
  rows: { type: /** @type {import('vue').PropType<DataTableRow[]>} */ (Array), required: true },
  /**
   * Stable identity of a row: a property name or a function. Required because index keys break
   * focus and DOM reuse when rows are sorted, filtered or paged.
   */
  rowKey: {
    type: /** @type {import('vue').PropType<string | ((row: DataTableRow) => string | number)>} */ ([
      String,
      Function,
    ]),
    required: true,
  },
  /** Names the table (and its scroll region). */
  caption: { type: String, required: true },
  captionHidden: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  loadingLabel: { type: String, default: 'Loading' },
  skeletonRows: { type: Number, default: 5 },
  /** Error message. Replaces the rows with an error state and a retry button. */
  error: { type: String, default: undefined },
  errorTitle: { type: String, default: 'Could not load data' },
  emptyTitle: { type: String, default: 'No results' },
  emptyDescription: { type: String, default: undefined },
  /** Heading level of the empty and error states inside the table. */
  stateHeadingLevel: {
    type: /** @type {import('vue').PropType<2 | 3 | 4 | 5 | 6>} */ (Number),
    default: 3,
  },
  /**
   * Leaves `rows` in the given order and only reports sort changes, for server-side sorting.
   * Otherwise rows are sorted here (numbers numerically, text with locale-aware collation).
   */
  manualSort: { type: Boolean, default: false },
})

const emit = defineEmits(['retry'])

const sort = defineModel('sort', {
  type: /** @type {import('vue').PropType<DataTableSort | null>} */ (Object),
  default: null,
})

const captionId = useId()
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })

/** @param {DataTableRow} row */
function keyOf(row) {
  return typeof props.rowKey === 'function' ? props.rowKey(row) : row[props.rowKey]
}

const isEmpty = (/** @type {unknown} */ value) =>
  value === null || value === undefined || value === ''

/** @param {unknown} a @param {unknown} b */
function compareValues(a, b) {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return collator.compare(String(a), String(b))
}

const displayRows = computed(() => {
  const current = sort.value
  if (props.manualSort || !current) return props.rows
  const direction = current.order === 'desc' ? -1 : 1
  return [...props.rows].sort((rowA, rowB) => {
    const a = rowA[current.key]
    const b = rowB[current.key]
    // Empty values stay at the bottom in both directions.
    if (isEmpty(a) || isEmpty(b)) return Number(isEmpty(a)) - Number(isEmpty(b))
    return compareValues(a, b) * direction
  })
})

/** @param {string} key */
function ariaSort(key) {
  if (sort.value?.key !== key) return undefined
  return sort.value.order === 'asc' ? 'ascending' : 'descending'
}

/** First press sorts ascending; pressing the sorted column again flips the order. */
function toggleSort(/** @type {string} */ key) {
  const order = sort.value?.key === key && sort.value.order === 'asc' ? 'desc' : 'asc'
  sort.value = { key, order }
}

/** @param {DataTableColumn} column */
const alignClass = (column) => (column.align === 'end' ? 'text-right' : 'text-left')
</script>

<template>
  <div class="relative">
    <!-- Announces loading; aria-busy on the table tells assistive technology to wait. -->
    <p role="status" class="visually-hidden">{{ loading ? loadingLabel : '' }}</p>
    <!-- Focusable so keyboard users can scroll a table wider than the screen. -->
    <!-- eslint-disable-next-line vuejs-accessibility/no-noninteractive-tabindex -->
    <div
      role="region"
      tabindex="0"
      :aria-labelledby="captionId"
      class="focus-ring overflow-x-auto rounded-card bg-grouped-row"
    >
      <table
        class="w-full border-collapse text-subhead text-label"
        :aria-busy="loading || undefined"
      >
        <caption
          :id="captionId"
          class="px-4 pt-4 pb-2 text-left text-headline"
          :class="{ 'visually-hidden': captionHidden }"
        >
          {{
            caption
          }}
        </caption>
        <thead>
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              scope="col"
              :aria-sort="ariaSort(column.key)"
              :style="column.width ? { width: column.width } : undefined"
              class="border-b border-separator px-4 py-2.5 text-footnote font-semibold whitespace-nowrap text-secondary-label"
              :class="alignClass(column)"
            >
              <button
                v-if="column.sortable"
                type="button"
                class="focus-ring -mx-1 inline-flex min-h-8 items-center gap-1 rounded-control px-1 font-semibold hover:text-label"
                :class="{ 'flex-row-reverse': column.align === 'end' }"
                @click="toggleSort(column.key)"
              >
                {{ column.label }}
                <ArrowUp
                  v-if="ariaSort(column.key) === 'ascending'"
                  aria-hidden="true"
                  class="size-3.5 text-tint"
                />
                <ArrowDown
                  v-else-if="ariaSort(column.key) === 'descending'"
                  aria-hidden="true"
                  class="size-3.5 text-tint"
                />
                <ChevronsUpDown v-else aria-hidden="true" class="size-3.5 text-tertiary-label" />
              </button>
              <template v-else>{{ column.label }}</template>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-if="loading">
            <tr v-for="n in skeletonRows" :key="`skeleton-${n}`">
              <td v-for="column in columns" :key="column.key" class="px-4 py-3">
                <Skeleton />
              </td>
            </tr>
          </template>
          <tr v-else-if="error">
            <td :colspan="columns.length">
              <ErrorState
                :title="errorTitle"
                :message="error"
                :heading-level="stateHeadingLevel"
                alert
                @retry="emit('retry')"
              />
            </td>
          </tr>
          <tr v-else-if="rows.length === 0">
            <td :colspan="columns.length">
              <slot name="empty">
                <EmptyState
                  :title="emptyTitle"
                  :description="emptyDescription"
                  :heading-level="stateHeadingLevel"
                />
              </slot>
            </td>
          </tr>
          <template v-else>
            <tr
              v-for="row in displayRows"
              :key="keyOf(row)"
              class="border-t border-separator first:border-t-0 hover:bg-tertiary-fill"
            >
              <td
                v-for="column in columns"
                :key="column.key"
                class="px-4 py-3 align-middle"
                :class="[alignClass(column), { 'tabular-nums': column.align === 'end' }]"
              >
                <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
                  {{ row[column.key] }}
                </slot>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>
