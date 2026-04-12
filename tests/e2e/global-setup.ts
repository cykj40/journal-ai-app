import { clerkSetup } from '@clerk/testing/playwright'
import { FullConfig } from '@playwright/test'

async function globalSetup(_config: FullConfig) {
  console.log('[global-setup] configuring Clerk testing token')
  await clerkSetup()
  console.log('[global-setup] ready')
}

export default globalSetup
