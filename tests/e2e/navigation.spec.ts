import { test, expect } from '@playwright/test'
import { signIn, clearSession } from './helpers/auth'

// Nav links from app/(dashboard)/layout.tsx:
// "Current Month" → /journal
// "Analytics"     → /analytics
// "Past Entries"  → /archive
// "History"       → /history

test.describe('navigation', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  test.afterEach(async ({ page }) => {
    await clearSession(page)
  })

  test('sidebar shows brand name and all nav links', async ({ page }) => {
    await expect(page.getByText('Health Journal AI')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Current Month' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Analytics' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Past Entries' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'History' })).toBeVisible()
  })

  test('Analytics link navigates to /analytics', async ({ page }) => {
    await page.getByRole('link', { name: 'Analytics' }).click()
    await expect(page).toHaveURL(/\/analytics/)
    await expect(page.getByText('Journal Analytics')).toBeVisible()
  })

  test('Past Entries link navigates to /archive', async ({ page }) => {
    await page.getByRole('link', { name: 'Past Entries' }).click()
    await expect(page).toHaveURL(/\/archive/)
    await expect(page.getByText('Past Entries')).toBeVisible()
  })

  test('History link navigates to /history', async ({ page }) => {
    await page.getByRole('link', { name: 'History' }).click()
    await expect(page).toHaveURL(/\/history/)
  })

  test('Current Month link navigates to /journal', async ({ page }) => {
    // Navigate away first, then come back
    await page.goto('/analytics')
    await page.getByRole('link', { name: 'Current Month' }).click()
    await expect(page).toHaveURL(/\/journal/)
    await expect(page.getByText('Journals')).toBeVisible()
  })
})
