import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/vue'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { resetDb } from '@/mocks/db.js'
import { lab } from '@/mocks/lab.js'
import { server } from '@/mocks/node.js'
import { session } from '@/api/session.js'

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
  resetDb()
  lab.reset()
  session.clear()
})
afterAll(() => server.close())
