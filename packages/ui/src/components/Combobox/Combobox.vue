<script setup>
import { Check, ChevronsUpDown } from 'lucide-vue-next'
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
import FieldFrame from '../_shared/FieldFrame.vue'
import { fieldBoxClass, fieldControlClass } from '../_shared/fieldClasses.js'
import { useField } from '../_shared/useField.js'

/** @typedef {{ value: string | number, label: string, disabled?: boolean }} ComboboxOption */

/**
 * Editable combobox with a listbox popup and list autocomplete (WAI-ARIA APG): typing filters the
 * options, arrow keys move the active option (focus stays in the input), Enter selects.
 */
const props = defineProps({
  label: { type: String, required: true },
  labelHidden: { type: Boolean, default: false },
  options: {
    type: /** @type {import('vue').PropType<ComboboxOption[]>} */ (Array),
    required: true,
  },
  placeholder: { type: String, default: undefined },
  hint: { type: String, default: undefined },
  error: { type: String, default: undefined },
  required: { type: Boolean, default: false },
  requiredLabel: { type: String, default: 'Required' },
  disabled: { type: Boolean, default: false },
  id: { type: String, default: undefined },
  /** Shown and announced when the filter matches nothing. */
  noResultsLabel: { type: String, default: 'No results' },
  /** Accessible name of the button that shows all options. */
  toggleLabel: { type: String, default: 'Show options' },
})

const emit = defineEmits({
  /** @param {FocusEvent} _event */
  blur: (_event) => true,
})

defineOptions({ inheritAttrs: false })

/** Value of the selected option, or `null`. */
const model = defineModel({
  type: /** @type {import('vue').PropType<string | number | null>} */ ([String, Number]),
  default: null,
})

const { id, hintId, errorId, describedBy, rootAttrs, controlAttrs } = useField(props)
const input = useTemplateRef('input')

const listboxId = computed(() => `${id.value}-listbox`)
/** Ids come from the position in `options`, so they stay stable while the list is filtered. */
const optionId = (/** @type {ComboboxOption} */ option) =>
  `${id.value}-option-${props.options.indexOf(option)}`

/** What the input shows. */
const text = ref('')
/** What the list is filtered by: `text`, but only updated outside IME composition. */
const query = ref('')
const open = ref(false)
const activeIndex = ref(-1)
let composing = false

const selected = computed(() => props.options.find((option) => option.value === model.value))

const filtered = computed(() => {
  const needle = query.value.trim().toLocaleLowerCase()
  if (!needle) return props.options
  return props.options.filter((option) => option.label.toLocaleLowerCase().includes(needle))
})

const active = computed(() => (open.value ? filtered.value[activeIndex.value] : undefined))
const noResults = computed(() => open.value && filtered.value.length === 0)

/** Shows the selected label again and forgets the typed filter. */
function syncText() {
  text.value = selected.value?.label ?? ''
  query.value = ''
}
watch(() => selected.value?.label, syncText, { immediate: true })

watch(activeIndex, async () => {
  await nextTick()
  if (!active.value) return
  // Not implemented by jsdom, hence the optional call.
  document.getElementById(optionId(active.value))?.scrollIntoView?.({ block: 'nearest' })
})

function close() {
  open.value = false
  activeIndex.value = -1
}

function applyQuery() {
  query.value = text.value
  open.value = true
  activeIndex.value = -1
}

function onInput(/** @type {Event} */ event) {
  text.value = /** @type {HTMLInputElement} */ (event.target).value
  // Filtering mid-composition would reorder the list under a half-typed character.
  if (composing || /** @type {InputEvent} */ (event).isComposing) return
  applyQuery()
}

function onCompositionEnd(/** @type {CompositionEvent} */ event) {
  composing = false
  text.value = /** @type {HTMLInputElement} */ (event.target).value
  applyQuery()
}

/** Moves the active option by `direction`, wrapping and skipping disabled options. */
function move(/** @type {1 | -1} */ direction) {
  const list = filtered.value
  const count = list.length
  let index = activeIndex.value === -1 ? (direction === 1 ? -1 : count) : activeIndex.value
  for (let tries = 0; tries < count; tries++) {
    index = (((index + direction) % count) + count) % count
    if (!list[index].disabled) {
      activeIndex.value = index
      return
    }
  }
}

/** @param {ComboboxOption} option */
function choose(option) {
  if (option.disabled) return
  model.value = option.value
  syncText()
  text.value = option.label
  close()
}

function onKeydown(/** @type {KeyboardEvent} */ event) {
  if (composing || event.isComposing) return // Enter and arrows belong to the IME here
  switch (event.key) {
    case 'ArrowDown':
    case 'ArrowUp':
      event.preventDefault()
      open.value = true
      if (!event.altKey) move(event.key === 'ArrowDown' ? 1 : -1)
      return
    case 'Enter':
      if (active.value) {
        event.preventDefault() // do not submit the surrounding form
        choose(active.value)
      }
      return
    case 'Escape':
      if (open.value) close()
      else if (text.value) {
        // Closed list: Escape clears the field (and the selection it represented).
        text.value = ''
        query.value = ''
        model.value = null
      } else return
      event.preventDefault()
      event.stopPropagation() // an enclosing dialog stays open
      return
    case 'Tab':
      close()
  }
}

function onBlur(/** @type {FocusEvent} */ event) {
  close()
  syncText()
  emit('blur', event)
}

function toggle() {
  if (open.value) close()
  else {
    query.value = ''
    open.value = true
  }
  input.value?.focus()
}

defineExpose({ focus: () => input.value?.focus() })
</script>

<template>
  <FieldFrame
    v-bind="rootAttrs"
    :control-id="id"
    :hint-id="hintId"
    :error-id="errorId"
    :label="label"
    :label-hidden="labelHidden"
    :hint="hint"
    :error="error"
    :required="required"
    :required-label="requiredLabel"
  >
    <div class="relative">
      <div :class="fieldBoxClass({ invalid: !!error, disabled })">
        <input
          :id="id"
          ref="input"
          v-bind="controlAttrs"
          :value="text"
          type="text"
          role="combobox"
          autocomplete="off"
          aria-autocomplete="list"
          :aria-expanded="open"
          :aria-controls="listboxId"
          :aria-activedescendant="active ? optionId(active) : undefined"
          :placeholder="placeholder"
          :required="required"
          :disabled="disabled"
          :aria-invalid="error ? true : undefined"
          :aria-describedby="describedBy"
          :class="fieldControlClass"
          @input="onInput"
          @compositionstart="composing = true"
          @compositionend="onCompositionEnd"
          @keydown="onKeydown"
          @blur="onBlur"
        />
        <!-- Pointer helper only: keyboard users open the list with the arrow keys. -->
        <button
          type="button"
          tabindex="-1"
          :aria-label="toggleLabel"
          :aria-expanded="open"
          :aria-controls="listboxId"
          :disabled="disabled"
          class="-mr-1 flex size-8 shrink-0 items-center justify-center rounded-control text-secondary-label hover:bg-tertiary-fill"
          @mousedown.prevent
          @click="toggle"
        >
          <ChevronsUpDown aria-hidden="true" class="size-4" />
        </button>
      </div>
      <ul
        v-show="open && filtered.length > 0"
        :id="listboxId"
        role="listbox"
        :aria-label="label"
        class="absolute inset-x-0 top-full z-40 mt-1 max-h-64 overflow-y-auto rounded-card border border-separator bg-elevated p-1 shadow-card"
      >
        <!-- Options stay unfocusable: the input keeps focus and points at them (aria-activedescendant). -->
        <!-- eslint-disable vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/interactive-supports-focus -->
        <li
          v-for="(option, index) in filtered"
          :id="optionId(option)"
          :key="option.value"
          role="option"
          :aria-selected="index === activeIndex"
          :aria-disabled="option.disabled || undefined"
          class="flex min-h-11 cursor-default items-center gap-2 rounded-control px-3 text-body aria-disabled:opacity-40"
          :class="
            index === activeIndex
              ? 'bg-tint-fill text-on-tint'
              : 'text-label hover:bg-tertiary-fill'
          "
          @mousedown.prevent
          @click="choose(option)"
        >
          <span class="min-w-0 flex-1 truncate">{{ option.label }}</span>
          <Check v-if="option.value === model" aria-hidden="true" class="size-4 shrink-0" />
        </li>
        <!-- eslint-enable vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/interactive-supports-focus -->
      </ul>
      <!-- Always mounted so the message is announced when it appears. -->
      <div
        role="status"
        :class="
          noResults
            ? 'absolute inset-x-0 top-full z-40 mt-1 rounded-card border border-separator bg-elevated px-4 py-3 text-subhead text-secondary-label shadow-card'
            : 'visually-hidden'
        "
      >
        {{ noResults ? noResultsLabel : '' }}
      </div>
    </div>
  </FieldFrame>
</template>
