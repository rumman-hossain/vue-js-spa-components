<script setup>
import { useId } from 'vue'

defineProps({
  /** Short caption above the group; names the list for assistive technology. */
  header: { type: String, default: undefined },
  /** Explanatory text below the group. */
  footer: { type: String, default: undefined },
  /** Match the page outline: a group directly under the page title is a level-2 heading. */
  headingLevel: {
    type: /** @type {import('vue').PropType<2 | 3 | 4 | 5 | 6>} */ (Number),
    default: 2,
  },
})

const headerId = useId()
const footerId = useId()
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <component
      :is="`h${headingLevel}`"
      v-if="header || $slots.header"
      :id="headerId"
      class="px-4 text-footnote font-normal text-secondary-label uppercase"
    >
      <slot name="header">{{ header }}</slot>
    </component>
    <!-- role="list" is needed: some browsers drop list semantics once list-style is removed. -->
    <!-- eslint-disable-next-line vuejs-accessibility/no-redundant-roles -->
    <ul
      role="list"
      :aria-labelledby="header || $slots.header ? headerId : undefined"
      :aria-describedby="footer || $slots.footer ? footerId : undefined"
      class="m-0 list-none overflow-hidden rounded-card bg-grouped-row p-0"
    >
      <slot />
    </ul>
    <div
      v-if="footer || $slots.footer"
      :id="footerId"
      class="px-4 text-footnote text-secondary-label"
    >
      <slot name="footer">{{ footer }}</slot>
    </div>
  </div>
</template>
