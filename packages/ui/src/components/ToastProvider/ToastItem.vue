<script setup>
import { CircleAlert, CircleCheck, Info, X } from 'lucide-vue-next'
import { onBeforeUnmount, onMounted, useTemplateRef } from 'vue'
import IconButton from '../IconButton/IconButton.vue'

const props = defineProps({
  toast: {
    type: /** @type {import('vue').PropType<import('../../composables/useToast.js').Toast>} */ (
      Object
    ),
    required: true,
  },
  dismissLabel: { type: String, required: true },
})

const emit = defineEmits(['dismiss'])

const root = useTemplateRef('root')

/** @type {ReturnType<typeof setTimeout> | undefined} */
let timer
let remaining = props.toast.duration
let startedAt = 0
let hovered = false
let focused = false

const timed = Number.isFinite(props.toast.duration) && props.toast.duration > 0

function start() {
  if (!timed || timer !== undefined) return
  startedAt = Date.now()
  timer = setTimeout(() => emit('dismiss'), remaining)
}

function pause() {
  if (timer === undefined) return
  clearTimeout(timer)
  timer = undefined
  remaining -= Date.now() - startedAt
}

// The timer stops while the pointer or keyboard focus is on the toast (WCAG 2.2.1).
function update() {
  if (hovered || focused) pause()
  else start()
}

/** @param {boolean} value */
function setHovered(value) {
  hovered = value
  update()
}

function onFocusin() {
  focused = true
  update()
}

function onFocusout(/** @type {FocusEvent} */ event) {
  if (event.relatedTarget instanceof Node && root.value?.contains(event.relatedTarget)) return
  focused = false
  update()
}

onMounted(start)
onBeforeUnmount(() => clearTimeout(timer))

const ICONS = { neutral: Info, success: CircleCheck, danger: CircleAlert }
const ICON_CLASSES = { neutral: 'text-tint', success: 'text-success', danger: 'text-danger' }
const icon = ICONS[props.toast.tone]
const iconClass = ICON_CLASSES[props.toast.tone]
</script>

<template>
  <!-- Hover and focus only pause the auto-dismiss timer; they are not interactions. -->
  <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
  <div
    ref="root"
    class="material pointer-events-auto flex w-full animate-sheet-in items-start gap-3 rounded-card border border-separator p-3 pl-4 shadow-card"
    @mouseenter="setHovered(true)"
    @mouseleave="setHovered(false)"
    @focusin="onFocusin"
    @focusout="onFocusout"
  >
    <component :is="icon" aria-hidden="true" class="mt-0.5 size-5 shrink-0" :class="iconClass" />
    <div class="flex min-w-0 flex-1 flex-col gap-0.5 py-0.5">
      <p class="text-subhead font-semibold text-label">{{ toast.title }}</p>
      <p v-if="toast.description" class="text-footnote text-secondary-label">
        {{ toast.description }}
      </p>
    </div>
    <IconButton :label="dismissLabel" size="sm" variant="plain" @click="emit('dismiss')">
      <X />
    </IconButton>
  </div>
</template>
