<script setup>
import { IconButton, Sidebar, SkipLink, Toolbar } from '@vue-js-spa-components/ui'
import { Archive, Inbox, PenLine, Send } from 'lucide-vue-next'
import { computed, ref, useId } from 'vue'

const FOLDERS = [
  { id: 'inbox', label: 'Inbox', icon: Inbox, badge: 4, href: '#mail-inbox' },
  { id: 'sent', label: 'Sent', icon: Send, href: '#mail-sent' },
  { id: 'archive', label: 'Archive', icon: Archive, href: '#mail-archive' },
]
const SECTIONS = [{ id: 'folders', heading: 'Folders', items: FOLDERS }]

const contentId = useId()
const active = ref('inbox')
const title = computed(() => FOLDERS.find((folder) => folder.id === active.value)?.label)

/** In a real app these are router links; here a click just switches the folder. */
function onNavigate(/** @type {MouseEvent} */ event) {
  const link = event.target instanceof Element ? event.target.closest('a[href^="#mail-"]') : null
  if (!link) return
  event.preventDefault()
  active.value = link.getAttribute('href')?.slice('#mail-'.length) ?? active.value
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <SkipLink :target="contentId" label="Skip to the preview content" />
    <p class="text-footnote text-secondary-label">
      Press Tab from the top of this example to reveal the skip link.
    </p>
    <div class="flex overflow-hidden rounded-card border border-separator bg-background">
      <!-- Delegated click: links fire click for Enter too, so keyboard users are covered. -->
      <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/no-static-element-interactions -->
      <div
        class="w-52 shrink-0 border-r border-separator bg-secondary-background max-sm:hidden"
        @click="onNavigate"
      >
        <Sidebar label="Mail folders" :sections="SECTIONS" :active-id="active" :heading-level="3" />
      </div>
      <div class="flex min-w-0 flex-1 flex-col">
        <Toolbar :title="title" :heading-level="3" class="static!">
          <template #trailing>
            <IconButton label="New message"><PenLine /></IconButton>
          </template>
        </Toolbar>
        <div :id="contentId" tabindex="-1" class="p-4 text-subhead text-label outline-none">
          {{ active === 'inbox' ? '4 unread messages.' : `Nothing new in ${title}.` }}
        </div>
      </div>
    </div>
  </div>
</template>
