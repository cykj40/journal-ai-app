import { test, expect } from '@playwright/test'
import { signIn, signOut, clearSession } from './helpers/auth'

test.describe('authentication', () => {
  test.afterEach(async ({ page }) => {
    await clearSession(page)
  })

  test('unauthenticated user is redirected from /journal to sign-in', async ({ page }) => {
    await page.goto('/journal')
    await expect(page).toHaveURL(/sign-in/)
  })

  test('sign-in with valid credentials redirects to /journal', async ({ page }) => {
    await signIn(page)
    await expect(page).toHaveURL(/journal/)
    await expect(page.getByText('Journals')).toBeVisible()
  })

  test('sign-out clears session and redirects away from dashboard', async ({ page }) => {
    await signIn(page)
    await signOut(page)
    await expect(page).not.toHaveURL(/\/journal/)
  })
})
