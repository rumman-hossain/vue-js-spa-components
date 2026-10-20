<script setup>
import { Button, Checkbox, Popover } from '@vue-js-spa-components/ui'
import { SlidersHorizontal } from 'lucide-vue-next'
import { computed, reactive } from 'vue'

const statuses = reactive({ active: true, invited: true, suspended: false })
const shown = computed(() =>
  Object.entries(statuses)
    .filter(([, on]) => on)
    .map(([name]) => name),
)
</script>

<template>
  <div class="flex flex-col gap-3">
    <Popover label="Filters">
      <template #icon><SlidersHorizontal /></template>
      <template #default="{ close }">
        <div class="flex w-60 flex-col px-2 pb-1">
          <Checkbox v-model="statuses.active" label="Active" />
          <Checkbox v-model="statuses.invited" label="Invited" />
          <Checkbox v-model="statuses.suspended" label="Suspended" />
          <Button size="sm" class="mt-2" @click="close({ returnFocus: true })">Apply</Button>
        </div>
      </template>
    </Popover>
    <p class="text-footnote text-secondary-label">
      Showing: {{ shown.length ? shown.join(', ') : 'nothing' }}
    </p>
  </div>
</template>
