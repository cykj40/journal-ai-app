import { test, expect } from '@playwright/test'
import { signIn, clearSession } from './helpers/auth'

test.describe('journal CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  test.afterEach(async ({ page }) => {
    await clearSession(page)
  })

  test('journal page renders heading and New Entry card', async ({ page }) => {
    await expect(page.getByText('Journals')).toBeVisible()
    await expect(page.getByText('New Entry')).toBeVisible()
  })

  test('clicking New Entry creates an entry and navigates to editor', async ({ page }) => {
    await page.getByText('New Entry').click()
    // URL becomes /journal/<uuid>?new=true
    await expect(page).toHaveURL(/\/journal\/[0-9a-f-]+/, { timeout: 10_000 })
    // ProseMirror editor should be visible
    await expect(page.locator('.ProseMirror')).toBeVisible()
  })

  test('editor shows "Saved" status indicator', async ({ page }) => {
    await page.getByText('New Entry').click()
    await expect(page).toHaveURL(/\/journal\/[0-9a-f-]+/, { timeout: 10_000 })
    // Default state is "Saved" (isSaving = false)
    await expect(page.getByText('Saved')).toBeVisible()
  })

  test('editor autosaves after typing', async ({ page }) => {
    await page.getByText('New Entry').click()
    await expect(page).toHaveURL(/\/journal\/[0-9a-f-]+/, { timeout: 10_000 })

    const editor = page.locator('.ProseMirror')
    await editor.click()
    await editor.type('Playwright autosave test entry')

    // Autosave fires after 2s interval; wait for "Saving..." then "Saved"
    await expect(page.getByText('Saved')).toBeVisible({ timeout: 8_000 })
  })

  test('entry card appears on journal page after creation', async ({ page }) => {
    await page.getByText('New Entry').click()
    await expect(page).toHaveURL(/\/journal\/[0-9a-f-]+/, { timeout: 10_000 })

    const editor = page.locator('.ProseMirror')
    await editor.click()
    await editor.type('Test entry for card visibility')
    await expect(page.getByText('Saved')).toBeVisible({ timeout: 8_000 })

    await page.goto('/journal')
    // Today's date should appear on an entry card
    const today = new Date().toDateString()
    await expect(page.getByText(today)).toBeVisible({ timeout: 5_000 })
  })

  test('delete entry removes it from the list', async ({ page }) => {
    // Create an entry first
    await page.getByText('New Entry').click()
    await expect(page).toHaveURL(/\/journal\/[0-9a-f-]+/, { timeout: 10_000 })

    const editor = page.locator('.ProseMirror')
    await editor.click()
    await editor.type('Entry to be deleted')
    await expect(page.getByText('Saved')).toBeVisible({ timeout: 8_000 })

    await page.goto('/journal')

    // The delete button is hidden until hover (opacity-0 group-hover:opacity-100)
    const card = page.locator('.group').first()
    await card.hover()

    // Accept the confirm() dialog
    page.on('dialog', (dialog) => dialog.accept())
    await card.getByText('Delete').click()

    // Card should disappear
    await expect(card).not.toBeVisible({ timeout: 5_000 })
  })
})
