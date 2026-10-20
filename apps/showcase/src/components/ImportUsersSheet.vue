<script setup>
import { Button, FileUpload, Sheet, formatBytes } from '@vue-js-spa-components/ui'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ErrorCode, isApiError } from '@/api/errors.js'
import { usersApi } from '@/api/users.js'
import { useErrorMessage } from '@/app/errors.js'

const emit = defineEmits({
  /** @param {number} count */
  imported: (count) => typeof count === 'number',
})

const MAX_SIZE = 1024 * 1024

const open = defineModel('open', { type: Boolean, default: false })
const { t, locale } = useI18n()
const errorMessage = useErrorMessage()

/** @type {import('vue').Ref<any[]>} */
const files = ref([])
const fieldError = ref('')
const result = ref(/** @type {import('@/api/users.js').ImportResult | null} */ (null))
const busy = computed(() => files.value.some((item) => item.status === 'uploading'))

const messages = computed(() => ({
  removeLabel: (/** @type {string} */ name) => t('users.import.remove', { name }),
  rejected: (/** @type {{ file: File, reason: string }} */ { file, reason }) =>
    reason === 'size'
      ? t('users.import.tooLarge', { name: file.name, max: formatBytes(MAX_SIZE, locale.value) })
      : t('users.import.wrongType', { name: file.name }),
  added: () => t('users.import.added'),
  statusLabel: (/** @type {'ready' | 'uploading' | 'done' | 'error'} */ status) =>
    t(`users.import.status.${status}`),
}))

/** @param {Partial<any>} changes */
function updateItem(changes) {
  files.value = files.value.map((item, index) => (index === 0 ? { ...item, ...changes } : item))
}

async function submit() {
  fieldError.value = ''
  result.value = null
  const [item] = files.value
  if (!item) {
    fieldError.value = t('users.import.chooseFile')
    return
  }
  updateItem({ status: 'uploading', progress: 0, error: undefined })
  try {
    result.value = await usersApi.importCsv(item.file, {
      onProgress: (progress) => updateItem({ progress }),
    })
    updateItem({ status: 'done', progress: 100 })
    emit('imported', result.value.imported)
  } catch (error) {
    const isHeader =
      isApiError(error) &&
      error.code === ErrorCode.VALIDATION &&
      error.fieldErrors.file === 'header'
    updateItem({
      status: 'error',
      error: isHeader ? t('users.import.header') : errorMessage(error),
    })
  }
}

function reset() {
  files.value = []
  fieldError.value = ''
  result.value = null
}
</script>

<template>
  <Sheet
    v-model:open="open"
    :title="t('users.import.title')"
    :description="t('users.import.description')"
    :close-label="t('users.import.close')"
    :dismissible="!busy"
    @close="reset"
  >
    <div class="grid gap-4">
      <FileUpload
        v-model="files"
        :label="t('users.import.field')"
        :hint="t('users.import.hint')"
        :error="fieldError || undefined"
        accept=".csv,text/csv"
        :max-size="MAX_SIZE"
        :locale="locale"
        :drop-label="t('users.import.drop')"
        :browse-label="t('users.import.browse')"
        :messages="messages"
        @add="
          () => {
            fieldError = ''
            result = null
          }
        "
      />

      <div
        v-if="result"
        role="status"
        class="rounded-card bg-tertiary-fill px-4 py-3 text-subhead text-label"
      >
        <p class="font-semibold">
          {{
            t('users.import.result', { imported: result.imported, skipped: result.skipped.length })
          }}
        </p>
        <ul v-if="result.skipped.length" class="mt-2 grid gap-1 text-footnote text-secondary-label">
          <li v-for="skip in result.skipped" :key="skip.line">
            {{
              t('users.import.skippedLine', {
                line: skip.line,
                reason: t(`users.import.reasons.${skip.reason}`),
              })
            }}
          </li>
        </ul>
      </div>
    </div>

    <template #footer>
      <Button variant="gray" :disabled="busy" @click="open = false">{{
        t('users.import.close')
      }}</Button>
      <Button :loading="busy" :disabled="files[0]?.status === 'done'" @click="submit">
        {{ t('users.import.submit') }}
      </Button>
    </template>
  </Sheet>
</template>
