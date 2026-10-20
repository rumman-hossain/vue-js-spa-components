<script setup>
import { Button, TextField, useFocusTrap } from '@vue-js-spa-components/ui'
import { ref, useTemplateRef } from 'vue'

const panel = useTemplateRef('panel')
const editing = ref(false)
const title = ref('Weekly sync')

useFocusTrap(panel, editing)
</script>

<template>
  <div class="flex max-w-md flex-col gap-3">
    <div class="flex items-center gap-3">
      <Button variant="tinted" :disabled="editing" @click="editing = true">Quick edit</Button>
      <span class="text-subhead text-label">{{ title }}</span>
    </div>
    <!-- Escape is a convenience; the Done button is the keyboard and pointer way out. -->
    <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
    <div
      v-if="editing"
      ref="panel"
      role="group"
      aria-label="Quick edit"
      class="flex flex-col gap-3 rounded-card border border-separator p-4"
      @keydown.esc="editing = false"
    >
      <TextField v-model="title" label="Meeting title" />
      <div class="flex gap-2">
        <Button size="sm" variant="gray" @click="editing = false">Done</Button>
        <Button size="sm" variant="plain" @click="title = 'Weekly sync'">Reset</Button>
      </div>
      <p class="text-footnote text-secondary-label">
        Tab and Shift+Tab stay inside this panel. Closing it returns focus to “Quick edit”.
      </p>
    </div>
  </div>
</template>
