import { Page } from '@playwright/test'

export const TEST_EMAIL =
  process.env.TEST_USER_EMAIL ?? 'playwright@journalai-e2e.dev'
export const TEST_PASSWORD =
  process.env.TEST_USER_PASSWORD ?? 'PlaywrightPassword123!'
export const TEST_NAME = 'Playwright Test User'

export async function signIn(page: Page) {
  await page.goto('/sign-in')
  await page.getByLabel('Email').fill(TEST_EMAIL)
  await page.getByLabel('Password').fill(TEST_PASSWORD)
  await page.getByRole('button', { name: /^sign in$/i }).click()

  try {
    await page.waitForURL('**/journal**', { timeout: 10_000 })
    return
  } catch (_error) {
    await page.goto('/sign-up')
    await page.getByLabel('Name').fill(TEST_NAME)
    await page.getByLabel('Email').fill(TEST_EMAIL)
    await page.getByLabel('Password').fill(TEST_PASSWORD)
    await page.getByLabel('Confirm password').fill(TEST_PASSWORD)
    await page.getByRole('button', { name: /create account/i }).click()
    await page.waitForURL(/\/(new-user|journal)/, { timeout: 15_000 })
    await page.waitForURL('**/journal**', { timeout: 15_000 })
  }
}

export async function signOut(page: Page) {
  await page.getByRole('button', { name: /sign out/i }).first().click()
  await page.waitForURL(/\/(sign-in|$)/, { timeout: 15_000 })
}

export async function clearSession(page: Page) {
  await page.context().clearCookies()
}
