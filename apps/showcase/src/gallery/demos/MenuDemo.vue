<script setup>
import { Menu } from '@vue-js-spa-components/ui'
import { Copy, Ellipsis, Pencil, Trash2 } from 'lucide-vue-next'
import { ref } from 'vue'

const ITEMS = [
  { id: 'rename', label: 'Rename', icon: Pencil },
  { id: 'duplicate', label: 'Duplicate', icon: Copy },
  { id: 'archive', label: 'Archive', disabled: true },
  { id: 'delete', label: 'Delete', icon: Trash2, tone: /** @type {const} */ ('danger') },
]

const last = ref('none')
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-wrap items-center gap-3">
      <Menu label="Actions" :items="ITEMS" @select="(id) => (last = id)" />
      <Menu
        label="More options"
        label-hidden
        variant="plain"
        :items="ITEMS"
        @select="(id) => (last = id)"
      >
        <template #icon><Ellipsis /></template>
      </Menu>
    </div>
    <p class="text-footnote text-secondary-label" aria-live="polite">Last selected: {{ last }}</p>
  </div>
</template>
