/* eslint-disable vue/one-component-per-file -- small test harness components, one per scenario */
import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { expectNoA11yViolations } from '../../../tests/a11y.js'
import { useConfirm } from '../../composables/useConfirm.js'
import ConfirmProvider from './ConfirmProvider.vue'

/** @type {Promise<boolean>[]} */
let answers = []

const Asker = defineComponent({
  setup() {
    const confirm = useConfirm()
    answers = []
    /** @param {import('../../composables/useConfirm.js').ConfirmOptions} options */
    const ask = (options) => answers.push(confirm(options))
    return () => [
      h(
        'button',
        {
          type: 'button',
          onClick: () =>
            ask({
              title: 'Delete project?',
              message: 'All files are removed.',
              confirmLabel: 'Delete',
              cancelLabel: 'Keep',
              tone: 'danger',
            }),
        },
        'Delete project',
      ),
      h('button', { type: 'button', onClick: () => ask({ title: 'Archive?' }) }, 'Archive'),
    ]
  },
})

function renderProvider() {
  return render(ConfirmProvider, { slots: { default: () => h(Asker) } })
}

describe('ConfirmProvider and useConfirm', () => {
  it('resolves true when confirmed and returns focus to the opener', async () => {
    const user = userEvent.setup()
    const { container } = renderProvider()
    const opener = screen.getByRole('button', { name: 'Delete project' })
    await user.click(opener)
    expect(screen.getByRole('alertdialog', { name: 'Delete project?' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Keep' })).toHaveFocus()
    await expectNoA11yViolations(container)

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await expect(answers[0]).resolves.toBe(true)
    await vi.waitFor(() => expect(opener).toHaveFocus())
  })

  it('resolves false on cancel and on Escape', async () => {
    const user = userEvent.setup()
    renderProvider()
    await user.click(screen.getByRole('button', { name: 'Delete project' }))
    await user.click(screen.getByRole('button', { name: 'Keep' }))
    await expect(answers[0]).resolves.toBe(false)

    await user.click(screen.getByRole('button', { name: 'Archive' }))
    expect(screen.getByRole('button', { name: 'Confirm' })).toHaveFocus()
    await user.keyboard('{Escape}')
    await expect(answers[1]).resolves.toBe(false)
  })

  it('answers a replaced question with false and a new question after confirm', async () => {
    const user = userEvent.setup()
    renderProvider()
    await user.click(screen.getByRole('button', { name: 'Delete project' }))
    // A second request while the first is open replaces it.
    await user.click(screen.getByRole('button', { name: 'Archive', hidden: true }))
    await expect(answers[0]).resolves.toBe(false)
    await user.click(screen.getByRole('button', { name: 'Confirm' }))
    await expect(answers[1]).resolves.toBe(true)
  })

  it('throws a clear error without a provider', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const Orphan = defineComponent({
      setup() {
        useConfirm()
        return () => null
      },
    })
    expect(() => render(Orphan)).toThrow(/ConfirmProvider/)
    spy.mockRestore()
  })
})
