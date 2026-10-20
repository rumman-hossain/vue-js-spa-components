<script setup>
import {
  Button,
  Card,
  NumberField,
  SegmentedControl,
  SelectField,
  Skeleton,
  ErrorState,
  TextField,
  useAsync,
  useConfirm,
  useForm,
  useToast,
} from '@vue-js-spa-components/ui'
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import { z } from 'zod'
import { ErrorCode, isApiError } from '@/api/errors.js'
import { usersApi } from '@/api/users.js'
import { useErrorMessage } from '@/app/errors.js'
import PageHeader from '@/components/PageHeader.vue'

/** @typedef {import('@/api/users.js').UserInput} UserInput */

const props = defineProps({
  id: { type: String, default: undefined },
})

const { t } = useI18n()
const router = useRouter()
const toast = useToast()
const confirm = useConfirm()
const errorMessage = useErrorMessage()

const isEdit = computed(() => Boolean(props.id))
const MAX_QUOTA = 10_000_000

/** @type {UserInput} */
const EMPTY = { name: '', email: '', role: 'viewer', status: 'invited', monthlyQuota: 10_000 }

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: () => t('userForm.validation.name') }),
  email: z.email({ error: () => t('userForm.validation.email') }),
  role: z.enum(['admin', 'viewer']),
  status: z.enum(['active', 'invited', 'suspended']),
  monthlyQuota: z
    .number({ error: () => t('userForm.validation.quota') })
    .int()
    .min(0)
    .max(MAX_QUOTA, { error: () => t('userForm.validation.quota') }),
})

/** Server field errors are codes; translate them here instead of showing server text. */
const SERVER_FIELD_MESSAGES = /** @type {Record<string, Record<string, string>>} */ ({
  name: { required: 'userForm.validation.name' },
  email: { invalid: 'userForm.validation.email', taken: 'userForm.validation.emailTaken' },
  monthlyQuota: { invalid: 'userForm.validation.quota' },
})

const form = useForm({
  initialValues: EMPTY,
  schema,
  asyncValidators: {
    async email(email) {
      if (!z.email().safeParse(email).success) return undefined // the schema reports this case
      const { available } = await usersApi.checkEmail(email, props.id)
      return available ? undefined : t('userForm.validation.emailTaken')
    },
  },
  async onSubmit(values) {
    try {
      const user = isEdit.value
        ? await usersApi.update(/** @type {string} */ (props.id), values)
        : await usersApi.create(values)
      form.reset(values) // clears the dirty flag so leaving does not prompt
      toast.show({
        tone: 'success',
        title: isEdit.value ? t('userForm.saved') : t('userForm.created', { name: user.name }),
      })
      await router.push({ name: 'users' })
    } catch (error) {
      if (isApiError(error) && error.code === ErrorCode.VALIDATION) {
        form.setErrors(
          Object.fromEntries(
            Object.entries(error.fieldErrors).map(([field, code]) => [
              field,
              t(SERVER_FIELD_MESSAGES[field]?.[code] ?? 'errors.validation_failed'),
            ]),
          ),
        )
        return
      }
      toast.show({ tone: 'danger', title: errorMessage(error) })
    }
  },
})

const loader = useAsync(async ({ signal }) => {
  const user = await usersApi.get(/** @type {string} */ (props.id), { signal })
  const { name, email, role, status, monthlyQuota } = user
  form.reset({ name, email, role, status, monthlyQuota })
  return user
})

onMounted(() => {
  if (isEdit.value) loader.execute()
})

const roleOptions = computed(() => [
  { value: 'viewer', label: t('users.roles.viewer') },
  { value: 'admin', label: t('users.roles.admin') },
])
const statusOptions = computed(() =>
  ['active', 'invited', 'suspended'].map((value) => ({
    value,
    label: t(`users.statuses.${value}`),
  })),
)

onBeforeRouteLeave(async () => {
  if (!form.isDirty.value || form.isSubmitting.value) return true
  return confirm({
    title: t('userForm.unsavedTitle'),
    message: t('userForm.unsavedMessage'),
    confirmLabel: t('userForm.leave'),
    cancelLabel: t('userForm.stay'),
    tone: 'danger',
  })
})

/** @param {BeforeUnloadEvent} event */
function warnOnUnload(event) {
  if (form.isDirty.value) event.preventDefault()
}
onMounted(() => window.addEventListener('beforeunload', warnOnUnload))
onBeforeUnmount(() => window.removeEventListener('beforeunload', warnOnUnload))
</script>

<template>
  <div class="max-w-2xl">
    <PageHeader :title="isEdit ? t('userForm.editTitle') : t('userForm.createTitle')" />

    <ErrorState
      v-if="loader.error.value"
      :title="errorMessage(loader.error.value)"
      :retry-label="t('common.retry')"
      alert
      @retry="loader.execute()"
    />

    <Card v-else-if="isEdit && loader.status.value !== 'success'" aria-busy="true">
      <div class="grid gap-5">
        <Skeleton v-for="n in 5" :key="n" class="h-11" />
      </div>
    </Card>

    <Card v-else>
      <form class="grid gap-5" novalidate @submit="form.handleSubmit">
        <TextField
          v-bind="form.field('name')"
          :label="t('userForm.name')"
          autocomplete="name"
          required
          :required-label="t('common.required')"
        />
        <TextField
          v-bind="form.field('email')"
          :label="t('userForm.email')"
          :hint="t('userForm.emailHint')"
          type="email"
          autocomplete="email"
          required
          :required-label="t('common.required')"
        />
        <SegmentedControl
          v-model="form.values.role"
          :label="t('userForm.role')"
          label-visible
          :options="roleOptions"
        />
        <SelectField
          v-bind="form.field('status')"
          :label="t('userForm.status')"
          :options="statusOptions"
        />
        <NumberField
          v-bind="form.field('monthlyQuota')"
          :label="t('userForm.monthlyQuota')"
          :hint="t('userForm.monthlyQuotaHint')"
          :min="0"
          :max="MAX_QUOTA"
          :step="1000"
          :allow-negative="false"
          required
          :required-label="t('common.required')"
        />

        <div class="flex flex-wrap justify-end gap-3 pt-2">
          <Button variant="gray" @click="router.push({ name: 'users' })">{{
            t('common.cancel')
          }}</Button>
          <Button type="submit" :loading="form.isSubmitting.value">
            {{ isEdit ? t('userForm.save') : t('userForm.create') }}
          </Button>
        </div>
      </form>
    </Card>
  </div>
</template>
