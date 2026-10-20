<script setup>
import {
  Badge,
  Button,
  Card,
  ErrorState,
  GroupedList,
  ListRow,
  Skeleton,
  usePolling,
} from '@vue-js-spa-components/ui'
import { Pause, Play, RefreshCw } from 'lucide-vue-next'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { metricsApi } from '@/api/metrics.js'
import { useErrorMessage } from '@/app/errors.js'
import PageHeader from '@/components/PageHeader.vue'
import { useRelativeTime } from '@/composables/useRelativeTime.js'

const { t, locale } = useI18n()
const errorMessage = useErrorMessage()

const polling = usePolling(
  async ({ signal }) => {
    const [summary, activity] = await Promise.all([
      metricsApi.summary({ signal }),
      metricsApi.activity({ signal }),
    ])
    return { summary, activity }
  },
  { interval: 10_000 },
)

const updatedAgo = useRelativeTime(polling.lastUpdated)
const isFirstLoad = computed(() => !polling.data.value && !polling.error.value)
const isStale = computed(() => Boolean(polling.data.value && polling.error.value))

const number = computed(() => new Intl.NumberFormat(locale.value))
const percent = computed(
  () => new Intl.NumberFormat(locale.value, { style: 'percent', maximumFractionDigits: 2 }),
)
const time = computed(() => new Intl.DateTimeFormat(locale.value, { timeStyle: 'short' }))

/** @typedef {{ label: string, value: string, tone?: 'success' | 'warning' }} Kpi */

const kpis = computed(() => {
  const summary = polling.data.value?.summary
  if (!summary) return /** @type {Kpi[]} */ ([])
  return /** @type {Kpi[]} */ ([
    { label: t('dashboard.activeUsers'), value: number.value.format(summary.activeUsers) },
    { label: t('dashboard.requestsToday'), value: number.value.format(summary.requestsToday) },
    {
      label: t('dashboard.errorRate'),
      value: percent.value.format(summary.errorRate / 100),
      tone: summary.errorRate > 0.5 ? 'warning' : 'success',
    },
    { label: t('dashboard.p95Latency'), value: `${number.value.format(summary.p95LatencyMs)} ms` },
  ])
})
</script>

<template>
  <div>
    <PageHeader :title="t('dashboard.title')" :subtitle="t('dashboard.subtitle')">
      <template #actions>
        <Button variant="gray" @click="polling.isActive.value ? polling.pause() : polling.resume()">
          <template #leading>
            <component :is="polling.isActive.value ? Pause : Play" :size="16" aria-hidden="true" />
          </template>
          {{ polling.isActive.value ? t('dashboard.pause') : t('dashboard.resume') }}
        </Button>
        <Button variant="tinted" :loading="polling.isFetching.value" @click="polling.refresh()">
          <template #leading><RefreshCw :size="16" aria-hidden="true" /></template>
          {{ t('dashboard.refresh') }}
        </Button>
      </template>
    </PageHeader>

    <p class="mb-4 text-footnote text-secondary-label" aria-live="polite">
      <template v-if="polling.lastUpdated.value">{{
        t('dashboard.updatedAgo', { time: updatedAgo })
      }}</template>
      <template v-else>{{ t('dashboard.notYetUpdated') }}</template>
    </p>

    <p
      v-if="isStale"
      role="status"
      class="mb-4 rounded-card bg-highlight/20 px-4 py-3 text-subhead text-label"
    >
      {{ t('dashboard.stale') }}
    </p>

    <ErrorState
      v-if="!polling.data.value && polling.error.value"
      :title="t('dashboard.loadFailed')"
      :message="errorMessage(polling.error.value)"
      :retry-label="t('common.retry')"
      :retrying="polling.isFetching.value"
      alert
      @retry="polling.refresh()"
    />

    <template v-else>
      <section
        :aria-label="t('dashboard.title')"
        :aria-busy="isFirstLoad"
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <template v-if="isFirstLoad">
          <Card v-for="n in 4" :key="n"
            ><Skeleton class="h-4 w-24" /><Skeleton class="mt-3 h-8 w-32"
          /></Card>
        </template>
        <Card v-for="kpi in kpis" v-else :key="kpi.label">
          <p class="text-footnote text-secondary-label">{{ kpi.label }}</p>
          <p class="mt-1 flex items-baseline gap-2 text-title-1 text-label tabular-nums">
            {{ kpi.value }}
            <Badge v-if="kpi.tone" :tone="kpi.tone">
              {{ kpi.tone === 'success' ? t('dashboard.healthy') : t('dashboard.elevated') }}
            </Badge>
          </p>
        </Card>
      </section>

      <GroupedList class="mt-8" :header="t('dashboard.activity')">
        <template v-if="isFirstLoad">
          <ListRow v-for="n in 5" :key="n"><Skeleton class="h-4 w-2/3" /></ListRow>
        </template>
        <ListRow
          v-for="item in polling.data.value?.activity ?? []"
          v-else
          :key="item.id"
          :title="
            t(`dashboard.activityItem.${item.action}`, { actor: item.actor, target: item.target })
          "
          :value="time.format(new Date(item.at))"
        />
      </GroupedList>
    </template>
  </div>
</template>
