import { test, expect } from '@playwright/test'
import { signIn, clearSession } from './helpers/auth'

test.describe('analytics page', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page)
    await page.goto('/analytics')
  })

  test.afterEach(async ({ page }) => {
    await clearSession(page)
  })

  test('analytics page renders heading and subtitle', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Analytics' })).toBeVisible()
    await expect(page.getByText('Insights and patterns from your journaling')).toBeVisible()
  })

  test('date range filter buttons are visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: '7 Days' })).toBeVisible()
    await expect(page.getByRole('button', { name: '30 Days' })).toBeVisible()
    await expect(page.getByRole('button', { name: '90 Days' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Custom' })).toBeVisible()
  })

  test('summary section is visible with stat labels', async ({ page }) => {
    await expect(page.getByText('Summary')).toBeVisible()
    await expect(page.getByText('Total Entries')).toBeVisible()
    await expect(page.getByText('Average Sentiment')).toBeVisible()
    await expect(page.getByText('Most Common Mood')).toBeVisible()
  })

  test('Export Data button opens export modal', async ({ page }) => {
    await page.getByRole('button', { name: 'Export Data' }).click()
    await expect(page.getByText('Export Options')).toBeVisible()
    await expect(page.getByText('Export Format')).toBeVisible()
  })

  test('export modal closes on cancel', async ({ page }) => {
    await page.getByRole('button', { name: 'Export Data' }).click()
    await expect(page.getByText('Export Options')).toBeVisible()
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByText('Export Options')).not.toBeVisible()
  })

  test('Custom date range button shows date inputs', async ({ page }) => {
    await page.getByRole('button', { name: 'Custom' }).click()
    await expect(page.locator('input[type="date"]').first()).toBeVisible()
  })
})
