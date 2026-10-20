import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/vue'
import { afterEach } from 'vitest'

// Some specs (design tokens) run in the node environment, where there is no DOM to clean up.
if (typeof document !== 'undefined') {
  afterEach(() => {
    cleanup()
    document.documentElement.className = ''
  })
}
