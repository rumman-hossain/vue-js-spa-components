import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { expectNoA11yViolations } from '../../../tests/a11y.js'
import Spinner from './Spinner.vue'

describe('Spinner', () => {
  it('is a status with a default label', async () => {
    const { container } = render(Spinner)
    expect(screen.getByRole('status')).toHaveTextContent('Loading')
    await expectNoA11yViolations(container)
  })

  it('accepts a custom label and size', () => {
    render(Spinner, { props: { label: 'Saving', size: 'lg' } })
    expect(screen.getByRole('status')).toHaveTextContent('Saving')
  })
})
