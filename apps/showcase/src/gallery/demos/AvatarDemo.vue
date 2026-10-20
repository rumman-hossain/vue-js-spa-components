<script setup>
import { Avatar } from '@vue-js-spa-components/ui'

const PEOPLE = ['Aiko Tanaka', 'José Álvarez', 'Ngozi Okafor', '山田 太郎']
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="flex flex-wrap items-end gap-4">
      <Avatar name="Aiko Tanaka" size="sm" />
      <Avatar name="Aiko Tanaka" />
      <Avatar name="Aiko Tanaka" size="lg" />
      <Avatar name="Aiko Tanaka" size="xl" />
    </div>
    <!-- Same name, same color: the tint is derived from the name. -->
    <ul class="flex flex-wrap gap-4">
      <li v-for="person in PEOPLE" :key="person" class="flex items-center gap-2">
        <Avatar :name="person" size="sm" />
        <span aria-hidden="true" class="text-subhead text-label">{{ person }}</span>
      </li>
    </ul>
  </div>
</template>
