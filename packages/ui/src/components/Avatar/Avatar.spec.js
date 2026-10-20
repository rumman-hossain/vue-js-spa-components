import { fireEvent, render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { expectNoA11yViolations } from '../../../tests/a11y.js'
import Avatar from './Avatar.vue'
import { AVATAR_TINTS, getInitials, hashToIndex } from './avatar.js'

describe('getInitials', () => {
  it('takes the first letters of the first and last words', () => {
    expect(getInitials('Ada Lovelace')).toBe('AL')
    expect(getInitials('  grace  brewster murray hopper ')).toBe('GH')
    expect(getInitials('Plato')).toBe('P')
    expect(getInitials('山田 太郎')).toBe('山太')
    expect(getInitials('')).toBe('')
  })

  it('does not split characters made of several code points', () => {
    expect(getInitials('Émile Zola')).toBe('ÉZ')
    expect(getInitials('👩‍💻 Dev')).toBe('👩‍💻D')
  })
})

describe('hashToIndex', () => {
  it('is deterministic and within range', () => {
    expect(hashToIndex('Ada', 5)).toBe(hashToIndex('Ada', 5))
    for (const name of ['a', 'b', 'Ada Lovelace', '山田']) {
      const index = hashToIndex(name, AVATAR_TINTS.length)
      expect(index).toBeGreaterThanOrEqual(0)
      expect(index).toBeLessThan(AVATAR_TINTS.length)
    }
  })
})

describe('Avatar', () => {
  it('shows initials as an image named after the person', async () => {
    const { container } = render(Avatar, { props: { name: 'Ada Lovelace', size: 'lg' } })
    const avatar = screen.getByRole('img', { name: 'Ada Lovelace' })
    expect(avatar).toHaveTextContent('AL')
    await expectNoA11yViolations(container)
  })

  it('shows the photo with the name as alt text and falls back to initials on error', async () => {
    const { container, rerender } = render(Avatar, {
      props: { name: 'Ada Lovelace', src: '/ada.jpg' },
    })
    const photo = screen.getByRole('img', { name: 'Ada Lovelace' })
    expect(photo).toHaveAttribute('src', '/ada.jpg')
    await expectNoA11yViolations(container)

    await fireEvent.error(photo)
    expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toHaveTextContent('AL')

    await rerender({ src: '/ada-2.jpg' })
    expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toHaveAttribute('src', '/ada-2.jpg')
  })
})
