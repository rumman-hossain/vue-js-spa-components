<script setup>
import { Button } from '@vue-js-spa-components/ui'
import { Check, Copy } from 'lucide-vue-next'
import { onBeforeUnmount, ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  code: { type: String, required: true },
  /** Accessible name of the scrollable code region. */
  label: { type: String, required: true },
})

const { t } = useI18n()
const codeElement = useTemplateRef('codeElement')

/** @type {import('vue').Ref<'idle' | 'copied' | 'failed'>} */
const state = ref('idle')

/** @type {ReturnType<typeof setTimeout> | undefined} */
let timer

/** Selects the code so the user can copy it with the keyboard shortcut instead. */
function selectCode() {
  const element = codeElement.value
  const selection = window.getSelection()
  if (!element || !selection) return
  const range = document.createRange()
  range.selectNodeContents(element)
  selection.removeAllRanges()
  selection.addRange(range)
}

async function copy() {
  clearTimeout(timer)
  try {
    // Missing outside secure contexts (plain http) and in some embedded browsers.
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable')
    await navigator.clipboard.writeText(props.code)
    state.value = 'copied'
    timer = setTimeout(() => (state.value = 'idle'), 2500)
  } catch {
    state.value = 'failed'
    selectCode()
  }
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex items-center justify-end gap-3">
      <!-- Polite: the confirmation is read after the button press, not instead of it. -->
      <p
        role="status"
        class="text-footnote"
        :class="state === 'failed' ? 'text-danger' : 'text-secondary-label'"
      >
        {{
          state === 'copied'
            ? t('components.copied')
            : state === 'failed'
              ? t('components.copyFailed')
              : ''
        }}
      </p>
      <Button size="sm" variant="gray" @click="copy">
        <template #leading>
          <Check v-if="state === 'copied'" :size="14" />
          <Copy v-else :size="14" />
        </template>
        {{ t('components.copy') }}
      </Button>
    </div>
    <!-- Focusable so keyboard users can scroll long lines sideways. -->
    <!-- eslint-disable-next-line vuejs-accessibility/no-noninteractive-tabindex -->
    <pre
      role="region"
      tabindex="0"
      :aria-label="label"
      class="focus-ring max-h-[32rem] overflow-x-auto overflow-y-auto rounded-card bg-tertiary-fill p-4 font-mono text-footnote text-label"
    ><code ref="codeElement">{{ code }}</code></pre>
  </div>
</template>
