<script setup>
import { useId } from 'vue'

defineProps({
  /** Visible label. The default slot can be used instead for richer content. */
  label: { type: String, default: undefined },
  description: { type: String, default: undefined },
  disabled: { type: Boolean, default: false },
})

const model = defineModel({ type: Boolean, default: false })

const labelId = useId()
const descriptionId = useId()
</script>

<template>
  <!-- The whole row is the switch, so the label is a large touch target. -->
  <button
    type="button"
    role="switch"
    :aria-checked="model"
    :aria-labelledby="labelId"
    :aria-describedby="description ? descriptionId : undefined"
    :disabled="disabled"
    class="group focus-ring flex min-h-11 w-full items-center justify-between gap-4 rounded-control py-1.5 text-left disabled:cursor-not-allowed disabled:opacity-40"
    @click="model = !model"
  >
    <span class="flex flex-col">
      <span :id="labelId" class="text-body text-label">
        <slot>{{ label }}</slot>
      </span>
      <span v-if="description" :id="descriptionId" class="text-footnote text-secondary-label">
        {{ description }}
      </span>
    </span>
    <span
      aria-hidden="true"
      class="relative h-[1.9375rem] w-[3.1875rem] shrink-0 rounded-full bg-fill transition-colors duration-200 ease-standard group-aria-checked:bg-success"
    >
      <span
        class="absolute top-0.5 left-0.5 size-[1.6875rem] rounded-full bg-on-tint shadow-card transition-transform duration-200 ease-standard group-aria-checked:translate-x-5"
      />
    </span>
  </button>
</template>
