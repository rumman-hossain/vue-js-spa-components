<script setup>
import { computed, nextTick, onMounted, useTemplateRef, watch } from 'vue'
import FieldFrame from '../_shared/FieldFrame.vue'
import { useField } from '../_shared/useField.js'

const props = defineProps({
  label: { type: String, required: true },
  labelHidden: { type: Boolean, default: false },
  hint: { type: String, default: undefined },
  error: { type: String, default: undefined },
  placeholder: { type: String, default: undefined },
  required: { type: Boolean, default: false },
  requiredLabel: { type: String, default: 'Required' },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  rows: { type: Number, default: 3 },
  /** Grows with its content instead of scrolling. */
  autoGrow: { type: Boolean, default: false },
  /** Also shows a live character count. */
  maxlength: { type: Number, default: undefined },
  id: { type: String, default: undefined },
})

const emit = defineEmits({
  /** @param {FocusEvent} _event */
  blur: (_event) => true,
})

defineOptions({ inheritAttrs: false })

const model = defineModel({ type: String, default: '' })

const { id, hintId, errorId, describedBy, rootAttrs, controlAttrs } = useField(props)
const textarea = useTemplateRef('textarea')

const countId = computed(() => `${id.value}-count`)
const describedByWithCount = computed(
  () =>
    [describedBy.value, props.maxlength !== undefined && countId.value].filter(Boolean).join(' ') ||
    undefined,
)

function resize() {
  const element = textarea.value
  if (!props.autoGrow || !element) return
  element.style.height = 'auto'
  element.style.height = `${element.scrollHeight}px`
}

onMounted(resize)
watch([model, () => props.autoGrow], () => nextTick(resize))

defineExpose({ focus: () => textarea.value?.focus() })
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
    <textarea
      :id="id"
      ref="textarea"
      v-model="model"
      v-bind="controlAttrs"
      :rows="rows"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :readonly="readonly"
      :maxlength="maxlength"
      :aria-invalid="error ? true : undefined"
      :aria-describedby="describedByWithCount"
      class="focus-ring block w-full rounded-field border px-3 py-2.5 text-body placeholder:text-placeholder disabled:cursor-not-allowed"
      :class="[
        error ? 'border-danger' : 'border-control-border',
        disabled ? 'bg-secondary-background text-secondary-label' : 'bg-background text-label',
        autoGrow ? 'resize-none overflow-hidden' : 'resize-y',
      ]"
      @blur="emit('blur', $event)"
    />
    <!-- Polite so the count is read after the typed character, not on top of it. -->
    <p
      v-if="maxlength !== undefined"
      :id="countId"
      aria-live="polite"
      class="self-end text-footnote text-secondary-label tabular-nums"
    >
      {{ model.length }}/{{ maxlength }}
    </p>
  </FieldFrame>
</template>
