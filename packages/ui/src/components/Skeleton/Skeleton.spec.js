import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { expectNoA11yViolations } from '../../../tests/a11y.js'
import Skeleton from './Skeleton.vue'

describe('Skeleton', () => {
  it.each(/** @type {const} */ (['text', 'rect', 'circle']))(
    'renders a hidden %s placeholder',
    async (shape) => {
      const { container } = render(Skeleton, { props: { shape } })
      expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
      expect(container).toHaveAccessibleName('')
      await expectNoA11yViolations(container)
    },
  )
})
