<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiParts } from './model.js'
import RichText from './RichText.vue'

const props = defineProps({
  entry: {
    type: /** @type {import('vue').PropType<import('./model.js').GalleryEntry>} */ (Object),
    required: true,
  },
})

const { t } = useI18n()

/**
 * @typedef {object} Table
 * @property {string} key
 * @property {string} caption
 * @property {boolean} withDefault
 * @property {{ name: string, type: string, default?: string, description: string }[]} rows
 */

const tables = computed(() =>
  apiParts(props.entry).flatMap((part) => {
    const name = part.name
    /** @type {Table[]} */
    const list = []
    if (part.props.length > 0) {
      list.push({
        key: `${name}-props`,
        caption: t(
          part.kind === 'composable' ? 'components.optionsCaption' : 'components.propsCaption',
          { name },
        ),
        withDefault: true,
        rows: part.props,
      })
    }
    if (part.events?.length) {
      list.push({
        key: `${name}-events`,
        caption: t('components.eventsCaption', { name }),
        withDefault: false,
        rows: part.events.map((event) => ({ ...event, type: event.payload })),
      })
    }
    if (part.slots?.length) {
      list.push({
        key: `${name}-slots`,
        caption: t('components.slotsCaption', { name }),
        withDefault: false,
        rows: part.slots.map((slot) => ({ ...slot, type: slot.props })),
      })
    }
    if (part.returns?.length) {
      list.push({
        key: `${name}-returns`,
        caption: t('components.returnsCaption', { name }),
        withDefault: false,
        rows: part.returns,
      })
    }
    return list
  }),
)
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Each table scrolls on its own on narrow screens; the region makes that keyboard-reachable. -->
    <!-- eslint-disable-next-line vuejs-accessibility/no-noninteractive-tabindex -->
    <div
      v-for="table in tables"
      :key="table.key"
      role="region"
      tabindex="0"
      :aria-label="table.caption"
      class="focus-ring overflow-x-auto rounded-card bg-grouped-row"
    >
      <table class="w-full border-collapse text-left text-subhead text-label">
        <caption class="px-4 pt-3 pb-2 text-left text-headline">
          {{
            table.caption
          }}
        </caption>
        <thead>
          <tr class="text-footnote text-secondary-label">
            <th scope="col" class="border-b border-separator px-4 py-2 font-semibold">
              {{ t('components.columns.name') }}
            </th>
            <th scope="col" class="border-b border-separator px-4 py-2 font-semibold">
              {{ t('components.columns.type') }}
            </th>
            <th
              v-if="table.withDefault"
              scope="col"
              class="border-b border-separator px-4 py-2 font-semibold"
            >
              {{ t('components.columns.default') }}
            </th>
            <th scope="col" class="border-b border-separator px-4 py-2 font-semibold">
              {{ t('components.columns.description') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in table.rows"
            :key="row.name"
            class="border-t border-separator align-top first:border-t-0"
          >
            <th scope="row" class="px-4 py-2.5 font-mono text-footnote font-semibold">
              {{ row.name }}
            </th>
            <td class="px-4 py-2.5 font-mono text-footnote text-secondary-label">
              {{ row.type }}
            </td>
            <td v-if="table.withDefault" class="px-4 py-2.5 font-mono text-footnote">
              {{ row.default }}
            </td>
            <td class="min-w-60 px-4 py-2.5 text-subhead">
              <RichText :text="row.description" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
