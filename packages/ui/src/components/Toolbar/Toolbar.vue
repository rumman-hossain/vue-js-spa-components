<script setup>
import { PanelLeft } from 'lucide-vue-next'
import { inject } from 'vue'
import IconButton from '../IconButton/IconButton.vue'
import { SPLIT_VIEW_KEY } from '../SplitView/splitView.js'

/**
 * Sticky top bar on a translucent material surface, padded below the device's safe area.
 * Inside a SplitView it adds the "show sidebar" button on narrow screens.
 */
defineProps({
  title: { type: String, default: undefined },
  headingLevel: {
    type: /** @type {import('vue').PropType<1 | 2 | 3 | 4 | 5 | 6>} */ (Number),
    default: 1,
  },
  /** Set to false to hide the automatic sidebar button inside a SplitView. */
  sidebarToggle: { type: Boolean, default: true },
})

const splitView = inject(SPLIT_VIEW_KEY, null)
</script>

<template>
  <header
    class="material sticky top-0 z-30 border-b border-separator pt-[env(safe-area-inset-top)]"
  >
    <div class="flex min-h-13 items-center gap-2 px-4">
      <IconButton
        v-if="splitView && sidebarToggle"
        :label="splitView.openLabel"
        aria-haspopup="dialog"
        class="-ml-2 lg:hidden"
        @click="splitView.openSidebar()"
      >
        <PanelLeft />
      </IconButton>
      <div v-if="$slots.leading" class="flex items-center gap-1">
        <slot name="leading" />
      </div>
      <component
        :is="`h${headingLevel}`"
        v-if="title || $slots.title"
        class="min-w-0 flex-1 truncate text-headline text-label"
      >
        <slot name="title">{{ title }}</slot>
      </component>
      <div v-else class="flex-1" />
      <div v-if="$slots.trailing" class="flex items-center gap-1">
        <slot name="trailing" />
      </div>
    </div>
    <div v-if="$slots.default" class="px-4 pb-2">
      <slot />
    </div>
  </header>
</template>
