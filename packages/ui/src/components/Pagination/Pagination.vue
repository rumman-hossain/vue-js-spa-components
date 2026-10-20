<script setup>
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { computed, useId } from 'vue'
import { getPageItems } from './pageItems.js'

/**
 * @typedef {object} PaginationRange
 * @property {string} from Formatted first item number on the page.
 * @property {string} to Formatted last item number on the page.
 * @property {string} total Formatted total.
 */

const props = defineProps({
  /** Total number of items (not pages). */
  total: { type: Number, required: true },
  /** Accessible name of the navigation landmark. */
  label: { type: String, default: 'Pagination' },
  /** BCP 47 locale for numbers; defaults to the user's locale. */
  locale: { type: String, default: undefined },
  /** Pages shown either side of the current page. */
  siblingCount: { type: Number, default: 1 },
  /** Offers a page-size select when given, e.g. `[10, 25, 50]`. */
  pageSizeOptions: {
    type: /** @type {import('vue').PropType<number[]>} */ (Array),
    default: undefined,
  },
  previousLabel: { type: String, default: 'Previous' },
  nextLabel: { type: String, default: 'Next' },
  pageSizeLabel: { type: String, default: 'Rows per page' },
  /** Accessible name of each page button. Receives the formatted page number. */
  pageLabel: {
    type: /** @type {import('vue').PropType<(page: string) => string>} */ (Function),
    default: (/** @type {string} */ page) => `Page ${page}`,
  },
  /** Summary line. Receives formatted numbers. */
  summary: {
    type: /** @type {import('vue').PropType<(range: PaginationRange) => string>} */ (Function),
    default: (/** @type {PaginationRange} */ range) =>
      `Showing ${range.from}–${range.to} of ${range.total}`,
  },
})

const page = defineModel('page', { type: Number, default: 1 })
const pageSize = defineModel('pageSize', { type: Number, default: 10 })

const selectId = useId()

const pageCount = computed(() => Math.max(1, Math.ceil(props.total / pageSize.value)))
/** The model clamped into range, so a shrinking total never shows a page that does not exist. */
const current = computed(() => Math.min(Math.max(1, Math.trunc(page.value)), pageCount.value))
const items = computed(() => getPageItems(current.value, pageCount.value, props.siblingCount))

const formatter = computed(() => new Intl.NumberFormat(props.locale))
/** @param {number} value */
const format = (value) => formatter.value.format(value)

const summaryText = computed(() => {
  const from = props.total === 0 ? 0 : (current.value - 1) * pageSize.value + 1
  const to = Math.min(current.value * pageSize.value, props.total)
  return props.summary({ from: format(from), to: format(to), total: format(props.total) })
})

/** @param {number} target */
function goTo(target) {
  page.value = Math.min(Math.max(1, target), pageCount.value)
}

function onPageSizeChange(/** @type {Event} */ event) {
  pageSize.value = Number(/** @type {HTMLSelectElement} */ (event.target).value)
  page.value = 1
}

const STEP_CLASS =
  'focus-ring inline-flex min-h-11 items-center gap-1 rounded-field px-3 text-subhead font-medium text-tint hover:bg-tint/10 disabled:cursor-not-allowed disabled:text-tertiary-label disabled:hover:bg-transparent'
</script>

<template>
  <nav :aria-label="label" class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
    <p aria-live="polite" class="text-footnote text-secondary-label tabular-nums">
      {{ summaryText }}
    </p>
    <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
      <div v-if="pageSizeOptions" class="flex items-center gap-2">
        <!-- Associated through `for`; the select is a sibling so the two can be laid out inline. -->
        <!-- eslint-disable-next-line vuejs-accessibility/label-has-for -->
        <label :for="selectId" class="text-footnote text-secondary-label">
          {{ pageSizeLabel }}
        </label>
        <select
          :id="selectId"
          :value="pageSize"
          class="focus-ring min-h-9 rounded-control border border-control-border bg-background px-2 text-subhead text-label"
          @change="onPageSizeChange"
        >
          <option v-for="size in pageSizeOptions" :key="size" :value="size">
            {{ format(size) }}
          </option>
        </select>
      </div>
      <ul class="flex items-center gap-0.5">
        <li>
          <button
            type="button"
            :class="STEP_CLASS"
            :disabled="current <= 1"
            @click="goTo(current - 1)"
          >
            <ChevronLeft aria-hidden="true" class="size-4" />
            <span class="max-sm:visually-hidden">{{ previousLabel }}</span>
          </button>
        </li>
        <li
          v-for="item in items"
          :key="item"
          :aria-hidden="typeof item === 'string' || undefined"
          class="flex"
        >
          <span
            v-if="typeof item === 'string'"
            class="inline-flex min-w-8 justify-center text-subhead text-secondary-label"
          >
            …
          </span>
          <button
            v-else
            type="button"
            :aria-label="pageLabel(format(item))"
            :aria-current="item === current ? 'page' : undefined"
            class="focus-ring inline-flex size-11 items-center justify-center rounded-field text-subhead font-medium tabular-nums"
            :class="
              item === current ? 'bg-tint-fill text-on-tint' : 'text-label hover:bg-tertiary-fill'
            "
            @click="goTo(item)"
          >
            {{ format(item) }}
          </button>
        </li>
        <li>
          <button
            type="button"
            :class="STEP_CLASS"
            :disabled="current >= pageCount"
            @click="goTo(current + 1)"
          >
            <span class="max-sm:visually-hidden">{{ nextLabel }}</span>
            <ChevronRight aria-hidden="true" class="size-4" />
          </button>
        </li>
      </ul>
    </div>
  </nav>
</template>
