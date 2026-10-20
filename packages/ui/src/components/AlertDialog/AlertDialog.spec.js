import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import { expectNoA11yViolations } from '../../../tests/a11y.js'
import AlertDialog from './AlertDialog.vue'

/** @param {Record<string, unknown>} props */
function setup(props) {
  const onConfirm = vi.fn()
  const onCancel = vi.fn()
  const open = ref(true)
  const Harness = defineComponent({
    components: { AlertDialog },
    setup: () => ({ open, onConfirm, onCancel, props }),
    template: `<AlertDialog v-model:open="open" v-bind="props" @confirm="onConfirm" @cancel="onCancel">Extra</AlertDialog>`,
  })
  return { Harness, open, onConfirm, onCancel }
}

describe('AlertDialog', () => {
  it('focuses Cancel first for destructive actions and confirms', async () => {
    const user = userEvent.setup()
    const { Harness, open, onConfirm, onCancel } = setup({
      title: 'Delete note?',
      message: 'This cannot be undone.',
      confirmLabel: 'Delete',
      tone: 'danger',
    })
    const { container } = render(Harness)
    const dialog = await screen.findByRole('alertdialog', { name: 'Delete note?' })
    expect(dialog).toHaveAccessibleDescription('This cannot be undone.')
    await vi.waitFor(() => expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus())
    await expectNoA11yViolations(container)

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(open.value).toBe(false)
    expect(onConfirm).toHaveBeenCalledOnce()
    await vi.waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('focuses the confirm action for non-destructive questions and cancels with Escape', async () => {
    const user = userEvent.setup()
    const { Harness, onConfirm, onCancel } = setup({ title: 'Publish?' })
    render(Harness)
    await vi.waitFor(() => expect(screen.getByRole('button', { name: 'Confirm' })).toHaveFocus())
    await user.keyboard('{Escape}')
    expect(onCancel).toHaveBeenCalledOnce()
    expect(onConfirm).not.toHaveBeenCalled()
  })
})
