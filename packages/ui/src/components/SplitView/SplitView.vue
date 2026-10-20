<script setup>
import { onBeforeUnmount, onMounted, provide } from 'vue'
import Dialog from '../Dialog/Dialog.vue'
import { SPLIT_VIEW_KEY, WIDE_QUERY } from './splitView.js'

/**
 * App layout with a sidebar and a content column.
 *
 * - Wide screens (≥ 64rem): the sidebar is a fixed-width column next to the content.
 * - Narrow screens: the sidebar is hidden and opens as an off-canvas modal Dialog from a button
 *   that a Toolbar in the `toolbar` slot renders automatically (or call `openSidebar` from the
 *   slot props). Following a link inside it closes it again.
 *
 * Slots: `sidebar`, `toolbar` and default (rendered inside `<main>`), each with `{ openSidebar }`.
 */
const props = defineProps({
  /** Title of the off-canvas panel (visually hidden) and of the sidebar column. */
  sidebarLabel: { type: String, default: 'Sidebar' },
  openLabel: { type: String, default: 'Show sidebar' },
  closeLabel: { type: String, default: 'Close sidebar' },
  /** Id of the `<main>` element, the target of a SkipLink. */
  mainId: { type: String, default: 'main' },
})

/** Whether the off-canvas sidebar is open (narrow screens only). */
const sidebarOpen = defineModel('sidebarOpen', { type: Boolean, default: false })

function openSidebar() {
  sidebarOpen.value = true
}

provide(SPLIT_VIEW_KEY, {
  openSidebar,
  get openLabel() {
    return props.openLabel
  },
})

// Growing past the breakpoint shows the permanent column, so the modal copy must go away.
/** @type {MediaQueryList | undefined} */
let wide
/** @param {{ matches: boolean }} event */
const onWideChange = (event) => event.matches && (sidebarOpen.value = false)

onMounted(() => {
  if (typeof window.matchMedia !== 'function') return
  wide = window.matchMedia(WIDE_QUERY)
  wide.addEventListener('change', onWideChange)
})
onBeforeUnmount(() => wide?.removeEventListener('change', onWideChange))

/** Closes the off-canvas panel once a link in it is followed. */
function onDrawerClick(/** @type {MouseEvent} */ event) {
  if (event.target instanceof Element && event.target.closest('a[href]')) sidebarOpen.value = false
}
</script>

<template>
  <div class="flex min-h-dvh bg-background text-label">
    <div
      class="hidden w-72 shrink-0 border-r border-separator bg-secondary-background lg:block"
      data-sidebar-column
    >
      <div class="sticky top-0 max-h-dvh overflow-y-auto pt-[env(safe-area-inset-top)]">
        <slot name="sidebar" :open-sidebar="openSidebar" />
      </div>
    </div>
    <Dialog
      v-model:open="sidebarOpen"
      :title="sidebarLabel"
      :close-label="closeLabel"
      placement="side"
      title-hidden
    >
      <!-- Mounted only while open, so the sidebar's landmarks never exist twice for long. -->
      <!-- Delegated click: links fire click for Enter too, so keyboard users are covered. -->
      <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/no-static-element-interactions -->
      <div v-if="sidebarOpen" @click="onDrawerClick">
        <slot name="sidebar" :open-sidebar="openSidebar" />
      </div>
    </Dialog>
    <div class="flex min-w-0 flex-1 flex-col">
      <slot name="toolbar" :open-sidebar="openSidebar" />
      <main :id="mainId" tabindex="-1" class="min-w-0 flex-1 outline-none">
        <slot :open-sidebar="openSidebar" />
      </main>
    </div>
  </div>
</template>
