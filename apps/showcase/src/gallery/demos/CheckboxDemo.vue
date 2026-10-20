<script setup>
import { Checkbox } from '@vue-js-spa-components/ui'
import { computed, reactive, ref } from 'vue'

const channels = reactive([
  { id: 'email', label: 'Email', checked: true },
  { id: 'sms', label: 'Text message', checked: false },
  { id: 'push', label: 'Push notification', checked: true },
])

const all = computed({
  get: () => channels.every((channel) => channel.checked),
  set: (value) => channels.forEach((channel) => (channel.checked = value)),
})
const some = computed(() => !all.value && channels.some((channel) => channel.checked))

const terms = ref(false)
</script>

<template>
  <div class="flex max-w-md flex-col">
    <Checkbox v-model="all" :indeterminate="some" label="All channels" />
    <div class="flex flex-col pl-8">
      <Checkbox
        v-for="channel in channels"
        :key="channel.id"
        v-model="channel.checked"
        :label="channel.label"
      />
    </div>
    <Checkbox
      v-model="terms"
      label="I accept the terms of service"
      description="Required before we can send anything."
      required
    />
  </div>
</template>
