<script setup>
import { ConfirmProvider, SkipLink, ToastProvider } from '@vue-js-spa-components/ui'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterView, useRoute } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'

const { t } = useI18n()
const route = useRoute()
const isBlank = computed(() => route.meta.layout === 'blank')
</script>

<template>
  <ToastProvider :dismiss-label="t('common.cancel')">
    <ConfirmProvider>
      <SkipLink :label="t('app.skipToContent')" />
      <RouterView v-if="isBlank" />
      <AppLayout v-else />
    </ConfirmProvider>
  </ToastProvider>
</template>
