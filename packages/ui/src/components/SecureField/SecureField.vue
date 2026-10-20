<script setup>
import { Eye, EyeOff } from 'lucide-vue-next'
import { ref } from 'vue'
import IconButton from '../IconButton/IconButton.vue'
import TextField from '../TextField/TextField.vue'

defineProps({
  label: { type: String, required: true },
  hint: { type: String, default: undefined },
  error: { type: String, default: undefined },
  placeholder: { type: String, default: undefined },
  required: { type: Boolean, default: false },
  requiredLabel: { type: String, default: 'Required' },
  disabled: { type: Boolean, default: false },
  /** `current-password` for sign-in, `new-password` for sign-up so managers offer to generate one. */
  autocomplete: { type: String, default: 'current-password' },
  maxlength: { type: Number, default: undefined },
  /** Name of the reveal toggle. It stays the same while `aria-pressed` reports the state. */
  toggleLabel: { type: String, default: 'Show password' },
})

const emit = defineEmits({
  /** @param {FocusEvent} _event */
  blur: (_event) => true,
})

const model = defineModel({ type: String, default: '' })

const revealed = ref(false)
</script>

<template>
  <TextField
    v-model="model"
    :type="revealed ? 'text' : 'password'"
    :label="label"
    :hint="hint"
    :error="error"
    :placeholder="placeholder"
    :required="required"
    :required-label="requiredLabel"
    :disabled="disabled"
    :autocomplete="autocomplete"
    :maxlength="maxlength"
    autocapitalize="off"
    spellcheck="false"
    @blur="emit('blur', $event)"
  >
    <template #trailing>
      <IconButton
        :label="toggleLabel"
        :aria-pressed="revealed"
        :disabled="disabled"
        size="sm"
        variant="plain"
        class="-mr-1.5 text-secondary-label"
        @click="revealed = !revealed"
      >
        <EyeOff v-if="revealed" />
        <Eye v-else />
      </IconButton>
    </template>
  </TextField>
</template>
