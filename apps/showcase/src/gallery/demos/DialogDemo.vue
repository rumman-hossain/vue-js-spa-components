<script setup>
import { Button, Dialog, SegmentedControl, TextField } from '@vue-js-spa-components/ui'
import { ref, useId } from 'vue'

/** @typedef {'center' | 'sheet' | 'side'} Placement */

const open = ref(false)
const placement = ref(/** @type {Placement} */ ('center'))
const name = ref('Q3 roadmap')
const draft = ref('')
const formId = useId()

function edit() {
  draft.value = name.value
  open.value = true
}

function save() {
  name.value = draft.value.trim() || name.value
  open.value = false
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <SegmentedControl
      v-model="placement"
      label="Placement"
      label-visible
      size="sm"
      :options="[
        { value: 'center', label: 'Center' },
        { value: 'sheet', label: 'Sheet' },
        { value: 'side', label: 'Side' },
      ]"
    />
    <div class="flex flex-wrap items-center gap-3">
      <Button @click="edit">Rename project</Button>
      <span class="text-subhead text-label">Project: {{ name }}</span>
    </div>
    <Dialog
      v-model:open="open"
      title="Rename project"
      description="Everyone in the workspace sees the new name."
      :placement="placement"
    >
      <form :id="formId" @submit.prevent="save">
        <TextField v-model="draft" label="Project name" data-autofocus />
      </form>
      <template #footer>
        <Button variant="gray" @click="open = false">Cancel</Button>
        <Button type="submit" :form="formId">Save</Button>
      </template>
    </Dialog>
  </div>
</template>
