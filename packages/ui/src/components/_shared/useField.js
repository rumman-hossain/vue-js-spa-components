import { computed, useAttrs, useId } from 'vue'

/**
 * Shared wiring for labelled form controls: stable ids for the control, hint and error, the
 * `aria-describedby` list, and a split of fallthrough attributes so `class`/`style` style the
 * wrapper while everything else (`name`, `data-*`, listeners) reaches the native control.
 *
 * Components using this must call `defineOptions({ inheritAttrs: false })`.
 *
 * @param {{ id?: string, hint?: string, error?: string }} props
 */
export function useField(props) {
  const attrs = useAttrs()
  const generatedId = useId()

  const id = computed(() => props.id ?? generatedId)
  const hintId = computed(() => `${id.value}-hint`)
  const errorId = computed(() => `${id.value}-error`)

  // Error first: it is the more urgent message and screen readers read the list in order.
  const describedBy = computed(
    () =>
      [props.error && errorId.value, props.hint && hintId.value].filter(Boolean).join(' ') ||
      undefined,
  )

  const rootAttrs = computed(() => ({ class: attrs.class, style: attrs.style }))
  const controlAttrs = computed(() => {
    const { class: _class, style: _style, ...rest } = attrs
    return rest
  })

  return { id, hintId, errorId, describedBy, rootAttrs, controlAttrs }
}
