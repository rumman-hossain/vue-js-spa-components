import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import { expectNoA11yViolations } from '../../../tests/a11y.js'
import Sheet from './Sheet.vue'

describe('Sheet', () => {
  it('is a modal dialog with slots and closes like one', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const open = ref(false)
    const Harness = defineComponent({
      components: { Sheet },
      setup: () => ({ open, onClose }),
      template: `
        <button type="button" @click="open = true">Share</button>
        <Sheet v-model:open="open" title="Share" description="Pick a destination." @close="onClose">
          <p>Body</p>
          <template #footer><button type="button">Copy link</button></template>
        </Sheet>
      `,
    })
    const { container } = render(Harness)
    const opener = screen.getByRole('button', { name: 'Share' })
    await user.click(opener)
    const dialog = screen.getByRole('dialog', { name: 'Share' })
    expect(dialog).toHaveAccessibleDescription('Pick a destination.')
    expect(screen.getByRole('button', { name: 'Copy link' })).toBeInTheDocument()
    await expectNoA11yViolations(container)

    await user.keyboard('{Escape}')
    expect(open.value).toBe(false)
    expect(onClose).toHaveBeenCalledOnce()
    expect(opener).toHaveFocus()
  })
})
