import { deleteTestEntries } from './helpers/db'

async function globalTeardown() {
  console.log('[global-teardown] cleaning up test data...')
  try {
    await deleteTestEntries()
  } catch (err) {
    console.error('[global-teardown] db cleanup error (non-fatal):', err)
  }
  console.log('[global-teardown] done')
}

export default globalTeardown
