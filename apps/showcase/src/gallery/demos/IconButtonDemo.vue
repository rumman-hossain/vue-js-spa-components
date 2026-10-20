<script setup>
import { IconButton } from '@vue-js-spa-components/ui'
import { Heart, Pencil, Share2, Trash2 } from 'lucide-vue-next'
import { ref } from 'vue'

const favorite = ref(false)
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-wrap items-center gap-2">
      <!-- A toggle keeps one name; aria-pressed reports whether it is on. -->
      <IconButton
        label="Favorite"
        variant="tinted"
        :aria-pressed="favorite"
        @click="favorite = !favorite"
      >
        <Heart :fill="favorite ? 'currentColor' : 'none'" />
      </IconButton>
      <IconButton label="Share"><Share2 /></IconButton>
      <IconButton label="Edit" variant="gray" size="sm"><Pencil /></IconButton>
      <IconButton label="Delete" tone="danger" size="lg"><Trash2 /></IconButton>
    </div>
    <p class="text-footnote text-secondary-label">Favorite is {{ favorite ? 'on' : 'off' }}.</p>
  </div>
</template>
