<script setup>
import { Badge, Button, Card } from '@vue-js-spa-components/ui'
</script>

<template>
  <div class="grid gap-4 rounded-card bg-grouped p-4 sm:grid-cols-2">
    <Card title="Team plan" description="¥1,200 per seat, billed monthly" :heading-level="3">
      <template #actions><Badge tone="success">Current</Badge></template>
      <p class="text-subhead text-label">12 of 20 seats in use.</p>
      <template #footer>
        <Button size="sm" variant="gray">Manage seats</Button>
        <Button size="sm">Upgrade</Button>
      </template>
    </Card>
    <div class="grid rounded-card bg-tint/20 p-3">
      <Card title="Over color" :heading-level="3" material>
        <p class="text-subhead text-label">
          The material surface stays readable on top of imagery or a tinted background.
        </p>
      </Card>
    </div>
  </div>
</template>
