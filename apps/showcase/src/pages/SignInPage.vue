<script setup>
import { Button, Card, SecureField, TextField, useForm } from '@vue-js-spa-components/ui'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { z } from 'zod'
import { useErrorMessage } from '@/app/errors.js'
import { safeRedirect } from '@/router/safeRedirect.js'
import { useAuthStore } from '@/stores/auth.js'

const { t } = useI18n()
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const errorMessage = useErrorMessage()

const submitError = ref('')
const showExpired = computed(() => auth.sessionExpired && !submitError.value)

const schema = z.object({
  email: z.email({ error: () => t('signIn.validation.email') }),
  password: z.string().min(1, { error: () => t('signIn.validation.password') }),
})

const form = useForm({
  initialValues: { email: '', password: '' },
  schema,
  async onSubmit(values) {
    submitError.value = ''
    try {
      await auth.signIn(values)
      await router.replace(safeRedirect(route.query.redirect, '/'))
    } catch (error) {
      submitError.value = errorMessage(error)
      form.values.password = ''
    }
  },
})
</script>

<template>
  <main id="main" class="grid min-h-dvh place-items-center bg-grouped px-4 py-10">
    <Card
      class="w-full max-w-sm"
      :heading-level="1"
      :title="t('signIn.title')"
      :description="t('signIn.subtitle')"
    >
      <form class="grid gap-4" novalidate @submit="form.handleSubmit">
        <p
          v-if="showExpired"
          class="rounded-field bg-highlight/20 px-3 py-2 text-footnote text-label"
          role="status"
        >
          {{ t('signIn.sessionExpired') }}
        </p>
        <p
          v-if="submitError"
          class="rounded-field bg-danger/10 px-3 py-2 text-footnote text-danger"
          role="alert"
        >
          {{ submitError }}
        </p>

        <TextField
          v-bind="form.field('email')"
          :label="t('signIn.email')"
          type="email"
          autocomplete="username"
          inputmode="email"
          required
          :required-label="t('common.required')"
        />
        <SecureField
          v-bind="form.field('password')"
          :label="t('signIn.password')"
          autocomplete="current-password"
          required
          :required-label="t('common.required')"
        />
        <Button type="submit" size="lg" block :loading="form.isSubmitting.value">
          {{ t('signIn.submit') }}
        </Button>
      </form>

      <template #footer>
        <p class="text-footnote text-secondary-label">
          {{ t('signIn.demoHint', { email: 'admin@example.com', password: 'demo-password' }) }}
        </p>
      </template>
    </Card>
  </main>
</template>
