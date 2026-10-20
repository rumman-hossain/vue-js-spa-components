<script setup>
import { Button, EmptyState } from '@vue-js-spa-components/ui'
import { SearchX } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="grid min-h-[60dvh] place-items-center">
    <EmptyState
      :title="t('notFound.title')"
      :description="t('notFound.description')"
      :heading-level="1"
    >
      <template #icon><SearchX :size="40" aria-hidden="true" /></template>
      <template #actions>
        <Button @click="$router.push({ name: 'dashboard' })">{{ t('common.goHome') }}</Button>
      </template>
    </EmptyState>
  </div>
</template>
