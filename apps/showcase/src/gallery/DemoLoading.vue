<script setup>
import { Skeleton } from '@vue-js-spa-components/ui'
</script>

<template>
  <!-- Placeholder while a demo's code is downloaded. Decorative: the demo itself is the content. -->
  <div class="flex flex-col gap-3" data-demo-loading>
    <Skeleton class="max-w-48" />
    <Skeleton shape="rect" />
    <Skeleton class="max-w-72" />
  </div>
</template>
