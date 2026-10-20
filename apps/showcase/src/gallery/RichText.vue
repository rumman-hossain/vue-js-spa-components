<script setup>
import { computed } from 'vue'
import { splitInlineCode } from './text.js'

/** Plain text where `backticked` parts render as inline code. Never renders HTML. */
const props = defineProps({
  text: { type: String, required: true },
})

const parts = computed(() => splitInlineCode(props.text))
</script>

<template>
  <template v-for="(part, index) in parts" :key="index">
    <code
      v-if="part.code"
      class="rounded-control bg-tertiary-fill px-1 py-px font-mono text-[0.875em] text-label"
      >{{ part.text }}</code
    >
    <template v-else>{{ part.text }}</template>
  </template>
</template>
