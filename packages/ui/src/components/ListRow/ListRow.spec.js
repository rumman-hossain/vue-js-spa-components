import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import { expectNoA11yViolations } from '../../../tests/a11y.js'
import ListRow from './ListRow.vue'

/** Renders rows inside a list so the markup is valid. @param {any} options */
function renderRow(options) {
  const List = () => h('ul', [h(ListRow, options.props, options.slots)])
  return render(List, options.global ? { global: options.global } : {})
}

describe('ListRow', () => {
  it('renders static content with title, subtitle and value', async () => {
    const { container } = renderRow({
      props: { title: 'Storage', subtitle: 'Photos excluded', value: '42 GB' },
    })
    const item = screen.getByRole('listitem')
    expect(item).toHaveTextContent('Storage')
    expect(item).toHaveTextContent('42 GB')
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    await expectNoA11yViolations(container)
  })

  it('becomes a link when given href', async () => {
    const { container } = renderRow({ props: { title: 'Privacy', href: '/privacy' } })
    expect(screen.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy')
    await expectNoA11yViolations(container)
  })

  it('becomes a button when it has a click listener and works with the keyboard', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    renderRow({ props: { title: 'Sign out', onClick } })
    const button = screen.getByRole('button', { name: 'Sign out' })
    await user.tab()
    expect(button).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('disables an interactive row', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    renderRow({ props: { title: 'Sign out', disabled: true, onClick } })
    await user.click(screen.getByRole('button', { name: 'Sign out' }))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('uses a registered RouterLink for `to`', () => {
    /**
     * @param {{ to: string }} props
     * @param {import('vue').SetupContext} context
     */
    const RouterLink = (props, { slots }) => h('a', { href: `#${props.to}` }, slots.default?.())
    renderRow({
      props: { title: 'Profile', to: '/profile' },
      global: { components: { RouterLink } },
    })
    expect(screen.getByRole('link', { name: 'Profile' })).toHaveAttribute('href', '#/profile')
  })

  it('falls back to a plain link for a string `to` without a router', () => {
    renderRow({ props: { title: 'Profile', to: '/profile' } })
    expect(screen.getByRole('link', { name: 'Profile' })).toHaveAttribute('href', '/profile')
  })

  it('renders leading, trailing and custom default content', () => {
    renderRow({
      props: {},
      slots: {
        leading: () => h('span', { 'data-testid': 'leading' }),
        default: () => 'Custom',
        trailing: () => h('span', 'Badge'),
      },
    })
    expect(screen.getByTestId('leading')).toBeInTheDocument()
    expect(screen.getByRole('listitem')).toHaveTextContent('CustomBadge')
  })
})
