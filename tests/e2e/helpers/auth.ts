import { Page } from '@playwright/test'

export const TEST_EMAIL = process.env.TEST_USER_EMAIL ?? 'playwright@journalai.test'
export const TEST_PASSWORD = process.env.TEST_USER_PASSWORD ?? 'TestPassword123!'

/**
 * Sign in via Clerk's multi-step embedded sign-in form.
 * Step 1: submit email → click Continue
 * Step 2: submit password → click Continue/Sign in
 */
export async function signIn(page: Page) {
  await page.goto('/sign-in')

  // Step 1: email identifier
  const emailInput = page.locator('input[name="identifier"], input[type="email"]').first()
  await emailInput.waitFor({ timeout: 10_000 })
  await emailInput.fill(TEST_EMAIL)
  await page.getByRole('button', { name: /continue/i }).first().click()

  // Step 2: password
  const passwordInput = page.locator('input[type="password"]').first()
  await passwordInput.waitFor({ timeout: 10_000 })
  await passwordInput.fill(TEST_PASSWORD)
  await page.getByRole('button', { name: /continue|sign in/i }).first().click()

  // Wait for redirect to dashboard
  await page.waitForURL('**/journal**', { timeout: 15_000 })
}

export async function signOut(page: Page) {
  // Clerk UserButton is a button in the header
  const userButton = page
    .locator('[data-testid="user-button"], .cl-userButtonTrigger, [aria-label*="Open user button"]')
    .first()
  if (await userButton.isVisible()) {
    await userButton.click()
    const signOutBtn = page.getByText(/sign out/i)
    if (await signOutBtn.isVisible({ timeout: 3_000 })) {
      await signOutBtn.click()
      await page.waitForURL('**/', { timeout: 10_000 })
    }
  }
}

export async function clearSession(page: Page) {
  await page.context().clearCookies()
}
