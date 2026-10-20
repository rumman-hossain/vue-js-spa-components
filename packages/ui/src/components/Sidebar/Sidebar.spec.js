/* eslint-disable vue/one-component-per-file -- small test harness components, one per scenario */
import { render, screen, within } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, markRaw } from 'vue'
import { expectNoA11yViolations } from '../../../tests/a11y.js'
import Sidebar from './Sidebar.vue'

const Icon = markRaw(defineComponent({ setup: () => () => h('svg', { 'data-testid': 'icon' }) }))

const sections = [
  {
    id: 'mail',
    heading: 'Mail',
    items: [
      { id: 'inbox', label: 'Inbox', icon: Icon, badge: 3, to: '/inbox' },
      { id: 'sent', label: 'Sent', href: '/sent' },
    ],
  },
  { id: 'more', items: [{ id: 'settings', label: 'Settings', to: { name: 'settings' } }] },
]

/** Stands in for vue-router's RouterLink, which marks the exact-active link itself. */
const RouterLink = defineComponent({
  props: { to: { type: [String, Object], required: true } },
  setup(props, { slots }) {
    return () => {
      const path = typeof props.to === 'string' ? props.to : `/${String(props.to.name)}`
      return h(
        'a',
        { href: path, 'aria-current': path === '/inbox' ? 'page' : undefined },
        slots.default?.(),
      )
    }
  },
})

describe('Sidebar', () => {
  it('is a named navigation with headed sections, icons and badges', async () => {
    const { container } = render(Sidebar, { props: { label: 'Main', sections, activeId: 'sent' } })
    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(within(nav).getByRole('heading', { level: 2, name: 'Mail' })).toBeInTheDocument()
    expect(within(nav).getByRole('list', { name: 'Mail' })).toBeInTheDocument()
    expect(within(nav).getAllByRole('list')).toHaveLength(2)
    expect(screen.getByRole('link', { name: 'Inbox 3' })).toHaveAttribute('href', '/inbox')
    expect(screen.getByTestId('icon').parentElement).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByRole('link', { name: 'Sent' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Inbox 3' })).not.toHaveAttribute('aria-current')
    // An object location without a router has nowhere to go.
    expect(screen.getByText('Settings').closest('a')).not.toHaveAttribute('href')
    await expectNoA11yViolations(container)
  })

  it('renders RouterLinks when the app registers one and leaves aria-current to the router', () => {
    render(Sidebar, {
      props: { label: 'Main', sections, headingLevel: 3 },
      global: { components: { RouterLink } },
    })
    expect(screen.getByRole('heading', { level: 3, name: 'Mail' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Inbox 3' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute('href', '/settings')
    expect(screen.getByRole('link', { name: 'Sent' })).toHaveAttribute('href', '/sent')
  })

  it('overrides the router when activeId is given', () => {
    render(Sidebar, {
      props: { label: 'Main', sections, activeId: 'settings' },
      global: { components: { RouterLink } },
    })
    expect(screen.getByRole('link', { name: 'Inbox 3' })).not.toHaveAttribute('aria-current')
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute('aria-current', 'page')
  })
})
