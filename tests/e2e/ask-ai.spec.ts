import { test, expect } from '@playwright/test'
import { signIn, clearSession } from './helpers/auth'

// Actual placeholder from AskAI.tsx:
// "Ask about your journal entries (e.g., 'How has my mood been lately?')"
const AI_PLACEHOLDER = "Ask about your journal entries (e.g., 'How has my mood been lately?')"

test.describe('ask AI feature', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  test.afterEach(async ({ page }) => {
    await clearSession(page)
  })

  test('AskAI input and Ask button are visible on journal page', async ({ page }) => {
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

    // h3 text is "AI Response:" (with colon) from AskAI.tsx
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
