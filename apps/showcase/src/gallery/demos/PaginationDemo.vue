<script setup>
import { Pagination } from '@vue-js-spa-components/ui'
import { ref } from 'vue'

const page = ref(3)
const pageSize = ref(25)
</script>

<template>
  <div class="flex flex-col gap-4">
    <Pagination
      v-model:page="page"
      v-model:page-size="pageSize"
      label="Order pages"
      :total="1284"
      :page-size-options="[10, 25, 50]"
    />
    <p class="text-footnote text-secondary-label">page: {{ page }}, pageSize: {{ pageSize }}</p>
  </div>
</template>
