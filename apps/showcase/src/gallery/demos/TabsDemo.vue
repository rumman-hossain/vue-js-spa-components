<script setup>
import { Tabs } from '@vue-js-spa-components/ui'
import { ref } from 'vue'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'activity', label: 'Activity' },
  { id: 'billing', label: 'Billing', disabled: true },
  { id: 'members', label: 'Members' },
]

const tab = ref('overview')
</script>

<template>
  <Tabs v-model="tab" :tabs="TABS" label="Project sections">
    <template #panel-overview>
      <p class="text-subhead text-label">Q3 roadmap: 14 open tasks, due 30 September.</p>
    </template>
    <template #panel-activity>
      <p class="text-subhead text-label">Aiko moved “Invoice export” to Done.</p>
    </template>
    <template #panel-billing>
      <p class="text-subhead text-label">Only owners can see billing.</p>
    </template>
    <template #panel-members>
      <p class="text-subhead text-label">6 members, 2 pending invitations.</p>
    </template>
  </Tabs>
</template>
