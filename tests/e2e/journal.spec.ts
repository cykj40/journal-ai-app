import { test, expect } from '@playwright/test'
import { signIn, clearSession } from './helpers/auth'

test.describe('journal CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  test.afterEach(async ({ page }) => {
    await clearSession(page)
  })

  test('journal page renders greeting and FAB button', async ({ page }) => {
    await expect(page.getByText(/Good (morning|afternoon|evening)/)).toBeVisible()
    await expect(page.locator('button[title="New entry"]')).toBeVisible()
  })

  test('clicking FAB creates an entry and navigates to editor', async ({ page }) => {
    await page.locator('button[title="New entry"]').click()
    // URL becomes /journal/<uuid>?new=true
    await expect(page).toHaveURL(/\/journal\/[0-9a-f-]+/, { timeout: 10_000 })
    // ProseMirror editor should be visible
    await expect(page.locator('.ProseMirror')).toBeVisible()
  })

  test('editor shows "Saved" status indicator', async ({ page }) => {
    await page.locator('button[title="New entry"]').click()
    await expect(page).toHaveURL(/\/journal\/[0-9a-f-]+/, { timeout: 10_000 })
    // Default state is "Saved" (isSaving = false)
    await expect(page.getByText('Saved')).toBeVisible()
  })

  test('editor autosaves after typing', async ({ page }) => {
    await page.locator('button[title="New entry"]').click()
    await expect(page).toHaveURL(/\/journal\/[0-9a-f-]+/, { timeout: 10_000 })

    const editor = page.locator('.ProseMirror')
    await editor.click()
    await editor.type('Playwright autosave test entry')

    // Autosave fires after 2s interval; wait for "Saving..." then "Saved"
    await expect(page.getByText('Saved')).toBeVisible({ timeout: 8_000 })
  })

  test('entry card appears on journal page after creation', async ({ page }) => {
    await page.locator('button[title="New entry"]').click()
    await expect(page).toHaveURL(/\/journal\/[0-9a-f-]+/, { timeout: 10_000 })

    const editor = page.locator('.ProseMirror')
    await editor.click()
    await editor.type('Test entry for card visibility')
    await expect(page.getByText('Saved')).toBeVisible({ timeout: 8_000 })

    await page.goto('/journal')
    // A card with today's date should appear (shortDate format: "Apr 12")
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    await expect(page.getByText(today)).toBeVisible({ timeout: 5_000 })
  })

  test('delete entry removes it from the list', async ({ page }) => {
    // Create an entry first
    await page.locator('button[title="New entry"]').click()
    await expect(page).toHaveURL(/\/journal\/[0-9a-f-]+/, { timeout: 10_000 })

    const editor = page.locator('.ProseMirror')
    await editor.click()
    await editor.type('Entry to be deleted')
    await expect(page.getByText('Saved')).toBeVisible({ timeout: 8_000 })

    await page.goto('/journal')

    // Delete button has title="Delete entry" (always visible on mobile,
    // hover-only on desktop — hover the card first to be safe)
    const card = page.locator('.group').first()
    await card.hover()

    // Accept the confirm() dialog
    page.on('dialog', (dialog) => dialog.accept())
    await card.locator('[title="Delete entry"]').click()

    // Card should disappear
    await expect(card).not.toBeVisible({ timeout: 5_000 })
  })
})
