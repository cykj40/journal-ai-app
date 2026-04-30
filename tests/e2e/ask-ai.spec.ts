import { test, expect } from '@playwright/test'
import { signIn, clearSession } from './helpers/auth'

const AI_PLACEHOLDER = "How has my energy been this week?"

test.describe('ask AI feature', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test.beforeEach(async ({ page }) => {
    await signIn(page)
    await page.locator('button[title="New entry"]').click()
    await expect(page).toHaveURL(/\/journal\/[0-9a-f-]+/, { timeout: 10_000 })

    const editor = page.locator('.ProseMirror')
    await editor.click()
    await editor.type('Feeling good today. Had a great workout and ate well.')
    await page.getByRole('button', { name: 'Save', exact: true }).click()
    await expect(page.getByText(/✓ Saved|Saved/)).toBeVisible({ timeout: 8_000 })
  })

  test.afterEach(async ({ page }) => {
    await clearSession(page)
  })

  test('AskAI input and Ask button are visible on entry editor', async ({ page }) => {
    await expect(page.getByPlaceholder(AI_PLACEHOLDER)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Ask' })).toBeVisible()
  })

  test('Ask button is disabled when input is empty', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Ask' })).toBeDisabled()
  })

  test('Ask button enables when input has text', async ({ page }) => {
    await page.getByPlaceholder(AI_PLACEHOLDER).fill('How has my mood been?')
    await expect(page.getByRole('button', { name: 'Ask' })).toBeEnabled()
  })

  test('submitting a question shows AI response section', async ({ page }) => {
    await page.getByPlaceholder(AI_PLACEHOLDER).fill('What did I write about?')
    await page.getByRole('button', { name: 'Ask' }).click()
    await expect(page.getByText('AI Response:')).toBeVisible({ timeout: 20_000 })
  })

  test('Clear button removes AI response', async ({ page }) => {
    await page.getByPlaceholder(AI_PLACEHOLDER).fill('What did I write about?')
    await page.getByRole('button', { name: 'Ask' }).click()
    await expect(page.getByText('AI Response:')).toBeVisible({ timeout: 20_000 })
    await page.getByText('Clear').click()
    await expect(page.getByText('AI Response:')).not.toBeVisible()
  })
})
