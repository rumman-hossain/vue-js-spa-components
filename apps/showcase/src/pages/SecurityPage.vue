<script setup>
import { Card, TextArea } from '@vue-js-spa-components/ui'
import DOMPurify from 'dompurify'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/PageHeader.vue'

const { t } = useI18n()

const untrusted = ref(
  '<b>Quarterly report</b> <img src=x onerror="alert(\'stolen \' + document.cookie)"> <a href="javascript:alert(1)">details</a>',
)

// Only formatting tags survive; event handlers, scripts and javascript: URLs are removed.
const sanitized = computed(() =>
  DOMPurify.sanitize(untrusted.value, {
    ALLOWED_TAGS: ['b', 'strong', 'i', 'em', 'a', 'p', 'ul', 'ol', 'li', 'br'],
    ALLOWED_ATTR: ['href'],
  }),
)
</script>

<template>
  <div class="max-w-3xl">
    <PageHeader :title="t('security.title')" :subtitle="t('security.subtitle')" />
    <div class="grid gap-6">
      <TextArea v-model="untrusted" :label="t('security.input')" :rows="4" class="font-mono" />
      <Card :title="t('security.escaped')" :heading-level="2">
        <p class="break-words font-mono text-footnote text-label">{{ untrusted }}</p>
      </Card>
      <Card :title="t('security.sanitized')" :heading-level="2">
        <!-- eslint-disable vue/no-v-html -- sanitized by DOMPurify with an allow-list above -->
        <div
          class="prose text-body text-label [&_a]:text-tint [&_a]:underline"
          v-html="sanitized"
        />
        <!-- eslint-enable vue/no-v-html -->
      </Card>
    </div>
  </div>
</template>
