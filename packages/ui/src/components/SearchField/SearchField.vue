<script setup>
import { CircleX, Search } from 'lucide-vue-next'
import { onBeforeUnmount, useTemplateRef, watch } from 'vue'
import TextField from '../TextField/TextField.vue'

const props = defineProps({
  /** Accessible name. Hidden visually unless `labelVisible` is set. */
  label: { type: String, default: 'Search' },
  labelVisible: { type: Boolean, default: false },
  placeholder: { type: String, default: 'Search' },
  disabled: { type: Boolean, default: false },
  /** Milliseconds to wait after the last keystroke before emitting `search`. */
  debounce: { type: Number, default: 300 },
  clearLabel: { type: String, default: 'Clear search' },
  /** Wraps the field in a `search` landmark. Use once per page for the main search. */
  landmark: { type: Boolean, default: false },
})

const emit = defineEmits({
  /** @param {string} _query */
  search: (_query) => true,
})

defineOptions({ inheritAttrs: false })

const model = defineModel({ type: String, default: '' })

const field = useTemplateRef('field')

/** @type {ReturnType<typeof setTimeout> | undefined} */
let timer

function cancel() {
  clearTimeout(timer)
  timer = undefined
}

function searchNow() {
  cancel()
  emit('search', model.value)
}

watch(model, () => {
  cancel()
  timer = setTimeout(searchNow, props.debounce)
})

function clear() {
  model.value = ''
  searchNow()
  field.value?.focus()
}

/** @param {KeyboardEvent} event */
function onKeydown(event) {
  if (event.isComposing) return
  if (event.key === 'Enter') {
    event.preventDefault()
    searchNow()
  } else if (event.key === 'Escape' && model.value !== '') {
    event.preventDefault()
    clear()
  }
}

onBeforeUnmount(cancel)
</script>

<template>
  <div :role="landmark ? 'search' : undefined">
    <TextField
      ref="field"
      v-model="model"
      v-bind="$attrs"
      type="search"
      :label="label"
      :label-hidden="!labelVisible"
      :placeholder="placeholder"
      :disabled="disabled"
      autocomplete="off"
      enterkeyhint="search"
      class="[&_input::-webkit-search-cancel-button]:appearance-none"
      @keydown="onKeydown"
    >
      <template #leading>
        <Search class="size-4.5" />
      </template>
      <template v-if="model" #trailing>
        <button
          type="button"
          :aria-label="clearLabel"
          :disabled="disabled"
          class="focus-ring -mr-1.5 grid size-8 place-items-center rounded-full text-tertiary-label hover:text-secondary-label"
          @click="clear"
        >
          <CircleX aria-hidden="true" class="size-4.5" />
        </button>
      </template>
    </TextField>
  </div>
</template>
