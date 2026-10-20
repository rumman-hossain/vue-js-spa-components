<script setup>
import {
  Avatar,
  Button,
  ErrorBoundary,
  Menu,
  Sidebar,
  SplitView,
  Toolbar,
} from '@vue-js-spa-components/ui'
import {
  Blocks,
  FlaskConical,
  LayoutDashboard,
  LogIn,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-vue-next'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { reportError } from '@/app/errors.js'
import { useAuthStore } from '@/stores/auth.js'

const { t } = useI18n()
const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const sections = computed(() => [
  {
    id: 'workspace',
    heading: t('nav.workspace'),
    items: [
      {
        id: 'dashboard',
        label: t('nav.dashboard'),
        icon: LayoutDashboard,
        to: { name: 'dashboard' },
      },
      { id: 'users', label: t('nav.users'), icon: Users, to: { name: 'users' } },
      { id: 'error-lab', label: t('nav.errorLab'), icon: FlaskConical, to: { name: 'error-lab' } },
    ],
  },
  {
    id: 'library',
    heading: t('nav.library'),
    items: [
      { id: 'components', label: t('nav.components'), icon: Blocks, to: { name: 'components' } },
      { id: 'security', label: t('nav.security'), icon: ShieldCheck, to: { name: 'security' } },
      { id: 'settings', label: t('nav.settings'), icon: Settings, to: { name: 'settings' } },
    ],
  },
])

/** Highlights "Users" for the list and its create/edit pages. */
const activeId = computed(() => {
  const name = String(route.name ?? '')
  return name.startsWith('user') ? 'users' : name
})

const accountItems = computed(() => [{ id: 'sign-out', label: t('app.signOut') }])

async function onAccountSelect(/** @type {string} */ id) {
  if (id !== 'sign-out') return
  await auth.signOut()
  await router.push({ name: 'sign-in' })
}
</script>

<template>
  <SplitView
    :sidebar-label="t('nav.main')"
    :open-label="t('app.openNavigation')"
    :close-label="t('common.cancel')"
  >
    <template #sidebar>
      <div class="flex min-h-dvh flex-col gap-6 px-3 py-5">
        <p class="px-3 text-headline text-label">{{ t('app.name') }}</p>
        <Sidebar :label="t('nav.main')" :sections="sections" :active-id="activeId" />
      </div>
    </template>

    <template #toolbar>
      <Toolbar>
        <template #trailing>
          <Menu
            v-if="auth.user"
            :label="t('app.signedInAs', { name: auth.user.name })"
            label-hidden
            variant="plain"
            :items="accountItems"
            align="end"
            @select="onAccountSelect"
          >
            <template #icon>
              <Avatar :name="auth.user.name" size="sm" />
            </template>
          </Menu>
          <Button
            v-else
            size="sm"
            variant="tinted"
            @click="router.push({ name: 'sign-in', query: { redirect: route.fullPath } })"
          >
            <template #leading><LogIn :size="16" aria-hidden="true" /></template>
            {{ t('signIn.title') }}
          </Button>
        </template>
      </Toolbar>
    </template>

    <div class="min-h-full bg-grouped">
      <div class="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8">
        <RouterView v-slot="{ Component, route: current }">
          <ErrorBoundary
            :key="current.fullPath"
            :fallback-title="t('boundary.title')"
            :fallback-message="t('boundary.message')"
            :retry-label="t('common.retry')"
            @error="(error) => reportError(error, { source: 'route', route: current.fullPath })"
          >
            <component :is="Component" />
          </ErrorBoundary>
        </RouterView>
      </div>
    </div>
  </SplitView>
</template>
