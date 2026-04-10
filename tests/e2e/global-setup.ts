import { FullConfig } from '@playwright/test'

async function globalSetup(_config: FullConfig) {
  console.log('[global-setup] starting test run')
}

export default globalSetup
