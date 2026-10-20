<script setup>
/**
 * "Skip to main content": the first focusable element on the page, hidden until focused.
 * Moves focus to the target as well as scrolling to it, which not every browser does on its own.
 */
const props = defineProps({
  /** Id of the element to skip to, usually `<main>`. */
  target: { type: String, default: 'main' },
  label: { type: String, default: 'Skip to main content' },
})

function onClick() {
  const element = document.getElementById(props.target)
  if (!element) return
  if (!element.hasAttribute('tabindex')) element.setAttribute('tabindex', '-1')
  element.focus()
}
</script>

<template>
  <a
    :href="`#${target}`"
    class="focus-ring fixed top-[calc(env(safe-area-inset-top)+0.5rem)] left-2 z-[100] -translate-y-[calc(100%+4rem)] rounded-field bg-elevated px-4 py-2.5 text-body font-semibold text-tint shadow-card transition-transform duration-150 ease-standard focus:translate-y-0"
    @click="onClick"
  >
    {{ label }}
  </a>
</template>
