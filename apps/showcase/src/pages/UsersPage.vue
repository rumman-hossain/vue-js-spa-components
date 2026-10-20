<script setup>
import {
  Avatar,
  Badge,
  Button,
  DataTable,
  EmptyState,
  IconButton,
  Pagination,
  SearchField,
  useAsync,
  useConfirm,
  useToast,
} from '@vue-js-spa-components/ui'
import { Pencil, Plus, Trash2, Users } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { usersApi } from '@/api/users.js'
import { useErrorMessage } from '@/app/errors.js'
import PageHeader from '@/components/PageHeader.vue'
import { useAuthStore } from '@/stores/auth.js'

/** @typedef {import('@/api/users.js').User} User */

const PAGE_SIZE = 10
const SORTABLE = ['name', 'email', 'role', 'status', 'monthlyQuota', 'createdAt']

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const toast = useToast()
const confirm = useConfirm()
const errorMessage = useErrorMessage()

const canEdit = computed(() => auth.hasRole('admin'))

/** The URL is the source of truth, so reloads, shared links and Back all restore the view. */
const query = computed(() => {
  const page = Number(route.query.page)
  const sort = String(route.query.sort ?? 'createdAt')
  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    search: typeof route.query.search === 'string' ? route.query.search : '',
    sort: SORTABLE.includes(sort) ? sort : 'createdAt',
    order: /** @type {'asc' | 'desc'} */ (route.query.order === 'asc' ? 'asc' : 'desc'),
  }
})

/** @param {Partial<typeof query.value>} changes */
function updateQuery(changes) {
  const next = { ...query.value, ...changes }
  router.replace({
    query: {
      page: next.page > 1 ? String(next.page) : undefined,
      search: next.search || undefined,
      sort: next.sort !== 'createdAt' ? next.sort : undefined,
      order: next.order !== 'desc' ? next.order : undefined,
    },
  })
}

const users = useAsync(({ signal }) =>
  usersApi.list({ ...query.value, pageSize: PAGE_SIZE }, { signal }),
)
watch(query, () => users.execute(), { immediate: true })

/** Rows shown in the table. Kept separately so deletes can be applied optimistically. */
const rows = ref(/** @type {User[]} */ ([]))
watch(users.data, (page) => (rows.value = page?.items ?? []))

const searchText = ref(query.value.search)
watch(
  () => query.value.search,
  (value) => (searchText.value = value),
)

const sort = computed({
  get: () => ({ key: query.value.sort, order: query.value.order }),
  set: (value) => updateQuery({ sort: value.key, order: value.order, page: 1 }),
})
const page = computed({
  get: () => query.value.page,
  set: (value) => updateQuery({ page: value }),
})

const columns = computed(() => [
  { key: 'name', label: t('users.columns.name'), sortable: true },
  { key: 'email', label: t('users.columns.email'), sortable: true },
  { key: 'role', label: t('users.columns.role'), sortable: true },
  { key: 'status', label: t('users.columns.status'), sortable: true },
  {
    key: 'monthlyQuota',
    label: t('users.columns.monthlyQuota'),
    sortable: true,
    align: /** @type {const} */ ('end'),
  },
  { key: 'createdAt', label: t('users.columns.createdAt'), sortable: true },
  ...(canEdit.value
    ? [{ key: 'actions', label: t('users.columns.actions'), align: /** @type {const} */ ('end') }]
    : []),
])

const number = computed(() => new Intl.NumberFormat(locale.value))
const date = computed(() => new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium' }))
const STATUS_TONE = /** @type {const} */ ({
  active: 'success',
  invited: 'accent',
  suspended: 'warning',
})

/** @param {unknown} status */
function statusTone(status) {
  return STATUS_TONE[/** @type {User['status']} */ (status)] ?? 'neutral'
}

/** @param {unknown} id */
async function removeUser(id) {
  const user = rows.value.find((row) => row.id === id)
  if (!user) return
  const confirmed = await confirm({
    title: t('users.confirmDeleteTitle', { name: user.name }),
    message: t('users.confirmDeleteMessage'),
    confirmLabel: t('common.delete'),
    cancelLabel: t('common.cancel'),
    tone: 'danger',
  })
  if (!confirmed) return

  // Optimistic update: remove now, put the row back where it was if the server refuses.
  const index = rows.value.findIndex((row) => row.id === user.id)
  rows.value = rows.value.filter((row) => row.id !== user.id)
  try {
    await usersApi.remove(user.id)
    toast.show({ tone: 'success', title: t('users.deleted', { name: user.name }) })
    if (rows.value.length === 0 && query.value.page > 1) updateQuery({ page: query.value.page - 1 })
    else users.execute()
  } catch (error) {
    rows.value = [...rows.value.slice(0, index), user, ...rows.value.slice(index)]
    toast.show({
      tone: 'danger',
      title: t('users.deleteFailed', { name: user.name }),
      description: errorMessage(error),
    })
  }
}
</script>

<template>
  <div>
    <PageHeader :title="t('users.title')" :subtitle="t('users.subtitle')">
      <template v-if="canEdit" #actions>
        <Button @click="router.push({ name: 'user-create' })">
          <template #leading><Plus :size="16" aria-hidden="true" /></template>
          {{ t('users.add') }}
        </Button>
      </template>
    </PageHeader>

    <p v-if="!canEdit" class="mb-4 rounded-card bg-tertiary-fill px-4 py-3 text-subhead text-label">
      {{ t('users.readOnly') }}
    </p>

    <div class="mb-4 max-w-sm">
      <SearchField
        v-model="searchText"
        :label="t('users.searchLabel')"
        :placeholder="t('users.searchPlaceholder')"
        @search="(/** @type {string} */ value) => updateQuery({ search: value, page: 1 })"
      />
    </div>

    <DataTable
      v-model:sort="sort"
      :columns="columns"
      :rows="rows"
      row-key="id"
      manual-sort
      :caption="t('users.caption')"
      caption-hidden
      :loading="users.isPending.value && rows.length === 0"
      :error="users.error.value ? errorMessage(users.error.value) : undefined"
      @retry="users.execute()"
    >
      <template #cell-name="{ row }">
        <span class="flex items-center gap-3">
          <Avatar :name="row.name" size="sm" />
          <span class="font-semibold">{{ row.name }}</span>
        </span>
      </template>
      <template #cell-role="{ row }">{{ t(`users.roles.${row.role}`) }}</template>
      <template #cell-status="{ row }">
        <Badge :tone="statusTone(row.status)">{{ t(`users.statuses.${row.status}`) }}</Badge>
      </template>
      <template #cell-monthlyQuota="{ row }">
        <span class="tabular-nums">{{ number.format(row.monthlyQuota) }}</span>
      </template>
      <template #cell-createdAt="{ row }">{{ date.format(new Date(row.createdAt)) }}</template>
      <template #cell-actions="{ row }">
        <span class="inline-flex gap-1">
          <IconButton
            :label="`${t('common.edit')}: ${row.name}`"
            variant="plain"
            @click="router.push({ name: 'user-edit', params: { id: row.id } })"
          >
            <Pencil :size="16" aria-hidden="true" />
          </IconButton>
          <IconButton
            :label="`${t('common.delete')}: ${row.name}`"
            variant="plain"
            tone="danger"
            @click="removeUser(row.id)"
          >
            <Trash2 :size="16" aria-hidden="true" />
          </IconButton>
        </span>
      </template>
      <template #empty>
        <EmptyState :title="t('users.emptyTitle')" :description="t('users.emptyDescription')">
          <template #icon><Users :size="32" aria-hidden="true" /></template>
        </EmptyState>
      </template>
    </DataTable>

    <Pagination
      v-if="users.data.value && users.data.value.total > 0"
      v-model:page="page"
      class="mt-4"
      :total="users.data.value.total"
      :page-size="PAGE_SIZE"
      :locale="locale"
    />
  </div>
</template>
