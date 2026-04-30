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
    await expect(page).toHaveURL(/\/journal\/[0-9a-f-]+/, { timeout: 10_000 })
    await expect(page.locator('.ProseMirror')).toBeVisible()
  })

  test('editor shows Save and Delete buttons', async ({ page }) => {
    await page.locator('button[title="New entry"]').click()
    await expect(page).toHaveURL(/\/journal\/[0-9a-f-]+/, { timeout: 10_000 })
    await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Delete', exact: true })).toBeVisible()
  })

  test('editor shows disabled Dictate button', async ({ page }) => {
    await page.locator('button[title="New entry"]').click()
    await expect(page).toHaveURL(/\/journal\/[0-9a-f-]+/, { timeout: 10_000 })
    const dictateBtn = page.getByRole('button', { name: /Dictate/i })
    await expect(dictateBtn).toBeVisible()
    await expect(dictateBtn).toBeDisabled()
  })

  test('editor shows back navigation link', async ({ page }) => {
    await page.locator('button[title="New entry"]').click()
    await expect(page).toHaveURL(/\/journal\/[0-9a-f-]+/, { timeout: 10_000 })
    await expect(page.getByRole('link', { name: /← Journal/i })).toBeVisible()
  })

  test('Save button persists content and shows saved confirmation', async ({ page }) => {
    await page.locator('button[title="New entry"]').click()
    await expect(page).toHaveURL(/\/journal\/[0-9a-f-]+/, { timeout: 10_000 })

    const editor = page.locator('.ProseMirror')
    await editor.click()
    await editor.type('Playwright save test entry')

    await page.getByRole('button', { name: 'Save', exact: true }).click()
    await expect(page.getByText(/✓ Saved|Saved/)).toBeVisible({ timeout: 8_000 })
  })

  test('entry card appears on journal page after saving', async ({ page }) => {
    await page.locator('button[title="New entry"]').click()
    await expect(page).toHaveURL(/\/journal\/[0-9a-f-]+/, { timeout: 10_000 })

    const editor = page.locator('.ProseMirror')
    await editor.click()
    await editor.type('Test entry for card visibility')

    await page.getByRole('button', { name: 'Save', exact: true }).click()
    await expect(page.getByText(/✓ Saved|Saved/)).toBeVisible({ timeout: 8_000 })

    await page.goto('/journal')
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    await expect(page.getByText(today).first()).toBeVisible({ timeout: 5_000 })
  })

  test('back link navigates to journal list', async ({ page }) => {
    await page.locator('button[title="New entry"]').click()
    await expect(page).toHaveURL(/\/journal\/[0-9a-f-]+/, { timeout: 10_000 })
    await page.getByRole('link', { name: /← Journal/i }).click()
    await expect(page).toHaveURL(/\/journal$/, { timeout: 5_000 })
    await expect(page.getByText(/Good (morning|afternoon|evening)/)).toBeVisible()
  })

  test('Cmd+S keyboard shortcut saves entry', async ({ page }) => {
    await page.locator('button[title="New entry"]').click()
    await expect(page).toHaveURL(/\/journal\/[0-9a-f-]+/, { timeout: 10_000 })

    const editor = page.locator('.ProseMirror')
    await editor.click()
    await editor.type('Test keyboard save shortcut')

    await page.keyboard.press('Meta+s')
    await expect(page.getByText(/✓ Saved|Saved/)).toBeVisible({ timeout: 8_000 })
  })

  test('delete entry removes it from the list', async ({ page }) => {
    await page.locator('button[title="New entry"]').click()
    await expect(page).toHaveURL(/\/journal\/[0-9a-f-]+/, { timeout: 10_000 })

    const editor = page.locator('.ProseMirror')
    await editor.click()
    await editor.type('Entry to be deleted')

    await page.getByRole('button', { name: 'Save', exact: true }).click()
    await expect(page.getByText(/✓ Saved|Saved/)).toBeVisible({ timeout: 8_000 })

    await page.goto('/journal')

    const cards = page.locator('.group')
    const countBefore = await cards.count()

    const card = cards.first()
    await card.hover()

    page.on('dialog', (dialog) => dialog.accept())
    await card.locator('[title="Delete entry"]').click()

    await expect(cards).toHaveCount(countBefore - 1, { timeout: 5_000 })
  })
})
