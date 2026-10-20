<script setup>
import { Card, ErrorBoundary, Tabs } from '@vue-js-spa-components/ui'
import {
  computed,
  defineAsyncComponent,
  onBeforeUnmount,
  onMounted,
  ref,
  useId,
  useTemplateRef,
} from 'vue'
import { useI18n } from 'vue-i18n'
import { reportError } from '@/app/errors.js'
import ApiTables from './ApiTables.vue'
import CodeBlock from './CodeBlock.vue'
import DemoLoading from './DemoLoading.vue'
import RichText from './RichText.vue'

const props = defineProps({
  entry: {
    type: /** @type {import('vue').PropType<import('./model.js').GalleryEntry>} */ (Object),
    required: true,
  },
})

const { t } = useI18n()
const titleId = useId()
const stage = useTemplateRef('stage')

// The demo's code is a separate chunk, fetched once the section is about to scroll into view.
const Demo = defineAsyncComponent({
  loader: props.entry.demo,
  loadingComponent: DemoLoading,
  delay: 0,
})

/** Whether the demo should be mounted. Immediate where IntersectionObserver is missing. */
const near = ref(typeof IntersectionObserver === 'undefined')

/** @type {IntersectionObserver | undefined} */
let observer
onMounted(() => {
  if (near.value || !stage.value) return
  observer = new IntersectionObserver(
    (records) => {
      if (records.some((record) => record.isIntersecting)) {
        near.value = true
        observer?.disconnect()
      }
    },
    { rootMargin: '600px 0px' },
  )
  observer.observe(stage.value)
})
onBeforeUnmount(() => observer?.disconnect())

const tab = ref('usage')
const tabs = computed(() => [
  { id: 'usage', label: t('components.usage') },
  {
    id: 'api',
    label: props.entry.kind === 'composable' ? t('components.api') : t('components.props'),
  },
  { id: 'a11y', label: t('components.accessibility') },
])

/** @param {unknown} error */
function onDemoError(error) {
  reportError(error, { source: 'gallery-demo', demo: props.entry.id })
}
</script>

<template>
  <section :id="entry.id" :aria-labelledby="titleId" class="flex scroll-mt-20 flex-col gap-4">
    <header class="flex flex-col gap-1">
      <p class="text-footnote font-semibold text-secondary-label uppercase">
        {{ entry.category }}
      </p>
      <h2 :id="titleId" class="text-title-2 text-label">{{ entry.name }}</h2>
      <p class="max-w-prose text-subhead text-secondary-label">
        <RichText :text="entry.summary" />
      </p>
    </header>

    <div ref="stage">
      <Card>
        <ErrorBoundary
          :fallback-title="t('boundary.title')"
          :fallback-message="t('boundary.message')"
          :retry-label="t('common.retry')"
          :heading-level="3"
          @error="onDemoError"
        >
          <component :is="Demo" v-if="near" />
          <DemoLoading v-else />
        </ErrorBoundary>
      </Card>
    </div>

    <Tabs v-model="tab" :tabs="tabs" :label="t('components.docsLabel', { name: entry.name })">
      <template #panel-usage>
        <CodeBlock :code="entry.code" :label="t('components.codeLabel', { name: entry.name })" />
      </template>
      <template #panel-api>
        <ApiTables :entry="entry" />
      </template>
      <template #panel-a11y>
        <ul class="flex max-w-prose list-disc flex-col gap-2 pl-5 text-subhead text-label">
          <li v-for="note in entry.a11y" :key="note"><RichText :text="note" /></li>
        </ul>
      </template>
    </Tabs>
  </section>
</template>
