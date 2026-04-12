import { Page } from '@playwright/test'
import { clerk, setupClerkTestingToken } from '@clerk/testing/playwright'

export const TEST_EMAIL =
  process.env.TEST_USER_EMAIL ?? 'playwright@journalai-e2e.dev'

/**
 * Sign in using @clerk/testing — bypasses the Clerk UI entirely.
 * Uses CLERK_SECRET_KEY to create a session directly by email.
 * Requires clerkSetup() in global-setup.
 */
export async function signIn(page: Page) {
  await setupClerkTestingToken({ page })

  await page.goto('/')
  await clerk.signIn({
    page,
    emailAddress: TEST_EMAIL,
  })

  await page.goto('/journal')
  await page.waitForURL('**/journal**', { timeout: 15_000 })
}

export async function signOut(page: Page) {
  await clerk.signOut({ page })
}

export async function clearSession(page: Page) {
  await page.context().clearCookies()
}
