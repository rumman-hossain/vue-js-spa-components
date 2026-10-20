import { setupWorker } from 'msw/browser'
import { handlers } from './handlers.js'

export async function startMockApi() {
  const worker = setupWorker(...handlers)
  await worker.start({
    serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
    onUnhandledFrame: 'bypass',
    quiet: true,
  })
}
