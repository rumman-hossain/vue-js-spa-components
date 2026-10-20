<script setup>
/**
 * Layout shared by every labelled text-like control: label, the control row (default slot),
 * hint and error. The control itself is rendered by the parent so it keeps its native element.
 */
defineProps({
  /** Id of the control the label points at. */
  controlId: { type: String, required: true },
  hintId: { type: String, required: true },
  errorId: { type: String, required: true },
  label: { type: String, required: true },
  labelHidden: { type: Boolean, default: false },
  hint: { type: String, default: undefined },
  error: { type: String, default: undefined },
  required: { type: Boolean, default: false },
  requiredLabel: { type: String, default: 'Required' },
})
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <!-- Associated through `for`: the control lives in the parent's slot, so it cannot be nested. -->
    <!-- eslint-disable-next-line vuejs-accessibility/label-has-for -->
    <label
      :for="controlId"
      class="flex items-baseline justify-between gap-2 text-subhead font-medium text-label"
      :class="{ 'visually-hidden': labelHidden }"
    >
      {{ label }}
      <!-- The native `required` attribute already announces this; the text is for sighted users. -->
      <span
        v-if="required"
        aria-hidden="true"
        class="text-footnote font-normal text-secondary-label"
      >
        {{ requiredLabel }}
      </span>
    </label>
    <slot />
    <p v-if="error" :id="errorId" class="text-footnote text-danger">{{ error }}</p>
    <p v-if="hint" :id="hintId" class="text-footnote text-secondary-label">{{ hint }}</p>
  </div>
</template>
