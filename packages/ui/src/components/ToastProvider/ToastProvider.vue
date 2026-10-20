<script setup>
import { computed, provide, ref } from 'vue'
import { TOAST_DURATION, TOAST_KEY } from '../../composables/useToast.js'
import ToastItem from './ToastItem.vue'

/**
 * Provides `useToast()` to its default slot and renders the notification region.
 *
 * Two live regions stay mounted (so additions are announced): a polite one for neutral and
 * success messages and an assertive `role="alert"` one for errors.
 */
const props = defineProps({
  /** Most toasts on screen at once; the oldest is removed first. */
  max: { type: Number, default: 3 },
  dismissLabel: { type: String, default: 'Dismiss notification' },
})

const toasts = ref(/** @type {import('../../composables/useToast.js').Toast[]} */ ([]))
let counter = 0

/** @type {import('../../composables/useToast.js').ToastApi['show']} */
function show({ title, description, tone = 'neutral', duration }) {
  const id = `toast-${++counter}`
  toasts.value.push({ id, title, description, tone, duration: duration ?? TOAST_DURATION[tone] })
  if (toasts.value.length > props.max) toasts.value.splice(0, toasts.value.length - props.max)
  return id
}

/** @param {string} id */
function dismiss(id) {
  toasts.value = toasts.value.filter((toast) => toast.id !== id)
}

provide(TOAST_KEY, { show, dismiss })

const polite = computed(() => toasts.value.filter((toast) => toast.tone !== 'danger'))
const assertive = computed(() => toasts.value.filter((toast) => toast.tone === 'danger'))

const REGION_CLASS = 'flex w-full max-w-sm flex-col gap-2'
</script>

<template>
  <slot />
  <div
    class="pointer-events-none fixed inset-x-0 top-0 z-50 flex flex-col items-center gap-2 px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)]"
  >
    <!-- aria-atomic="false": announce each new toast, not the whole stack again. -->
    <div role="status" aria-atomic="false" :class="REGION_CLASS">
      <ToastItem
        v-for="toast in polite"
        :key="toast.id"
        :toast="toast"
        :dismiss-label="dismissLabel"
        @dismiss="dismiss(toast.id)"
      />
    </div>
    <div role="alert" aria-atomic="false" :class="REGION_CLASS">
      <ToastItem
        v-for="toast in assertive"
        :key="toast.id"
        :toast="toast"
        :dismiss-label="dismissLabel"
        @dismiss="dismiss(toast.id)"
      />
    </div>
  </div>
</template>
