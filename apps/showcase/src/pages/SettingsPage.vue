<script setup>
import { GroupedList, ListRow, SegmentedControl, Toggle, useTheme } from '@vue-js-spa-components/ui'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/PageHeader.vue'

const { t, locale } = useI18n()
const theme = useTheme()

const themeOptions = computed(() =>
  theme.modes.map((mode) => ({ value: mode, label: t(`settings.themes.${mode}`) })),
)
const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'ja', label: '日本語' },
]

const themeMode = computed({
  get: () => theme.mode.value,
  set: (value) => theme.setMode(value),
})

// Local-only demo preferences.
const weeklyReport = ref(true)
const securityAlerts = ref(true)
</script>

<template>
  <div class="max-w-2xl">
    <PageHeader :title="t('settings.title')" />

    <div class="grid gap-8">
      <GroupedList :header="t('settings.appearance')" :footer="t('settings.themeFooter')">
        <ListRow :title="t('settings.theme')">
          <template #trailing>
            <SegmentedControl
              v-model="themeMode"
              :label="t('settings.theme')"
              :options="themeOptions"
              size="sm"
            />
          </template>
        </ListRow>
      </GroupedList>

      <GroupedList :header="t('settings.language')">
        <ListRow :title="t('settings.languageLabel')">
          <template #trailing>
            <SegmentedControl
              v-model="locale"
              :label="t('settings.languageLabel')"
              :options="languageOptions"
              size="sm"
            />
          </template>
        </ListRow>
      </GroupedList>

      <GroupedList :header="t('settings.notifications')">
        <ListRow>
          <Toggle
            v-model="weeklyReport"
            :label="t('settings.weeklyReport')"
            :description="t('settings.weeklyReportDescription')"
          />
        </ListRow>
        <ListRow>
          <Toggle
            v-model="securityAlerts"
            :label="t('settings.securityAlerts')"
            :description="t('settings.securityAlertsDescription')"
          />
        </ListRow>
      </GroupedList>

      <GroupedList :header="t('settings.about')">
        <ListRow :title="t('settings.version')" value="0.1.0" />
        <ListRow
          :title="t('settings.source')"
          href="https://github.com/rumman-hossain/vue-js-spa-components"
        />
      </GroupedList>
    </div>
  </div>
</template>
