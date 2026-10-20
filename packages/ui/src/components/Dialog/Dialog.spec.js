/* eslint-disable vue/one-component-per-file -- small test harness components, one per scenario */
import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import { expectNoA11yViolations } from '../../../tests/a11y.js'
import Dialog from './Dialog.vue'

/** @param {Record<string, unknown>} [dialogProps] */
function harness(dialogProps = {}) {
  const onClose = vi.fn()
  const open = ref(false)
  const Harness = defineComponent({
    components: { UiDialog: Dialog },
    setup: () => ({ open, onClose, dialogProps }),
    template: `
      <button type="button" @click="open = true">Edit profile</button>
      <UiDialog v-model:open="open" v-bind="dialogProps" @close="onClose">
        <label>Name <input /></label>
        <template #footer><button type="button" @click="open = false">Save</button></template>
      </UiDialog>
    `,
  })
  return { Harness, open, onClose }
}

describe('Dialog', () => {
  it('opens as a modal named by its title and described by its description', async () => {
    const user = userEvent.setup()
    const { Harness } = harness({ title: 'Edit profile', description: 'Visible to your team.' })
    const { container } = render(Harness)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Edit profile' }))
    const dialog = screen.getByRole('dialog', { name: 'Edit profile' })
    expect(dialog).toHaveAttribute('open')
    expect(dialog).toHaveAccessibleDescription('Visible to your team.')
    expect(screen.getByRole('heading', { level: 2, name: 'Edit profile' })).toBeInTheDocument()
    expect(dialog).toHaveFocus()
    await expectNoA11yViolations(container)
  })

  it('closes with Escape, emits close and returns focus to the opener', async () => {
    const user = userEvent.setup()
    const { Harness, open, onClose } = harness({ title: 'Edit' })
    render(Harness)
    const opener = screen.getByRole('button', { name: 'Edit profile' })
    await user.click(opener)
    await user.keyboard('{Escape}')
    expect(open.value).toBe(false)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(onClose).toHaveBeenCalledOnce()
    expect(opener).toHaveFocus()
  })

  it('closes with the close button and with a backdrop click', async () => {
    const user = userEvent.setup()
    const { Harness, open } = harness({ title: 'Edit', closeLabel: 'Dismiss' })
    render(Harness)
    await user.click(screen.getByRole('button', { name: 'Edit profile' }))
    await user.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(open.value).toBe(false)

    await user.click(screen.getByRole('button', { name: 'Edit profile' }))
    // A click inside the panel is not a backdrop click.
    await user.click(screen.getByRole('heading', { name: 'Edit' }))
    expect(open.value).toBe(true)
    await user.click(screen.getByRole('dialog'))
    expect(open.value).toBe(false)
  })

  it('stays open on Escape and backdrop clicks when not dismissible', async () => {
    const user = userEvent.setup()
    const { Harness, open } = harness({ title: 'Edit', dismissible: false })
    render(Harness)
    await user.click(screen.getByRole('button', { name: 'Edit profile' }))
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
    await user.keyboard('{Escape}')
    await user.click(screen.getByRole('dialog'))
    expect(open.value).toBe(true)
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(open.value).toBe(false)
  })

  it('focuses a marked control first and can be opened and closed by the parent', async () => {
    const open = ref(true)
    const Harness = defineComponent({
      components: { UiDialog: Dialog },
      setup: () => ({ open }),
      template: `
        <UiDialog v-model:open="open" title="Rename" size="sm" title-hidden>
          <input aria-label="New name" data-autofocus />
        </UiDialog>
      `,
    })
    render(Harness)
    await vi.waitFor(() => expect(screen.getByRole('textbox', { name: 'New name' })).toHaveFocus())
    expect(screen.getByRole('heading', { name: 'Rename' })).toHaveClass('visually-hidden')
    open.value = false
    await vi.waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('renders as an alert dialog without close button or backdrop dismissal', async () => {
    const user = userEvent.setup()
    const { Harness, open } = harness({ title: 'Discard?', alert: true, placement: 'sheet' })
    const { container } = render(Harness)
    await user.click(screen.getByRole('button', { name: 'Edit profile' }))
    const dialog = screen.getByRole('alertdialog', { name: 'Discard?' })
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
    await user.click(dialog)
    expect(open.value).toBe(true)
    await expectNoA11yViolations(container)
    await user.keyboard('{Escape}')
    expect(open.value).toBe(false)
  })

  it('returns focus when unmounted while open', async () => {
    const user = userEvent.setup()
    const show = ref(true)
    const Harness = defineComponent({
      components: { UiDialog: Dialog },
      setup: () => ({ show, open: ref(false) }),
      template: `
        <button type="button" @click="open = true">Open</button>
        <UiDialog v-if="show" v-model:open="open" title="Side" placement="side">Body</UiDialog>
      `,
    })
    render(Harness)
    const opener = screen.getByRole('button', { name: 'Open' })
    await user.click(opener)
    expect(screen.getByRole('dialog', { name: 'Side' })).toHaveFocus()
    show.value = false
    await vi.waitFor(() => expect(opener).toHaveFocus())
  })
})
