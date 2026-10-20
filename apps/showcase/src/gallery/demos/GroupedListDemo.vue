<script setup>
import { GroupedList, ListRow, Toggle } from '@vue-js-spa-components/ui'
import { KeyRound } from 'lucide-vue-next'
import { ref } from 'vue'

const notifications = ref(true)
const lastAction = ref('none')
</script>

<template>
  <div class="flex max-w-lg flex-col gap-4 rounded-card bg-grouped p-4">
    <GroupedList
      header="Account"
      footer="Changes apply on every device signed in to this account."
      :heading-level="3"
    >
      <ListRow title="Name" value="Aiko Tanaka" />
      <ListRow title="Email" subtitle="aiko@example.com" />
      <ListRow title="Change password" @click="lastAction = 'Change password'">
        <template #leading>
          <span class="grid size-7 place-items-center rounded-control bg-tint-fill text-on-tint">
            <KeyRound :size="16" aria-hidden="true" />
          </span>
        </template>
      </ListRow>
      <ListRow title="Help center" href="#grouped-list" />
      <ListRow>
        <Toggle v-model="notifications" label="Notifications" />
      </ListRow>
    </GroupedList>
    <p class="px-4 text-footnote text-secondary-label">Last button row pressed: {{ lastAction }}</p>
  </div>
</template>
