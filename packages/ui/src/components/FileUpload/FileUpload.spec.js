import { fireEvent, render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import { expectNoA11yViolations } from '../../../tests/a11y.js'
import FileUpload from './FileUpload.vue'

const png = (name = 'photo.png', size = 2048) =>
  new File([new Uint8Array(size)], name, { type: 'image/png' })
const csv = (name = 'users.csv') => new File(['name,email'], name, { type: 'text/csv' })

/** Wraps FileUpload with a real v-model, like an app would. */
function renderWithModel(props = {}) {
  const items = ref(/** @type {any[]} */ ([]))
  const events = { add: vi.fn(), remove: vi.fn(), reject: vi.fn() }
  const Host = defineComponent({
    components: { FileUpload },
    setup: () => ({ items, props, events }),
    template: `<FileUpload v-model="items" label="Attachments" v-bind="props"
      @add="events.add" @remove="events.remove" @reject="events.reject" />`,
  })
  return { ...render(Host), items, events }
}

describe('FileUpload', () => {
  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => 'blob:preview')
    URL.revokeObjectURL = vi.fn()
  })
  afterEach(() => vi.restoreAllMocks())

  it('exposes one labelled file input that the keyboard can reach', async () => {
    const user = userEvent.setup()
    const { container } = renderWithModel({ hint: 'PNG or CSV' })
    const input = screen.getByLabelText('Attachments')
    expect(input).toHaveAttribute('type', 'file')
    expect(input).toHaveAccessibleDescription('PNG or CSV')
    await user.tab()
    expect(input).toHaveFocus()
    await expectNoA11yViolations(container)
  })

  it('adds picked files to the model, lists them and announces the result', async () => {
    const user = userEvent.setup()
    const { items, events } = renderWithModel({ multiple: true })
    await user.upload(screen.getByLabelText('Attachments'), [png(), csv()])

    expect(items.value.map((item) => item.file.name)).toEqual(['photo.png', 'users.csv'])
    expect(items.value[0]).toMatchObject({
      status: 'ready',
      progress: null,
      previewUrl: 'blob:preview',
    })
    expect(items.value[1].previewUrl).toBeUndefined()
    expect(events.add).toHaveBeenCalledOnce()
    expect(screen.getByRole('status')).toHaveTextContent('2 files added.')
    expect(screen.getByText('2 kB')).toBeInTheDocument()
  })

  it('rejects files by type, size and count with readable reasons', async () => {
    const user = userEvent.setup({ applyAccept: false })
    const { items, events } = renderWithModel({
      multiple: true,
      accept: 'image/*',
      maxSize: 4096,
      maxFiles: 2,
    })
    await user.upload(screen.getByLabelText('Attachments'), [
      png('a.png'),
      csv('b.csv'),
      png('huge.png', 10_000),
      png('c.png'),
      png('d.png'),
    ])
    expect(items.value.map((item) => item.file.name)).toEqual(['a.png', 'c.png'])
    expect(screen.getByText('b.csv is not an accepted file type.')).toBeInTheDocument()
    expect(screen.getByText('huge.png is larger than 4 kB.')).toBeInTheDocument()
    expect(screen.getByText('d.png was not added: the limit is 2 files.')).toBeInTheDocument()
    expect(events.reject.mock.calls[0][0].map((/** @type {any} */ r) => r.reason)).toEqual([
      'type',
      'size',
      'count',
    ])
    expect(screen.getByLabelText('Attachments')).toBeDisabled() // full
  })

  it('replaces the file in single mode and revokes the old preview', async () => {
    const user = userEvent.setup()
    const { items } = renderWithModel()
    const input = screen.getByLabelText('Attachments')
    await user.upload(input, png('first.png'))
    expect(input).toBeDisabled()
    // Single mode is full after one file; removing it enables picking again.
    await user.click(screen.getByRole('button', { name: 'Remove first.png' }))
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview')
    expect(items.value).toEqual([])
    await vi.waitFor(() => expect(input).toHaveFocus())
  })

  it('accepts dropped files', async () => {
    const { items, container } = renderWithModel({ multiple: true })
    const zone = /** @type {HTMLElement} */ (container.querySelector('[data-dropzone]'))
    await fireEvent.drop(zone, { dataTransfer: { files: [csv()] } })
    expect(items.value).toHaveLength(1)
  })

  it('shows progress and errors that the parent sets on items', async () => {
    const user = userEvent.setup()
    const { items } = renderWithModel({ multiple: true })
    await user.upload(screen.getByLabelText('Attachments'), [csv('a.csv'), csv('b.csv')])
    items.value = [
      { ...items.value[0], status: 'uploading', progress: 40 },
      { ...items.value[1], status: 'error', error: 'Server rejected the file.' },
    ]
    await Promise.resolve()
    expect(screen.getByRole('progressbar', { name: 'Uploading: a.csv' })).toHaveAttribute(
      'aria-valuenow',
      '40',
    )
    expect(screen.getByRole('button', { name: 'Remove a.csv' })).toBeDisabled()
    expect(screen.getByText('Server rejected the file.')).toBeInTheDocument()
  })

  it('uses custom messages for translation', async () => {
    const user = userEvent.setup({ applyAccept: false })
    renderWithModel({
      accept: '.csv',
      messages: {
        rejected: () => '対応していない形式です。',
        removeLabel: (/** @type {string} */ n) => `${n} を削除`,
      },
    })
    await user.upload(screen.getByLabelText('Attachments'), png())
    expect(screen.getByRole('listitem')).toHaveTextContent('対応していない形式です。')
    expect(screen.getByRole('status')).toHaveTextContent('対応していない形式です。')
  })

  it('links the field error to the input', () => {
    renderWithModel({ error: 'Add at least one file.' })
    const input = screen.getByLabelText('Attachments')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription('Add at least one file.')
  })

  it('revokes every preview when unmounted', async () => {
    const user = userEvent.setup()
    const { unmount } = renderWithModel({ multiple: true })
    await user.upload(screen.getByLabelText('Attachments'), [png('a.png'), png('b.png')])
    unmount()
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2)
  })
})
