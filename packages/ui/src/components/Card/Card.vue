<script setup>
import { computed, useId, useSlots } from 'vue'

const props = defineProps({
  title: { type: String, default: undefined },
  description: { type: String, default: undefined },
  headingLevel: {
    type: /** @type {import('vue').PropType<2 | 3 | 4 | 5 | 6>} */ (Number),
    default: 2,
  },
  /** Translucent surface for cards placed over imagery or color. */
  material: { type: Boolean, default: false },
})

const slots = useSlots()
const titleId = useId()
const hasTitle = computed(() => Boolean(props.title || slots.title))
</script>

<template>
  <section
    :aria-labelledby="hasTitle ? titleId : undefined"
    class="flex flex-col gap-4 rounded-card p-5 text-label"
    :class="material ? 'material' : 'bg-elevated shadow-card'"
  >
    <header
      v-if="hasTitle || description || $slots.description || $slots.actions"
      class="flex items-start gap-4"
    >
      <div class="flex min-w-0 flex-1 flex-col gap-1">
        <component :is="`h${headingLevel}`" v-if="hasTitle" :id="titleId" class="text-headline">
          <slot name="title">{{ title }}</slot>
        </component>
        <div v-if="description || $slots.description" class="text-subhead text-secondary-label">
          <slot name="description">{{ description }}</slot>
        </div>
      </div>
      <div v-if="$slots.actions" class="flex shrink-0 items-center gap-2">
        <slot name="actions" />
      </div>
    </header>
    <slot />
    <footer v-if="$slots.footer" class="flex items-center justify-end gap-2">
      <slot name="footer" />
    </footer>
  </section>
</template>
