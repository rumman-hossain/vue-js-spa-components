<script setup>
import { CircleAlert, CircleCheck, FileText, Upload, X } from 'lucide-vue-next'
import { computed, nextTick, onBeforeUnmount, ref, useId } from 'vue'
import FieldFrame from '../_shared/FieldFrame.vue'
import { useField } from '../_shared/useField.js'
import IconButton from '../IconButton/IconButton.vue'
import ProgressBar from '../ProgressBar/ProgressBar.vue'
import { formatBytes, partitionFiles } from './fileRules.js'

const props = defineProps({
  label: { type: String, required: true },
  labelHidden: { type: Boolean, default: false },
  hint: { type: String, default: undefined },
  error: { type: String, default: undefined },
  required: { type: Boolean, default: false },
  requiredLabel: { type: String, default: 'Required' },
  id: { type: String, default: undefined },
  /** Same syntax as the native attribute: `"image/*,.csv,application/pdf"`. */
  accept: { type: String, default: undefined },
  multiple: { type: Boolean, default: false },
  /** Maximum size per file, in bytes. */
  maxSize: { type: Number, default: undefined },
  /** Maximum number of files in the list (only with `multiple`). */
  maxFiles: { type: Number, default: undefined },
  disabled: { type: Boolean, default: false },
  /** Show thumbnails for image files. */
  previews: { type: Boolean, default: true },
  locale: { type: String, default: undefined },
  dropLabel: { type: String, default: 'Drag files here, or' },
  browseLabel: { type: String, default: 'choose files' },
  /** Builds user-facing copy; override to translate. */
  messages: {
    type: /** @type {import('vue').PropType<Partial<{
      removeLabel: (name: string) => string,
      rejected: (rejection: Rejection, limits: { maxSize?: string, maxFiles?: number }) => string,
      added: (count: number) => string,
      statusLabel: (status: UploadStatus) => string,
    }>>} */ (Object),
    default: () => ({}),
  },
})

const emit = defineEmits({
  /** @param {UploadItem[]} items */
  add: (items) => Array.isArray(items),
  /** @param {UploadItem} item */
  remove: (item) => Boolean(item),
  /** @param {Rejection[]} rejections */
  reject: (rejections) => Array.isArray(rejections),
})

/**
 * @typedef {'ready' | 'uploading' | 'done' | 'error'} UploadStatus
 * @typedef {object} UploadItem
 * @property {string} id
 * @property {File} file
 * @property {UploadStatus} status Set by the parent while it uploads the file.
 * @property {number | null} progress 0–100, or null when unknown.
 * @property {string} [error] Shown under the file when `status` is `error`.
 * @property {string} [previewUrl] Object URL for image thumbnails; revoked on remove and unmount.
 * @typedef {{ file: File, reason: 'type' | 'size' | 'count' }} Rejection
 */

defineOptions({ inheritAttrs: false })

const items = defineModel({
  type: /** @type {import('vue').PropType<UploadItem[]>} */ (Array),
  default: () => [],
})

const { id, hintId, errorId, describedBy, rootAttrs, controlAttrs } = useField(props)
const listId = useId()
const input = ref(/** @type {HTMLInputElement | null} */ (null))
const dragging = ref(false)
const announcement = ref('')
const rejections = ref(/** @type {string[]} */ ([]))

const DEFAULT_MESSAGES = {
  removeLabel: (/** @type {string} */ name) => `Remove ${name}`,
  rejected: (
    /** @type {Rejection} */ { file, reason },
    /** @type {{ maxSize?: string, maxFiles?: number }} */ limits,
  ) =>
    reason === 'type'
      ? `${file.name} is not an accepted file type.`
      : reason === 'size'
        ? `${file.name} is larger than ${limits.maxSize}.`
        : `${file.name} was not added: the limit is ${limits.maxFiles} files.`,
  added: (/** @type {number} */ count) => (count === 1 ? '1 file added.' : `${count} files added.`),
  statusLabel: (/** @type {UploadStatus} */ status) =>
    ({ ready: 'Ready', uploading: 'Uploading', done: 'Uploaded', error: 'Failed' })[status],
}
const text = computed(() => ({ ...DEFAULT_MESSAGES, ...props.messages }))

const limits = computed(() => ({
  maxSize: props.maxSize === undefined ? undefined : formatBytes(props.maxSize, props.locale),
  maxFiles: props.maxFiles,
}))

const isFull = computed(
  () =>
    (!props.multiple && items.value.length > 0) ||
    (props.maxFiles !== undefined && items.value.length >= props.maxFiles),
)

/** @param {File} file */
function toItem(file) {
  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
    file,
    status: /** @type {UploadStatus} */ ('ready'),
    progress: null,
    previewUrl:
      props.previews && file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
  }
}

/** @param {File[]} files */
function addFiles(files) {
  if (props.disabled || files.length === 0) return
  const candidates = props.multiple ? files : files.slice(0, 1)
  const current = props.multiple ? items.value.length : 0
  const { accepted, rejected } = partitionFiles(candidates, {
    accept: props.accept,
    maxSize: props.maxSize,
    maxFiles: props.multiple ? props.maxFiles : 1,
    current,
  })

  rejections.value = rejected.map((rejection) => text.value.rejected(rejection, limits.value))
  if (rejected.length) emit('reject', rejected)

  if (accepted.length) {
    const added = accepted.map(toItem)
    if (!props.multiple) items.value.forEach(revoke)
    items.value = props.multiple ? [...items.value, ...added] : added
    emit('add', added)
  }
  announcement.value = [
    accepted.length ? text.value.added(accepted.length) : '',
    ...rejections.value,
  ]
    .filter(Boolean)
    .join(' ')
}

/** @param {Event} event */
function onInputChange(event) {
  const target = /** @type {HTMLInputElement} */ (event.target)
  addFiles([...(target.files ?? [])])
  target.value = '' // allow picking the same file again after removing it
}

/** @param {DragEvent} event */
function onDrop(event) {
  dragging.value = false
  addFiles([...(event.dataTransfer?.files ?? [])])
}

/** @param {UploadItem} item */
function revoke(item) {
  if (item.previewUrl) URL.revokeObjectURL(item.previewUrl)
}

/** @param {UploadItem} item */
function remove(item) {
  revoke(item)
  items.value = items.value.filter((candidate) => candidate.id !== item.id)
  emit('remove', item)
  // Keep keyboard users in the component after the focused button disappears. Wait a tick:
  // the input may only be re-enabled once the list is no longer full.
  nextTick(() => input.value?.focus())
}

onBeforeUnmount(() => items.value.forEach(revoke))
</script>

<template>
  <FieldFrame
    v-bind="rootAttrs"
    :control-id="id"
    :hint-id="hintId"
    :error-id="errorId"
    :label="label"
    :label-hidden="labelHidden"
    :hint="hint"
    :error="error"
    :required="required"
    :required-label="requiredLabel"
  >
    <!-- Drag and drop is a mouse shortcut; the native file input below is the accessible path. -->
    <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
    <div
      class="relative flex flex-col items-center gap-2 rounded-card border-2 border-dashed px-4 py-6 text-center transition-colors duration-150 ease-standard"
      :class="[
        dragging ? 'border-tint bg-tint/10' : error ? 'border-danger' : 'border-control-border',
        disabled || isFull ? 'opacity-60' : '',
      ]"
      data-dropzone
      @dragenter.prevent="dragging = !disabled && !isFull"
      @dragover.prevent
      @dragleave.self="dragging = false"
      @drop.prevent="onDrop"
    >
      <Upload aria-hidden="true" class="size-6 text-secondary-label" />
      <p class="text-subhead text-secondary-label">
        {{ dropLabel }}
        <span class="relative inline-block">
          <input
            :id="id"
            ref="input"
            v-bind="controlAttrs"
            type="file"
            class="peer visually-hidden"
            :accept="accept"
            :multiple="multiple"
            :disabled="disabled || isFull"
            :required="required && items.length === 0"
            :aria-invalid="error ? 'true' : undefined"
            :aria-describedby="
              [describedBy, items.length ? listId : null].filter(Boolean).join(' ') || undefined
            "
            @change="onInputChange"
          />
          <!-- Mouse target only. Keyboard and screen-reader users reach the input itself, which
               keeps the field label as its only accessible name; the ring shows here on focus. -->
          <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/no-static-element-interactions -->
          <span
            aria-hidden="true"
            class="cursor-pointer rounded-control font-semibold text-tint underline-offset-2 peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-tint/55 peer-disabled:cursor-not-allowed hover:underline"
            @click="input?.click()"
          >
            {{ browseLabel }}
          </span>
        </span>
      </p>
      <slot name="description" />
    </div>

    <ul v-if="rejections.length" class="mt-2 grid gap-1 text-footnote text-danger">
      <li v-for="message in rejections" :key="message" class="flex items-start gap-1.5">
        <CircleAlert aria-hidden="true" class="mt-0.5 size-3.5 shrink-0" />
        {{ message }}
      </li>
    </ul>

    <!-- role="list" is needed: some browsers drop list semantics once list-style is removed. -->
    <!-- eslint-disable-next-line vuejs-accessibility/no-redundant-roles -->
    <ul v-if="items.length" :id="listId" class="mt-3 grid gap-2" role="list">
      <li
        v-for="item in items"
        :key="item.id"
        class="flex items-center gap-3 rounded-card bg-grouped-row px-3 py-2 shadow-card"
      >
        <img
          v-if="item.previewUrl"
          :src="item.previewUrl"
          alt=""
          class="size-10 shrink-0 rounded-control object-cover"
        />
        <FileText v-else aria-hidden="true" class="size-10 shrink-0 p-2 text-secondary-label" />
        <div class="min-w-0 flex-1">
          <p class="truncate text-subhead font-medium text-label">{{ item.file.name }}</p>
          <p class="flex items-center gap-1.5 text-footnote text-secondary-label">
            <span>{{ formatBytes(item.file.size, locale) }}</span>
            <span aria-hidden="true">·</span>
            <span
              :class="{
                'text-danger': item.status === 'error',
                'text-success': item.status === 'done',
              }"
            >
              <CircleCheck
                v-if="item.status === 'done'"
                aria-hidden="true"
                class="inline size-3.5"
              />
              {{
                item.status === 'error' && item.error ? item.error : text.statusLabel(item.status)
              }}
            </span>
          </p>
          <ProgressBar
            v-if="item.status === 'uploading'"
            class="mt-1.5"
            :label="`${text.statusLabel('uploading')}: ${item.file.name}`"
            label-hidden
            :value="item.progress"
            :indeterminate="item.progress === null"
          />
        </div>
        <IconButton
          :label="text.removeLabel(item.file.name)"
          variant="plain"
          :disabled="disabled || item.status === 'uploading'"
          @click="remove(item)"
        >
          <X aria-hidden="true" />
        </IconButton>
      </li>
    </ul>

    <p class="visually-hidden" role="status" aria-live="polite">{{ announcement }}</p>
  </FieldFrame>
</template>
