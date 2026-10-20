import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { expectNoA11yViolations } from '../../../tests/a11y.js'
import Badge from './Badge.vue'

describe('Badge', () => {
  it.each(/** @type {const} */ (['neutral', 'accent', 'success', 'warning', 'danger']))(
    'renders the %s tone',
    async (tone) => {
      const { container } = render(Badge, { props: { tone }, slots: { default: 'New' } })
      expect(screen.getByText('New')).toBeInTheDocument()
      await expectNoA11yViolations(container)
    },
  )
})
