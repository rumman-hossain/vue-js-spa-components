import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { expectNoA11yViolations } from '../../../tests/a11y.js'
import SkipLink from './SkipLink.vue'

function renderPage(target = 'main') {
  return render({
    components: { SkipLink },
    setup: () => ({ target }),
    template: `
      <SkipLink :target="target" />
      <nav aria-label="Site"><a href="/a">A</a></nav>
      <main id="main"><h1>Page</h1></main>
    `,
  })
}

describe('SkipLink', () => {
  it('is the first tab stop and moves focus to the main content', async () => {
    const user = userEvent.setup()
    const { container } = renderPage()
    await user.tab()
    const link = screen.getByRole('link', { name: 'Skip to main content' })
    expect(link).toHaveFocus()
    expect(link).toHaveAttribute('href', '#main')
    expect(link).toHaveClass('focus:translate-y-0')
    await expectNoA11yViolations(container)

    await user.keyboard('{Enter}')
    const main = screen.getByRole('main')
    expect(main).toHaveAttribute('tabindex', '-1')
    expect(main).toHaveFocus()
  })

  it('does nothing when the target is missing', async () => {
    const user = userEvent.setup()
    renderPage('nowhere')
    await user.click(screen.getByRole('link', { name: 'Skip to main content' }))
    expect(screen.getByRole('main')).not.toHaveAttribute('tabindex')
  })
})
