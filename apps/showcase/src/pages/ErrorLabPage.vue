<script setup>
import {
  Button,
  Card,
  ErrorBoundary,
  GroupedList,
  ListRow,
  useAsync,
} from '@vue-js-spa-components/ui'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { usersApi } from '@/api/users.js'
import { reportError, useErrorMessage } from '@/app/errors.js'
import CrashingWidget from '@/components/CrashingWidget.vue'
import PageHeader from '@/components/PageHeader.vue'
import { env } from '@/config/env.js'
import { db, setRefreshSession } from '@/mocks/db.js'
import { lab } from '@/mocks/lab.js'

const { t } = useI18n()
const errorMessage = useErrorMessage()

const offline = ref(lab.offline)
const crash = ref(false)
const boundaryKey = ref(0)

/** @type {import('vue').Ref<{ ok: boolean, text: string, ms: number } | null>} */
const result = ref(null)

const probe = useAsync(async ({ signal }) => {
  const tokensBefore = db.tokenCounter
  const started = performance.now()
  try {
    await usersApi.list({ page: 1, pageSize: 1 }, { signal })
    const refreshed = db.tokenCounter - tokensBefore
    result.value = {
      ok: true,
      text: refreshed ? t('errorLab.tokenRefreshed', { count: refreshed }) : t('errorLab.success'),
      ms: Math.round(performance.now() - started),
    }
  } catch (error) {
    result.value = {
      ok: false,
      text: errorMessage(error),
      ms: Math.round(performance.now() - started),
    }
  }
})

const experiments = computed(() => [
  {
    id: 'server',
    title: t('errorLab.serverError'),
    description: t('errorLab.serverErrorDescription'),
    run: () => lab.failNext(500, 'server_error', 'Injected failure'),
  },
  {
    id: 'timeout',
    title: t('errorLab.timeout'),
    description: t('errorLab.timeoutDescription'),
    run: () => lab.delayNext(env.apiTimeoutMs + 1000),
  },
  {
    id: 'token',
    title: t('errorLab.expireToken'),
    description: t('errorLab.expireTokenDescription'),
    run: () => db.tokens.clear(),
  },
  {
    id: 'session',
    title: t('errorLab.endSession'),
    description: t('errorLab.endSessionDescription'),
    run: () => {
      db.tokens.clear()
      setRefreshSession(null)
    },
  },
])

/** @param {() => void} arm */
function trigger(arm) {
  arm()
  probe.execute()
}

function toggleOffline() {
  offline.value = !offline.value
  lab.setOffline(offline.value)
  if (offline.value) probe.execute()
}

function crashWidget() {
  crash.value = true
  boundaryKey.value += 1
}
</script>

<template>
  <div class="max-w-3xl">
    <PageHeader :title="t('errorLab.title')" :subtitle="t('errorLab.subtitle')" />

    <div class="grid gap-8">
      <GroupedList>
        <ListRow
          v-for="experiment in experiments"
          :key="experiment.id"
          :title="experiment.title"
          :subtitle="experiment.description"
        >
          <template #trailing>
            <Button
              size="sm"
              variant="tinted"
              :disabled="probe.isPending.value"
              @click="trigger(experiment.run)"
            >
              {{ t('errorLab.request') }}
            </Button>
          </template>
        </ListRow>
        <ListRow
          :title="offline ? t('errorLab.online') : t('errorLab.offline')"
          :subtitle="t('errorLab.offlineDescription')"
        >
          <template #trailing>
            <Button
              size="sm"
              :variant="offline ? 'filled' : 'tinted'"
              :tone="offline ? 'accent' : 'danger'"
              @click="toggleOffline"
            >
              {{ offline ? t('errorLab.online') : t('errorLab.offline') }}
            </Button>
          </template>
        </ListRow>
      </GroupedList>

      <Card :title="t('errorLab.result')">
        <p
          role="status"
          aria-live="polite"
          class="text-body"
          :class="result?.ok ? 'text-success' : 'text-danger'"
        >
          <template v-if="probe.isPending.value">{{ t('common.loading') }}…</template>
          <template v-else-if="result">{{ result.text }} · {{ result.ms }} ms</template>
        </p>
      </Card>

      <Card :title="t('errorLab.renderError')" :description="t('errorLab.renderErrorDescription')">
        <ErrorBoundary
          :key="boundaryKey"
          :fallback-title="t('boundary.title')"
          @error="(error) => reportError(error, { source: 'error-lab' })"
        >
          <CrashingWidget :crash="crash" />
          <template #fallback="{ reset }">
            <div class="grid gap-3">
              <p role="alert" class="text-subhead text-danger">
                {{ t('boundary.title') }} — {{ t('boundary.message') }}
              </p>
              <Button
                size="sm"
                variant="gray"
                @click="
                  () => {
                    crash = false
                    reset()
                  }
                "
              >
                {{ t('common.retry') }}
              </Button>
            </div>
          </template>
        </ErrorBoundary>
        <template #footer>
          <Button size="sm" tone="danger" variant="tinted" :disabled="crash" @click="crashWidget">
            {{ t('errorLab.renderError') }}
          </Button>
        </template>
      </Card>
    </div>
  </div>
</template>
