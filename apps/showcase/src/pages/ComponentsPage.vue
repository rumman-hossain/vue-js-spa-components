<script setup>
import { EmptyState, SearchField } from '@vue-js-spa-components/ui'
import { SearchX } from 'lucide-vue-next'
import { computed, ref, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/PageHeader.vue'
import { entries } from '@/gallery/entries.js'
import GalleryEntry from '@/gallery/GalleryEntry.vue'
import { CATEGORIES, filterEntries } from '@/gallery/model.js'

const { t } = useI18n()
const baseId = useId()

/** What is typed; `query` follows it after SearchField's debounce (or at once on Enter). */
const searchText = ref('')
const query = ref('')

const visible = computed(() => filterEntries(entries, query.value))

const groups = computed(() =>
  CATEGORIES.map((category) => ({
    category,
    headingId: `${baseId}-${category.toLowerCase()}`,
    entries: visible.value.filter((entry) => entry.category === category),
  })).filter((group) => group.entries.length > 0),
)
</script>

<template>
  <div>
    <PageHeader :title="t('components.title')" :subtitle="t('components.subtitle')" />

    <div class="grid gap-8 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-10">
      <nav
        :aria-label="t('components.categories')"
        class="hidden lg:sticky lg:top-20 lg:block lg:max-h-[calc(100dvh-6rem)] lg:self-start lg:overflow-y-auto lg:pb-6"
      >
        <div class="flex flex-col gap-5">
          <div v-for="group in groups" :key="group.category" class="flex flex-col gap-1">
            <p
              :id="group.headingId"
              class="px-2 text-footnote font-semibold text-secondary-label uppercase"
            >
              {{ group.category }}
            </p>
            <!-- role="list" keeps list semantics once the bullets are removed. -->
            <!-- eslint-disable-next-line vuejs-accessibility/no-redundant-roles -->
            <ul role="list" :aria-labelledby="group.headingId" class="m-0 list-none p-0">
              <li v-for="entry in group.entries" :key="entry.id">
                <a
                  :href="`#${entry.id}`"
                  class="focus-ring flex min-h-8 items-center rounded-control px-2 text-subhead text-label hover:bg-tertiary-fill"
                >
                  {{ entry.name }}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div class="flex min-w-0 flex-col gap-12">
        <div class="flex flex-col gap-2">
          <SearchField
            v-model="searchText"
            class="max-w-md"
            landmark
            :label="t('components.filterLabel')"
            :placeholder="t('components.filterPlaceholder')"
            :clear-label="t('components.clearFilter')"
            @search="(/** @type {string} */ value) => (query = value)"
          />
          <p role="status" class="text-footnote text-secondary-label">
            {{ t('components.resultCount', { count: visible.length, total: entries.length }) }}
          </p>
        </div>

        <EmptyState
          v-if="visible.length === 0"
          :title="t('components.noResults', { query })"
          :description="t('components.noResultsHint')"
        >
          <template #icon><SearchX /></template>
        </EmptyState>

        <GalleryEntry v-for="entry in visible" :key="entry.id" :entry="entry" />
      </div>
    </div>
  </div>
</template>
