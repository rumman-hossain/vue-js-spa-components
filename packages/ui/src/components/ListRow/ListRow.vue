<script setup>
import { ChevronRight } from 'lucide-vue-next'
import { computed, getCurrentInstance, useAttrs } from 'vue'

const props = defineProps({
  title: { type: String, default: undefined },
  subtitle: { type: String, default: undefined },
  /** Secondary value shown at the trailing edge, e.g. the current setting. */
  value: { type: String, default: undefined },
  href: { type: String, default: undefined },
  /** Router location. Uses a globally registered `RouterLink` when the app has one. */
  to: { type: [String, Object], default: undefined },
  disabled: { type: Boolean, default: false },
})

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const routerLink = getCurrentInstance()?.appContext.components.RouterLink

/** The interactive element, or `null` for a static row. */
const target = computed(() => {
  // A disabled link is not a link: render it as a non-interactive row that says it is disabled.
  if (props.disabled && (props.href !== undefined || props.to !== undefined)) {
    return { tag: 'div', bindings: { 'aria-disabled': 'true' } }
  }
  if (props.to !== undefined && routerLink) return { tag: routerLink, bindings: { to: props.to } }
  if (props.href !== undefined || typeof props.to === 'string') {
    return { tag: 'a', bindings: { href: props.href ?? props.to } }
  }
  if (attrs.onClick)
    return { tag: 'button', bindings: { type: 'button', disabled: props.disabled } }
  return null
})

// Listeners and ARIA attributes belong on the interactive element; layout classes on the <li>.
const rowAttrs = computed(() => (target.value ? { class: attrs.class, style: attrs.style } : attrs))
const targetAttrs = computed(() => {
  if (!target.value) return {}
  const { class: _class, style: _style, ...rest } = attrs
  return { ...rest, ...target.value.bindings }
})
</script>

<template>
  <li class="group/row" v-bind="rowAttrs">
    <component
      :is="target?.tag ?? 'div'"
      v-bind="targetAttrs"
      class="flex min-h-11 w-full items-center gap-3 bg-transparent pl-4 text-left text-body text-label"
      :class="
        target &&
        'focus-ring transition-colors duration-150 ease-standard hover:bg-tertiary-fill focus-visible:-outline-offset-3 active:bg-fill disabled:cursor-not-allowed disabled:opacity-40'
      "
    >
      <span v-if="$slots.leading" class="flex shrink-0">
        <slot name="leading" />
      </span>
      <!-- The separator starts after the leading icon, like an inset grouped list. -->
      <span
        class="flex min-h-11 min-w-0 flex-1 items-center gap-2 self-stretch border-t border-separator py-2.5 pr-4 group-first/row:border-t-0"
      >
        <span class="flex min-w-0 flex-1 flex-col">
          <slot>
            <span v-if="title" class="truncate">{{ title }}</span>
            <span v-if="subtitle" class="truncate text-subhead text-secondary-label">
              {{ subtitle }}
            </span>
          </slot>
        </span>
        <span v-if="value" class="shrink-0 text-secondary-label">{{ value }}</span>
        <slot name="trailing" />
        <ChevronRight
          v-if="target"
          aria-hidden="true"
          class="size-4 shrink-0 text-tertiary-label"
        />
      </span>
    </component>
  </li>
</template>
