import { test, expect } from '@playwright/test'
import { signIn, clearSession } from './helpers/auth'

// Sidebar nav links (desktop, Sidebar.tsx) and bottom tab links (mobile, BottomNav.tsx):
// "Journal"   → /journal
// "Analytics" → /analytics
// "History"   → /history

test.describe('navigation', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  test.afterEach(async ({ page }) => {
    await clearSession(page)
  })

  test('sidebar shows brand name and all nav links', async ({ page }) => {
    await expect(page.getByText('Health Journal AI').first()).toBeVisible()
    await expect(page.getByRole('link', { name: 'Journal' }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: 'Analytics' }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: 'History' }).first()).toBeVisible()
  })

  test('Analytics link navigates to /analytics', async ({ page }) => {
    await page.getByRole('link', { name: 'Analytics' }).first().click()
    await expect(page).toHaveURL(/\/analytics/)
    await expect(page.getByRole('heading', { name: 'Analytics' })).toBeVisible()
  })

  test('History link navigates to /history', async ({ page }) => {
    await page.getByRole('link', { name: 'History' }).first().click()
    await expect(page).toHaveURL(/\/history/)
  })

  test('Journal link navigates to /journal', async ({ page }) => {
    await page.goto('/analytics')
    await page.getByRole('link', { name: 'Journal' }).first().click()
    await expect(page).toHaveURL(/\/journal/)
    await expect(page.getByText(/Good (morning|afternoon|evening)/)).toBeVisible()
  })
})
