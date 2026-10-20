<script setup>
import { Avatar, Skeleton, Toggle } from '@vue-js-spa-components/ui'
import { ref } from 'vue'

const loading = ref(true)
</script>

<template>
  <div class="flex max-w-md flex-col gap-4">
    <Toggle v-model="loading" label="Simulate loading" />
    <!-- The region carries aria-busy and the status message; the skeletons are decorative. -->
    <div :aria-busy="loading" class="flex min-h-14 items-center gap-3">
      <template v-if="loading">
        <Skeleton shape="circle" />
        <div class="flex flex-1 flex-col gap-2">
          <Skeleton class="max-w-40" />
          <Skeleton class="max-w-60" />
        </div>
      </template>
      <template v-else>
        <Avatar name="Mei Suzuki" />
        <div class="flex flex-col">
          <span class="text-body text-label">Mei Suzuki</span>
          <span class="text-subhead text-secondary-label">Product designer, Osaka</span>
        </div>
      </template>
    </div>
    <p role="status" class="visually-hidden">{{ loading ? 'Loading profile' : '' }}</p>
  </div>
</template>
