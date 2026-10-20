<script setup>
import { computed, useId, useTemplateRef } from 'vue'

/**
 * @typedef {object} TabItem
 * @property {string} id Used for the model value and the panel slot name; keep it id-safe.
 * @property {string} label
 * @property {boolean} [disabled]
 */

/**
 * WAI-ARIA APG tabs with automatic activation: arrow keys move focus and select at once.
 *
 * Panels are named slots, one per tab: `<template #panel-<id>>`. Every panel is rendered (inactive
 * ones are `hidden`) so each tab's `aria-controls` always points at an element.
 */
const props = defineProps({
  tabs: { type: /** @type {import('vue').PropType<TabItem[]>} */ (Array), required: true },
  /** Accessible name of the tab list. */
  label: { type: String, required: true },
})

/** Id of the selected tab. Falls back to the first enabled tab. */
const model = defineModel({ type: String, default: undefined })

const baseId = useId()
const tablist = useTemplateRef('tablist')

const activeId = computed(
  () =>
    props.tabs.find((tab) => tab.id === model.value && !tab.disabled)?.id ??
    props.tabs.find((tab) => !tab.disabled)?.id,
)

/** @param {string} id */
const tabId = (id) => `${baseId}-tab-${id}`
/** @param {string} id */
const panelId = (id) => `${baseId}-panel-${id}`

/** @param {number} index */
function activate(index) {
  model.value = props.tabs[index].id
  const element = /** @type {HTMLElement | undefined} */ (
    tablist.value?.querySelectorAll('[role="tab"]')[index]
  )
  element?.focus()
}

/** Next enabled tab from `from` in `direction`, wrapping around. */
function step(/** @type {number} */ from, /** @type {1 | -1} */ direction) {
  const count = props.tabs.length
  for (let offset = 1; offset <= count; offset++) {
    const index = (((from + direction * offset) % count) + count) % count
    if (!props.tabs[index].disabled) return index
  }
  return from
}

/**
 * @param {KeyboardEvent} event
 * @param {number} index
 */
function onKeydown(event, index) {
  const count = props.tabs.length
  /** @type {Record<string, () => number>} */
  const targets = {
    ArrowRight: () => step(index, 1),
    ArrowLeft: () => step(index, -1),
    Home: () => step(-1 + count, 1),
    End: () => step(0, -1),
  }
  const target = targets[event.key]
  if (!target) return
  event.preventDefault()
  activate(target())
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div
      ref="tablist"
      role="tablist"
      :aria-label="label"
      class="flex gap-1 overflow-x-auto border-b border-separator"
    >
      <button
        v-for="(tab, index) in tabs"
        :id="tabId(tab.id)"
        :key="tab.id"
        type="button"
        role="tab"
        :aria-selected="tab.id === activeId"
        :aria-controls="panelId(tab.id)"
        :tabindex="tab.id === activeId ? 0 : -1"
        :disabled="tab.disabled"
        class="focus-ring relative min-h-11 shrink-0 rounded-t-control px-3 text-subhead font-medium whitespace-nowrap text-secondary-label transition-colors duration-150 ease-standard after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full hover:text-label disabled:cursor-not-allowed disabled:opacity-40 aria-selected:text-tint aria-selected:after:bg-tint"
        @click="model = tab.id"
        @keydown="onKeydown($event, index)"
      >
        {{ tab.label }}
      </button>
    </div>
    <div
      v-for="tab in tabs"
      :id="panelId(tab.id)"
      :key="tab.id"
      role="tabpanel"
      :aria-labelledby="tabId(tab.id)"
      :hidden="tab.id !== activeId"
      tabindex="0"
      class="focus-ring rounded-control"
    >
      <slot :name="`panel-${tab.id}`" />
    </div>
  </div>
</template>
