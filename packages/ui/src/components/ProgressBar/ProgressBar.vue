<script setup>
import { computed, useId } from 'vue'

const props = defineProps({
  /** Visible label, also the accessible name. */
  label: { type: String, required: true },
  labelHidden: { type: Boolean, default: false },
  /** Current value. `null` (or `indeterminate`) shows activity without a known amount. */
  value: { type: [Number, null], default: null },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  indeterminate: { type: Boolean, default: false },
  /** Human-readable value, e.g. "3 of 8 files". Defaults to the percentage. */
  valueText: { type: String, default: undefined },
})

const labelId = useId()

const determinate = computed(() => !props.indeterminate && props.value !== null)
const clamped = computed(() => Math.min(props.max, Math.max(props.min, props.value ?? props.min)))
const percent = computed(() =>
  props.max === props.min ? 0 : ((clamped.value - props.min) / (props.max - props.min)) * 100,
)
const displayText = computed(() => props.valueText ?? `${Math.round(percent.value)}%`)
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <div class="flex items-baseline justify-between gap-2 text-footnote">
      <span :id="labelId" class="text-label" :class="{ 'visually-hidden': labelHidden }">
        {{ label }}
      </span>
      <span v-if="determinate" aria-hidden="true" class="text-secondary-label tabular-nums">
        {{ displayText }}
      </span>
    </div>
    <div
      role="progressbar"
      :aria-labelledby="labelId"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-valuenow="determinate ? clamped : undefined"
      :aria-valuetext="determinate ? displayText : undefined"
      class="relative h-1.5 overflow-hidden rounded-full bg-fill"
    >
      <div
        class="absolute inset-y-0 left-0 rounded-full bg-tint-fill"
        :class="
          determinate ? 'transition-[width] duration-300 ease-standard' : 'indeterminate w-1/3'
        "
        :style="determinate ? { width: `${percent}%` } : undefined"
      />
    </div>
  </div>
</template>

<style scoped>
.indeterminate {
  animation: indeterminate 1.4s var(--ease-standard) infinite;
}

@keyframes indeterminate {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(300%);
  }
}
</style>
