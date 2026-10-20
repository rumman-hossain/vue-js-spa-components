import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { expectNoA11yViolations } from '../../../tests/a11y.js'
import Popover from './Popover.vue'

function renderPopover(props = {}) {
  return render({
    components: { Popover },
    setup: () => ({ props }),
    template: `
      <Popover label="Filters" v-bind="props">
        <template #icon><svg /></template>
        <template #default="{ close }">
          <label>Only unread <input type="checkbox" /></label>
          <button type="button" @click="close()">Apply</button>
        </template>
      </Popover>
      <button type="button">Elsewhere</button>
    `,
  })
}

describe('Popover', () => {
  it('discloses its panel with aria-expanded and aria-controls', async () => {
    const user = userEvent.setup()
    const { container } = renderPopover()
    const trigger = screen.getByRole('button', { name: 'Filters' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    const panel = /** @type {HTMLElement} */ (
      document.getElementById(/** @type {string} */ (trigger.getAttribute('aria-controls')))
    )
    expect(panel).not.toBeVisible()

    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(panel).toBeVisible()
    await expectNoA11yViolations(container)

    await user.click(trigger)
    expect(panel).not.toBeVisible()
  })

  it('closes with Escape from inside and returns focus to the trigger', async () => {
    const user = userEvent.setup()
    renderPopover({ align: 'end' })
    const trigger = screen.getByRole('button', { name: 'Filters' })
    await user.click(trigger)
    await user.click(screen.getByRole('checkbox', { name: 'Only unread' }))
    await user.keyboard('{Escape}')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveFocus()
    // Escape while closed does nothing.
    await user.keyboard('{Escape}')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes on an outside press and through the slot close function', async () => {
    const user = userEvent.setup()
    renderPopover({ labelHidden: true })
    const trigger = screen.getByRole('button', { name: 'Filters' })
    await user.click(trigger)
    await user.click(screen.getByRole('checkbox'))
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await user.click(screen.getByRole('button', { name: 'Elsewhere' }))
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await user.click(trigger)
    await user.click(screen.getByRole('button', { name: 'Apply' }))
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })
})
