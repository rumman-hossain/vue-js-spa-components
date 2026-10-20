<script setup>
import { Button, SecureField, TextField, useForm } from '@vue-js-spa-components/ui'
import { ref } from 'vue'
import { z } from 'zod'

const wait = (/** @type {number} */ ms) => new Promise((resolve) => setTimeout(resolve, ms))

const schema = z.object({
  email: z.email('Enter an address like name@example.com.'),
  password: z.string().min(12, 'Use at least 12 characters.'),
})

const result = ref('')

const form = useForm({
  initialValues: { email: '', password: '' },
  schema,
  asyncValidators: {
    // Stands in for a server check, e.g. "is this address already registered?"
    async email(value) {
      await wait(300)
      return String(value).endsWith('@taken.example')
        ? 'This address already has an account.'
        : undefined
    },
  },
  async onSubmit(values) {
    result.value = ''
    await wait(800)
    result.value = `Account created for ${values.email}.`
    form.reset()
  },
})
</script>

<template>
  <form class="flex max-w-md flex-col gap-4" novalidate @submit="form.handleSubmit">
    <TextField
      v-bind="form.field('email')"
      label="Email"
      type="email"
      autocomplete="email"
      hint="Try someone@taken.example to see the async check."
      required
    />
    <SecureField
      v-bind="form.field('password')"
      label="Password"
      autocomplete="new-password"
      required
    />
    <div class="flex items-center gap-3">
      <Button type="submit" :loading="form.isSubmitting.value">Create account</Button>
      <span class="text-footnote text-secondary-label">
        {{ form.isDirty.value ? 'Unsaved changes' : 'No changes' }}
      </span>
    </div>
    <p role="status" class="text-footnote text-success">{{ result }}</p>
  </form>
</template>
