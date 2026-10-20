import { computed, reactive, ref, toRaw } from 'vue'

/**
 * Minimal Standard Schema shape (https://standardschema.dev), implemented by Zod 4, Valibot and
 * ArkType. Accepting the standard keeps this library free of a validation dependency.
 *
 * @template T
 * @typedef {{
 *   '~standard': {
 *     validate: (value: unknown) =>
 *       | { value: T, issues?: undefined }
 *       | { issues: ReadonlyArray<{ message: string, path?: ReadonlyArray<PropertyKey | { key: PropertyKey }> }> }
 *       | Promise<
 *           | { value: T, issues?: undefined }
 *           | { issues: ReadonlyArray<{ message: string, path?: ReadonlyArray<PropertyKey | { key: PropertyKey }> }> }
 *         >
 *   }
 * }} StandardSchema
 */

/**
 * @param {ReadonlyArray<PropertyKey | { key: PropertyKey }> | undefined} path
 * @returns {string}
 */
function pathToKey(path) {
  if (!path || path.length === 0) return '_form'
  return path.map((part) => String(typeof part === 'object' ? part.key : part)).join('.')
}

/** @param {unknown} value */
function clone(value) {
  return structuredClone(toRaw(value))
}

/**
 * Form state with schema validation, async field checks, server-error mapping and submit locking.
 *
 * Errors become visible after a field is blurred or after the first submit attempt, so users are
 * not shouted at while they are still typing.
 *
 * @template {Record<string, any>} V
 * @param {{
 *   initialValues: V,
 *   schema?: StandardSchema<V>,
 *   asyncValidators?: Partial<Record<keyof V & string, (value: any, values: V) => Promise<string | undefined>>>,
 *   onSubmit: (values: V) => unknown | Promise<unknown>,
 * }} options
 */
export function useForm(options) {
  let initial = clone(options.initialValues)
  const values = /** @type {V} */ (reactive(clone(initial)))
  /** @type {Record<string, string>} */
  const errors = reactive({})
  /** @type {Record<string, boolean>} */
  const touched = reactive({})
  const submitCount = ref(0)
  const isSubmitting = ref(false)
  const isValidating = ref(false)

  const isDirty = computed(() => JSON.stringify(values) !== JSON.stringify(initial))

  /** @param {Record<string, string>} next */
  function replaceErrors(next) {
    for (const key of Object.keys(errors)) delete errors[key]
    Object.assign(errors, next)
  }

  /** @returns {Promise<Record<string, string>>} */
  async function runSchema() {
    if (!options.schema) return {}
    const result = await options.schema['~standard'].validate(clone(values))
    /** @type {Record<string, string>} */
    const found = {}
    for (const issue of result.issues ?? []) {
      const key = pathToKey(issue.path)
      found[key] ??= issue.message
    }
    return found
  }

  /**
   * @param {string} name
   * @returns {Promise<string | undefined>}
   */
  async function runAsyncValidator(name) {
    const validator = options.asyncValidators?.[/** @type {keyof V & string} */ (name)]
    return validator ? validator(values[name], values) : undefined
  }

  /** Validates every field. Resolves to true when the form is valid. */
  async function validate() {
    isValidating.value = true
    try {
      const found = await runSchema()
      const asyncNames = Object.keys(options.asyncValidators ?? {}).filter((name) => !found[name])
      const asyncResults = await Promise.all(asyncNames.map((name) => runAsyncValidator(name)))
      asyncNames.forEach((name, index) => {
        const message = asyncResults[index]
        if (message) found[name] = message
      })
      replaceErrors(found)
      return Object.keys(found).length === 0
    } finally {
      isValidating.value = false
    }
  }

  /** @param {string} name */
  async function validateField(name) {
    const found = await runSchema()
    const message = found[name] ?? (await runAsyncValidator(name))
    if (message) errors[name] = message
    else delete errors[name]
    return !message
  }

  /** @param {string} name */
  function isErrorVisible(name) {
    return Boolean(errors[name]) && (touched[name] || submitCount.value > 0)
  }

  /**
   * Props to spread onto a field component: `<TextField v-bind="form.field('email')" />`.
   * @param {keyof V & string} name
   */
  function field(name) {
    return {
      name,
      modelValue: values[name],
      /** @param {unknown} value */
      'onUpdate:modelValue': (value) => {
        ;/** @type {Record<string, unknown>} */ (values)[name] = value
        // Once a field has been judged, keep its message in sync while the user fixes it.
        if (touched[name] || submitCount.value > 0) validateField(name)
      },
      onBlur: () => {
        touched[name] = true
        validateField(name)
      },
      error: isErrorVisible(name) ? errors[name] : undefined,
    }
  }

  /**
   * Maps errors returned by the server (for example a 422 response) onto fields.
   * @param {Record<string, string>} serverErrors
   */
  function setErrors(serverErrors) {
    for (const name of Object.keys(serverErrors)) touched[name] = true
    Object.assign(errors, serverErrors)
  }

  /** @param {V} [nextValues] new baseline, e.g. after loading a record from the API */
  function reset(nextValues) {
    if (nextValues) initial = clone(nextValues)
    for (const key of Object.keys(values))
      delete (/** @type {Record<string, unknown>} */ (values)[key])
    Object.assign(values, clone(initial))
    replaceErrors({})
    for (const key of Object.keys(touched)) delete touched[key]
    submitCount.value = 0
  }

  /** @param {Event} [event] */
  async function handleSubmit(event) {
    event?.preventDefault()
    if (isSubmitting.value) return // double-click or Enter spam
    submitCount.value += 1
    isSubmitting.value = true
    try {
      if (!(await validate())) return
      await options.onSubmit(clone(values))
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    values,
    errors,
    touched,
    submitCount,
    isSubmitting,
    isValidating,
    isDirty,
    /** The message for the whole form (schema issues with no path, or server `_form`). */
    formError: computed(() => (submitCount.value > 0 ? errors._form : undefined)),
    field,
    isErrorVisible,
    validate,
    validateField,
    setErrors,
    reset,
    handleSubmit,
  }
}
