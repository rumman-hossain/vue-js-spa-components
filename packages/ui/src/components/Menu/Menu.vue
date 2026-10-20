<script setup>
import { ChevronDown } from 'lucide-vue-next'
import { nextTick, ref, useId, useTemplateRef } from 'vue'
import { useClickOutside } from '../../composables/useClickOutside.js'
import { BUTTON_VARIANTS, buttonVariantClass } from '../_shared/buttonClasses.js'
import { TRIGGER_SIZE_CLASS, popoverPanelClass } from '../_shared/popoverClasses.js'

/**
 * @typedef {object} MenuItem
 * @property {string} id Emitted with `select`.
 * @property {string} label
 * @property {import('vue').Component} [icon] Decorative icon component, e.g. from lucide-vue-next.
 * @property {'default' | 'danger'} [tone]
 * @property {boolean} [disabled] Still focusable (so it can be discovered) but not selectable.
 */

/** Menu button following the WAI-ARIA APG pattern: a list of actions behind a trigger. */
defineProps({
  /** Trigger text and accessible name of the menu. */
  label: { type: String, required: true },
  /** Shows only the `icon` slot in the trigger; the label stays as its accessible name. */
  labelHidden: { type: Boolean, default: false },
  items: { type: /** @type {import('vue').PropType<MenuItem[]>} */ (Array), required: true },
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

const emit = defineEmits({
  /** @param {string} _id */
  select: (_id) => true,
})

const open = ref(false)
const root = useTemplateRef('root')
const trigger = useTemplateRef('trigger')
const menu = useTemplateRef('menu')
const triggerId = useId()
const menuId = useId()

function itemElements() {
  return /** @type {HTMLElement[]} */ ([
    ...(menu.value?.querySelectorAll('[role="menuitem"]') ?? []),
  ])
}

/** @param {number} index Wrapped around the list. */
function focusItem(index) {
  const elements = itemElements()
  if (elements.length === 0) return
  elements[(index + elements.length) % elements.length].focus()
}

/** @param {'first' | 'last'} position */
async function openMenu(position) {
  open.value = true
  await nextTick()
  focusItem(position === 'first' ? 0 : -1)
}

/** @param {{ returnFocus?: boolean }} [options] */
function close({ returnFocus = false } = {}) {
  open.value = false
  if (returnFocus) trigger.value?.focus()
}

function onTriggerClick() {
  if (open.value) close()
  else openMenu('first')
}

// Enter and Space reach the trigger as a native click; only the arrows need handling here.
function onTriggerKeydown(/** @type {KeyboardEvent} */ event) {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    openMenu(event.key === 'ArrowDown' ? 'first' : 'last')
  }
}

/** Moves focus to the next item whose label starts with `char`, after the current one. */
function typeahead(/** @type {string} */ char, /** @type {number} */ current) {
  const elements = itemElements()
  const needle = char.toLocaleLowerCase()
  for (let step = 1; step <= elements.length; step++) {
    const index = (current + step) % elements.length
    const text = elements[index].textContent?.trim().toLocaleLowerCase() ?? ''
    if (text.startsWith(needle)) return focusItem(index)
  }
}

function onMenuKeydown(/** @type {KeyboardEvent} */ event) {
  const current = itemElements().indexOf(/** @type {HTMLElement} */ (document.activeElement))
  const handled = () => {
    event.preventDefault()
    event.stopPropagation()
  }
  switch (event.key) {
    case 'ArrowDown':
      handled()
      return focusItem(current + 1)
    case 'ArrowUp':
      handled()
      return focusItem(current - 1)
    case 'Home':
      handled()
      return focusItem(0)
    case 'End':
      handled()
      return focusItem(-1)
    case 'Escape':
      handled()
      return close({ returnFocus: true })
    case 'Tab':
      // Let focus move on naturally; the menu just goes away.
      return close()
    default:
      if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        if (event.key !== ' ') typeahead(event.key, current)
      }
  }
}

/** @param {MenuItem} item */
function select(item) {
  if (item.disabled) return
  emit('select', item.id)
  close({ returnFocus: true })
}

useClickOutside([root], () => close(), open)
</script>

<template>
  <div ref="root" class="relative inline-block">
    <button
      :id="triggerId"
      ref="trigger"
      type="button"
      aria-haspopup="menu"
      :aria-expanded="open"
      :aria-controls="menuId"
      :class="[buttonVariantClass(variant, 'accent'), TRIGGER_SIZE_CLASS]"
      @click="onTriggerClick"
      @keydown="onTriggerKeydown"
    >
      <span v-if="$slots.icon" aria-hidden="true" class="inline-flex [&_svg]:size-5">
        <slot name="icon" />
      </span>
      <span :class="{ 'visually-hidden': labelHidden }">{{ label }}</span>
      <ChevronDown v-if="!labelHidden" aria-hidden="true" class="size-4" />
    </button>
    <!-- Arrow keys, Home/End, typeahead, Escape and Tab are handled for the focused item. -->
    <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
    <div
      v-show="open"
      :id="menuId"
      ref="menu"
      role="menu"
      tabindex="-1"
      :aria-labelledby="triggerId"
      :class="popoverPanelClass(align)"
      @keydown="onMenuKeydown"
    >
      <button
        v-for="item in items"
        :key="item.id"
        type="button"
        role="menuitem"
        tabindex="-1"
        :aria-disabled="item.disabled || undefined"
        class="flex min-h-11 w-full items-center gap-3 rounded-control px-3 text-left text-body outline-none hover:bg-tertiary-fill focus:bg-tint-fill focus:text-on-tint aria-disabled:cursor-not-allowed aria-disabled:opacity-40"
        :class="item.tone === 'danger' ? 'text-danger' : 'text-label'"
        @click="select(item)"
      >
        <span v-if="item.icon" aria-hidden="true" class="flex shrink-0 [&_svg]:size-5">
          <component :is="item.icon" />
        </span>
        <span class="truncate">{{ item.label }}</span>
      </button>
    </div>
  </div>
</template>
