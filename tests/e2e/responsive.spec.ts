import { test, expect } from '@playwright/test'
import { signIn, clearSession } from './helpers/auth'

// ─── Landing page (no auth required) ────────────────────────────────────────

test.describe('landing page — mobile (390px)', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('hero text is visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Health Journal AI').first()).toBeVisible()
    await expect(page.getByText(/Your health journal for an active life/)).toBeVisible()
  })

  test('Start tracking CTA is visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Start tracking')).toBeVisible()
  })

  test('no horizontal overflow', async ({ page }) => {
    await page.goto('/')
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    )
    expect(overflow).toBe(false)
  })
})

test.describe('landing page — desktop (1280px)', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('hero text and image are both visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Health Journal AI').first()).toBeVisible()
    await expect(page.getByRole('img', { name: /hiker/i })).toBeVisible()
  })

  test('nav links are visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Features')).toBeVisible()
    await expect(page.getByText('About')).toBeVisible()
    await expect(page.getByText('Sign in')).toBeVisible()
  })

  test('no horizontal overflow', async ({ page }) => {
    await page.goto('/')
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    )
    expect(overflow).toBe(false)
  })
})

// ─── Dashboard layout (auth required) ───────────────────────────────────────

test.describe('dashboard layout — mobile (390px)', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  test.afterEach(async ({ page }) => {
    await clearSession(page)
  })

  test('bottom nav is visible with all three tabs', async ({ page }) => {
    // BottomNav has lg:hidden — should be visible at 390px
    const nav = page.locator('nav, [class*="BottomNav"]').filter({
      has: page.getByRole('link', { name: 'Journal' }),
    })
    await expect(page.getByRole('link', { name: 'Journal' }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: 'Analytics' }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: 'History' }).first()).toBeVisible()
  })

  test('desktop sidebar is NOT visible', async ({ page }) => {
    // Sidebar has hidden lg:flex — should be hidden at 390px
    const sidebar = page.locator('aside')
    await expect(sidebar).toBeHidden()
  })

  test('FAB button exists and is positioned in lower portion of screen', async ({ page }) => {
    const fab = page.locator('button[title="New entry"]')
    await expect(fab).toBeVisible()

    const box = await fab.boundingBox()
    expect(box).not.toBeNull()
    // Should be in the lower half of an 844px viewport
    expect(box!.y).toBeGreaterThan(422)
  })

  test('no horizontal overflow on journal page', async ({ page }) => {
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    )
    expect(overflow).toBe(false)
  })
})

test.describe('dashboard layout — desktop (1280px)', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  test.afterEach(async ({ page }) => {
    await clearSession(page)
  })

  test('sidebar is visible with brand name', async ({ page }) => {
    // Sidebar has hidden lg:flex — should be visible at 1280px
    const sidebar = page.locator('aside')
    await expect(sidebar).toBeVisible()
    await expect(sidebar.getByText('Health Journal AI')).toBeVisible()
  })

  test('bottom nav is NOT visible', async ({ page }) => {
    // BottomNav has lg:hidden — should be hidden at 1280px
    // Check by looking for the nav's tab links to be hidden
    // We identify the bottom nav by its border-t characteristic and fixed bottom position
    const bottomNavLinks = page.locator('[class*="lg:hidden"]').filter({
      has: page.getByRole('link', { name: 'Journal' }),
    })
    // The bottom nav div has lg:hidden which means display:none at lg+
    const bottomNav = page.locator('div.fixed.bottom-0')
    await expect(bottomNav).toBeHidden()
  })

  test('FAB button exists', async ({ page }) => {
    await expect(page.locator('button[title="New entry"]')).toBeVisible()
  })

  test('content area uses full available width (not narrow column)', async ({ page }) => {
    // The main content should be wider than 430px on a 1280px viewport
    const main = page.locator('main').first()
    const box = await main.boundingBox()
    expect(box).not.toBeNull()
    // On desktop, main fills 1280 - 240 (sidebar) = ~1040px
    expect(box!.width).toBeGreaterThan(600)
  })

  test('no horizontal overflow on journal page', async ({ page }) => {
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    )
    expect(overflow).toBe(false)
  })
})
