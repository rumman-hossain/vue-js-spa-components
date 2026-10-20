<script setup>
import { ChevronDown } from 'lucide-vue-next'
import { useId, useTemplateRef } from 'vue'
import { useClickOutside } from '../../composables/useClickOutside.js'
import { BUTTON_VARIANTS, buttonVariantClass } from '../_shared/buttonClasses.js'
import { TRIGGER_SIZE_CLASS, popoverPanelClass } from '../_shared/popoverClasses.js'

/**
 * Non-modal disclosure: a button that shows and hides a panel of related content
 * (filters, details, a small form). For a list of actions use Menu instead.
 */
defineProps({
  /** Trigger text and accessible name. */
  label: { type: String, required: true },
  /** Shows only the `icon` slot in the trigger; the label stays as its accessible name. */
  labelHidden: { type: Boolean, default: false },
  align: {
    type: /** @type {import('vue').PropType<import('../_shared/popoverClasses.js').PopoverAlign>} */ (
      String
    ),
    default: 'start',
  },
  variant: {
    type: /** @type {import('vue').PropType<import('../_shared/buttonClasses.js').ButtonVariant>} */ (
      String
    ),
    default: 'gray',
    validator: (/** @type {any} */ value) => BUTTON_VARIANTS.includes(value),
  },
})

const open = defineModel('open', { type: Boolean, default: false })

const root = useTemplateRef('root')
const trigger = useTemplateRef('trigger')
const panelId = useId()

/** @param {{ returnFocus?: boolean }} [options] */
function close({ returnFocus = false } = {}) {
  open.value = false
  if (returnFocus) trigger.value?.focus()
}

function onEscape(/** @type {KeyboardEvent} */ event) {
  if (!open.value) return
  // Handled here: an enclosing dialog must not close as well.
  event.preventDefault()
  event.stopPropagation()
  close({ returnFocus: true })
}

useClickOutside([root], () => close(), open)

defineExpose({ close })
</script>

<template>
  <!-- Escape is caught while bubbling from the trigger or from inside the panel. -->
  <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
  <div ref="root" class="relative inline-block" @keydown.esc="onEscape">
    <button
      ref="trigger"
      type="button"
      :aria-expanded="open"
      :aria-controls="panelId"
      :class="[buttonVariantClass(variant, 'accent'), TRIGGER_SIZE_CLASS]"
      @click="open = !open"
    >
      <span v-if="$slots.icon" aria-hidden="true" class="inline-flex [&_svg]:size-5">
        <slot name="icon" />
      </span>
      <span :class="{ 'visually-hidden': labelHidden }">{{ label }}</span>
      <ChevronDown v-if="!labelHidden" aria-hidden="true" class="size-4" />
    </button>
    <div v-show="open" :id="panelId" :class="popoverPanelClass(align)">
      <slot :close="close" />
    </div>
  </div>
</template>
