<script setup>
import { X } from 'lucide-vue-next'
import { onBeforeUnmount, useId, useTemplateRef, watch } from 'vue'
import IconButton from '../IconButton/IconButton.vue'

/** @typedef {'sm' | 'md' | 'lg'} DialogSize */
/**
 * - `center`: a card in the middle of the screen.
 * - `sheet`: slides up from the bottom edge on small screens, centered on wide ones.
 * - `side`: a full-height panel at the leading edge (off-canvas navigation).
 * @typedef {'center' | 'sheet' | 'side'} DialogPlacement
 */

const props = defineProps({
  /** Rendered as the dialog heading and used as its accessible name. */
  title: { type: String, required: true },
  /** Keeps the title for assistive technology but hides it visually. */
  titleHidden: { type: Boolean, default: false },
  /** Short explanation under the title; becomes the accessible description. */
  description: { type: String, default: undefined },
  size: {
    type: /** @type {import('vue').PropType<DialogSize>} */ (String),
    default: 'md',
    validator: (/** @type {string} */ value) => ['sm', 'md', 'lg'].includes(value),
  },
  placement: {
    type: /** @type {import('vue').PropType<DialogPlacement>} */ (String),
    default: 'center',
    validator: (/** @type {string} */ value) => ['center', 'sheet', 'side'].includes(value),
  },
  /** Escape, the close button and a click on the backdrop close the dialog. */
  dismissible: { type: Boolean, default: true },
  /**
   * Turns the dialog into an alert dialog: `role="alertdialog"`, no close button and no backdrop
   * dismissal, so the user has to answer with one of the footer actions (or Escape to cancel).
   */
  alert: { type: Boolean, default: false },
  closeLabel: { type: String, default: 'Close' },
})

const emit = defineEmits(['close'])

const open = defineModel('open', { type: Boolean, default: false })

const dialog = useTemplateRef('dialog')
const titleId = useId()
const descriptionId = useId()

/** Element that had focus before opening; it gets focus back on close. */
let returnTo = /** @type {HTMLElement | null} */ (null)
let pressedOnBackdrop = false

function show() {
  const element = dialog.value
  if (!element || element.open) return
  returnTo = document.activeElement instanceof HTMLElement ? document.activeElement : null
  // The native modal dialog makes the rest of the page inert and traps focus: no extra trap here.
  element.showModal()
  // Like the platform: an explicitly marked control wins, otherwise the dialog itself takes focus
  // so screen readers start with its title and Tab reaches the first control.
  const preferred = element.querySelector('[autofocus], [data-autofocus]')
  ;(preferred instanceof HTMLElement ? preferred : element).focus()
}

function restoreFocus() {
  const target = returnTo
  returnTo = null
  if (target?.isConnected) target.focus()
}

watch(
  () => open.value && Boolean(dialog.value),
  (isOpen) => {
    if (isOpen) show()
    else if (dialog.value?.open) dialog.value.close()
  },
  { flush: 'post', immediate: true },
)

/** Fired by the native element for every close, whatever triggered it. */
function onClose() {
  open.value = false
  emit('close')
  restoreFocus()
}

/** Escape. Always handled here so the open state stays owned by `v-model:open`. */
function onCancel(/** @type {Event} */ event) {
  event.preventDefault()
  if (props.dismissible) open.value = false
}

// A click whose press started inside the panel (e.g. selecting text) must not close the dialog.
function onPointerdown(/** @type {PointerEvent} */ event) {
  pressedOnBackdrop = event.target === event.currentTarget
}

function onClick(/** @type {MouseEvent} */ event) {
  // The panel fills the <dialog> box, so a click on the element itself is a click on the backdrop.
  const onBackdrop = pressedOnBackdrop && event.target === event.currentTarget
  pressedOnBackdrop = false
  if (onBackdrop && props.dismissible && !props.alert) open.value = false
}

onBeforeUnmount(() => {
  if (dialog.value?.open) restoreFocus()
})

const SIZES = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-3xl' }
const SHEET_SIZES = { sm: 'sm:max-w-sm', md: 'sm:max-w-lg', lg: 'sm:max-w-3xl' }

const PLACEMENT_DIALOG = {
  center: 'm-auto w-[calc(100%-2rem)]',
  sheet: 'mx-auto mt-auto mb-0 w-full max-w-none sm:mb-auto sm:w-[calc(100%-2rem)]',
  side: 'my-0 mr-auto ml-0 h-dvh max-h-none w-80 max-w-[85vw]',
}
const PLACEMENT_PANEL = {
  center: 'max-h-[85dvh] rounded-window',
  sheet:
    'max-h-[90dvh] rounded-t-sheet pb-[env(safe-area-inset-bottom)] sm:max-h-[85dvh] sm:rounded-window sm:pb-0',
  side: 'h-full pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]',
}
</script>

<template>
  <!-- Backdrop clicks are a pointer convenience; Escape and the close button cover the keyboard. -->
  <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/no-static-element-interactions -->
  <dialog
    ref="dialog"
    :role="alert ? 'alertdialog' : undefined"
    :aria-labelledby="titleId"
    :aria-describedby="description ? descriptionId : undefined"
    tabindex="-1"
    class="overflow-visible border-0 bg-transparent p-0 text-label outline-none backdrop:bg-scrim backdrop:animate-fade-in"
    :class="[
      PLACEMENT_DIALOG[placement],
      placement === 'center' && SIZES[size],
      placement === 'sheet' && SHEET_SIZES[size],
    ]"
    @cancel="onCancel"
    @close="onClose"
    @pointerdown="onPointerdown"
    @click="onClick"
  >
    <div
      class="flex animate-sheet-in flex-col overflow-hidden bg-elevated shadow-card"
      :class="PLACEMENT_PANEL[placement]"
    >
      <header class="flex items-start gap-3 px-5 pt-5" :class="{ 'pb-1': !titleHidden }">
        <div class="flex min-w-0 flex-1 flex-col gap-1">
          <h2
            :id="titleId"
            class="text-headline text-label"
            :class="{ 'visually-hidden': titleHidden }"
          >
            {{ title }}
          </h2>
          <p v-if="description" :id="descriptionId" class="text-subhead text-secondary-label">
            {{ description }}
          </p>
        </div>
        <IconButton
          v-if="dismissible && !alert"
          :label="closeLabel"
          variant="gray"
          size="sm"
          class="-mt-1 -mr-1 ml-auto"
          @click="open = false"
        >
          <X />
        </IconButton>
      </header>
      <div
        v-if="$slots.default"
        class="min-h-0 flex-1 overflow-y-auto"
        :class="placement === 'side' ? 'px-2 pb-4' : 'px-5 py-3'"
      >
        <slot />
      </div>
      <footer
        v-if="$slots.footer"
        class="flex flex-wrap justify-end gap-2 px-5 pt-3 pb-5"
        :class="{ 'pt-5': !$slots.default }"
      >
        <slot name="footer" />
      </footer>
    </div>
  </dialog>
</template>
