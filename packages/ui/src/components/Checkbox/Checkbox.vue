<script setup>
import { Check, Minus } from 'lucide-vue-next'
import { useId, useTemplateRef, watchEffect } from 'vue'
import { useField } from '../_shared/useField.js'

const props = defineProps({
  /** Visible label. The default slot can be used instead. */
  label: { type: String, default: undefined },
  description: { type: String, default: undefined },
  /** Shows a dash for "some selected". Cleared by the browser when the user toggles the box. */
  indeterminate: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  id: { type: String, default: undefined },
})

defineOptions({ inheritAttrs: false })

const model = defineModel({ type: Boolean, default: false })

const { id, rootAttrs, controlAttrs } = useField(props)
const labelId = useId()
const descriptionId = useId()
const input = useTemplateRef('input')

// `indeterminate` exists only as a DOM property, not as an attribute.
watchEffect(() => {
  if (input.value) input.value.indeterminate = props.indeterminate
})
</script>

<template>
  <label
    :for="id"
    class="flex min-h-11 items-start gap-3 py-2.5"
    v-bind="rootAttrs"
    :class="disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'"
  >
    <span class="relative mt-px grid size-[1.375rem] shrink-0 place-items-center">
      <input
        :id="id"
        ref="input"
        v-model="model"
        v-bind="controlAttrs"
        type="checkbox"
        :disabled="disabled"
        :required="required"
        :aria-labelledby="description ? labelId : undefined"
        :aria-describedby="description ? descriptionId : undefined"
        class="peer focus-ring absolute inset-0 m-0 appearance-none rounded-md border-2 border-control-border bg-background transition-colors duration-150 ease-standard checked:border-tint-fill checked:bg-tint-fill indeterminate:border-tint-fill indeterminate:bg-tint-fill disabled:cursor-not-allowed"
      />
      <Check
        aria-hidden="true"
        :stroke-width="3"
        class="pointer-events-none relative hidden size-3.5 text-on-tint peer-checked:block peer-indeterminate:hidden"
      />
      <Minus
        aria-hidden="true"
        :stroke-width="3"
        class="pointer-events-none relative hidden size-3.5 text-on-tint peer-indeterminate:block"
      />
    </span>
    <span class="flex flex-col">
      <!-- Named by the title alone so the description is read as a description, not as the name. -->
      <span :id="labelId" class="text-body text-label">
        <slot>{{ label }}</slot>
      </span>
      <span v-if="description" :id="descriptionId" class="text-footnote text-secondary-label">
        {{ description }}
      </span>
    </span>
  </label>
</template>
