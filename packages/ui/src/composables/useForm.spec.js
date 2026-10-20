import { describe, expect, it, vi } from 'vitest'
import { useForm } from './useForm.js'

/**
 * A tiny hand-written Standard Schema, so the library's tests do not depend on a validation
 * package. Zod 4 / Valibot produce the same `~standard` shape.
 *
 * @param {(values: any) => Array<{ path?: string[], message: string }>} check
 */
function schema(check) {
  return {
    '~standard': {
      validate: (/** @type {any} */ value) => {
        const issues = check(value)
        return issues.length ? { issues } : { value }
      },
    },
  }
}

const signUpSchema = schema((values) => {
  const issues = []
  if (!values.email.includes('@')) issues.push({ path: ['email'], message: 'Enter a valid email' })
  if (values.password.length < 8) issues.push({ path: ['password'], message: 'Use 8+ characters' })
  return issues
})

function createForm(overrides = {}) {
  const onSubmit = vi.fn()
  const form = useForm({
    initialValues: { email: '', password: '' },
    schema: signUpSchema,
    onSubmit,
    ...overrides,
  })
  return { form, onSubmit }
}

describe('useForm', () => {
  it('hides errors until a field is blurred', async () => {
    const { form } = createForm()
    form.field('email')['onUpdate:modelValue']('nope')
    await form.validateField('email')
    expect(form.field('email').error).toBeUndefined()

    form.field('email').onBlur()
    await vi.waitFor(() => expect(form.field('email').error).toBe('Enter a valid email'))
  })

  it('blocks submit when invalid and shows every error', async () => {
    const { form, onSubmit } = createForm()
    await form.handleSubmit()
    expect(onSubmit).not.toHaveBeenCalled()
    expect(form.field('email').error).toBe('Enter a valid email')
    expect(form.field('password').error).toBe('Use 8+ characters')
  })

  it('submits a plain copy of the values when valid', async () => {
    const { form, onSubmit } = createForm()
    form.values.email = 'a@b.co'
    form.values.password = 'long-enough'
    await form.handleSubmit()
    expect(onSubmit).toHaveBeenCalledWith({ email: 'a@b.co', password: 'long-enough' })
  })

  it('ignores a second submit while the first is running', async () => {
    /** @type {() => void} */
    let finish = () => {}
    const onSubmit = vi.fn(() => new Promise((resolve) => (finish = () => resolve(undefined))))
    const form = useForm({ initialValues: { name: 'x' }, onSubmit })
    const first = form.handleSubmit()
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalled())
    expect(form.isSubmitting.value).toBe(true)
    await form.handleSubmit()
    finish()
    await first
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(form.isSubmitting.value).toBe(false)
  })

  it('runs async validators and keeps the first schema message per field', async () => {
    const isTaken = vi.fn(async (/** @type {string} */ email) =>
      email === 'taken@x.co' ? 'Already registered' : undefined,
    )
    const { form, onSubmit } = createForm({ asyncValidators: { email: isTaken } })
    form.values.email = 'taken@x.co'
    form.values.password = 'long-enough'
    await form.handleSubmit()
    expect(onSubmit).not.toHaveBeenCalled()
    expect(form.errors.email).toBe('Already registered')
  })

  it('maps server errors onto fields and the form', async () => {
    const { form } = createForm()
    form.setErrors({ email: 'Server says no', _form: 'Try again later' })
    expect(form.field('email').error).toBe('Server says no')
    expect(form.formError.value).toBeUndefined() // only after a submit attempt
    await form.handleSubmit()
    expect(form.errors.email).toBe('Enter a valid email') // re-validated on submit
  })

  it('tracks dirty state and resets to a new baseline', () => {
    const { form } = createForm()
    expect(form.isDirty.value).toBe(false)
    form.values.email = 'changed@x.co'
    expect(form.isDirty.value).toBe(true)
    form.reset({ email: 'loaded@x.co', password: '' })
    expect(form.values.email).toBe('loaded@x.co')
    expect(form.isDirty.value).toBe(false)
  })

  it('does not share nested objects with the initial values', () => {
    const initialValues = { tags: ['a'] }
    const form = useForm({ initialValues, onSubmit: vi.fn() })
    form.values.tags.push('b')
    expect(initialValues.tags).toEqual(['a'])
  })

  it('reports issues without a path as a form-level error', async () => {
    const form = useForm({
      initialValues: { a: 1 },
      schema: schema(() => [{ message: 'Whole form is wrong' }]),
      onSubmit: vi.fn(),
    })
    await form.handleSubmit()
    expect(form.formError.value).toBe('Whole form is wrong')
  })
})
