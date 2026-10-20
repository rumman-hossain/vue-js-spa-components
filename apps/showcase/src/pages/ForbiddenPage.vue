<script setup>
import { Button, EmptyState } from '@vue-js-spa-components/ui'
import { ShieldX } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="grid min-h-[60dvh] place-items-center">
    <EmptyState
      :title="t('forbidden.title')"
      :description="t('forbidden.description')"
      :heading-level="1"
    >
      <template #icon><ShieldX :size="40" aria-hidden="true" /></template>
      <template #actions>
        <Button @click="$router.push({ name: 'dashboard' })">{{ t('common.goHome') }}</Button>
      </template>
    </EmptyState>
  </div>
</template>
