import { FullConfig } from '@playwright/test'

async function globalSetup(_config: FullConfig) {
  console.log('[global-setup] Better Auth test setup ready')
}

export default globalSetup
