import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { defineComponent, ref } from 'vue'
import { useFocusTrap } from './useFocusTrap.js'

const Harness = defineComponent({
  setup() {
    const panel = ref(null)
    const open = ref(false)
    useFocusTrap(panel, open)
    return { panel, open }
  },
  template: `
    <button @click="open = true">Open</button>
    <div v-if="open" ref="panel" tabindex="-1">
      <button>First</button>
      <input aria-label="Middle" />
      <button disabled>Skipped</button>
      <button @click="open = false">Last</button>
    </div>
    <button>Outside</button>
  `,
})

describe('useFocusTrap', () => {
  it('moves focus into the container when activated', async () => {
    const user = userEvent.setup()
    render(Harness)
    await user.click(screen.getByRole('button', { name: 'Open' }))
    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus()
  })

  it('wraps Tab and Shift+Tab inside the container', async () => {
    const user = userEvent.setup()
    render(Harness)
    await user.click(screen.getByRole('button', { name: 'Open' }))

    await user.tab()
    expect(screen.getByRole('textbox', { name: 'Middle' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Last' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus()
    await user.tab({ shift: true })
    expect(screen.getByRole('button', { name: 'Last' })).toHaveFocus()
  })

  it('returns focus to the trigger when deactivated', async () => {
    const user = userEvent.setup()
    render(Harness)
    const trigger = screen.getByRole('button', { name: 'Open' })
    await user.click(trigger)
    await user.click(screen.getByRole('button', { name: 'Last' }))
    expect(trigger).toHaveFocus()
  })
})
