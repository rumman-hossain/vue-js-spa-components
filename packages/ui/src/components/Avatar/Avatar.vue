<script setup>
import { computed, ref, watch } from 'vue'
import { AVATAR_TINTS, getInitials, hashToIndex } from './avatar.js'

const props = defineProps({
  /** Full name: the accessible name, the initials and the color all come from it. */
  name: { type: String, required: true },
  src: { type: String, default: undefined },
  size: {
    type: /** @type {import('vue').PropType<'sm' | 'md' | 'lg' | 'xl'>} */ (String),
    default: 'md',
    validator: (/** @type {string} */ value) => ['sm', 'md', 'lg', 'xl'].includes(value),
  },
})

const SIZES = {
  sm: 'size-8 text-caption',
  md: 'size-10 text-subhead',
  lg: 'size-14 text-title-3',
  xl: 'size-20 text-title-1',
}

const failed = ref(false)
watch(
  () => props.src,
  () => (failed.value = false),
)

const initials = computed(() => getInitials(props.name))
const tint = computed(() => AVATAR_TINTS[hashToIndex(props.name, AVATAR_TINTS.length)])
</script>

<template>
  <img
    v-if="src && !failed"
    :src="src"
    :alt="name"
    class="shrink-0 rounded-full object-cover"
    :class="SIZES[size]"
    @error="failed = true"
  />
  <span
    v-else
    role="img"
    :aria-label="name"
    class="inline-grid shrink-0 place-items-center rounded-full font-semibold select-none"
    :class="[SIZES[size], tint]"
  >
    <span aria-hidden="true">{{ initials }}</span>
  </span>
</template>
