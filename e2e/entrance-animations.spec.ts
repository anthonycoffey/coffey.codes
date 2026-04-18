import { test, expect } from '@playwright/test'

test.describe('Homepage — entrance animations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for GSAP to initialise
    await page.waitForTimeout(800)
  })

  test('scene 1 content is visible on load', async ({ page }) => {
    const intro = page.locator('[data-scene="intro"] [data-animate]').first()
    await expect(intro).toBeVisible()
  })

  test('scene 2 content becomes visible after scrolling to it', async ({ page }) => {
    // Scroll enough to bring scene 2 fully into view
    const trackWidth = await page.locator('#scroll-track').evaluate(el => el.scrollWidth)
    const vw = page.viewportSize()!.width
    const scrollToScene2 = (trackWidth - vw) / 4  // ~25% = scene 2

    await page.evaluate(y => window.scrollTo(0, y), scrollToScene2)
    await page.waitForTimeout(600)

    const about = page.locator('[data-scene="about"] [data-animate]').first()
    await expect(about).toBeVisible()
    const opacity = await about.evaluate(el => parseFloat(getComputedStyle(el).opacity))
    expect(opacity).toBeGreaterThan(0.5)
  })

  test('scene 3 content becomes visible after scrolling to it', async ({ page }) => {
    const trackWidth = await page.locator('#scroll-track').evaluate(el => el.scrollWidth)
    const vw = page.viewportSize()!.width
    const scrollToScene3 = ((trackWidth - vw) / 4) * 2  // ~50%

    await page.evaluate(y => window.scrollTo(0, y), scrollToScene3)
    await page.waitForTimeout(600)

    const craft = page.locator('[data-scene="craft"] [data-animate]').first()
    await expect(craft).toBeVisible()
    const opacity = await craft.evaluate(el => parseFloat(getComputedStyle(el).opacity))
    expect(opacity).toBeGreaterThan(0.5)
  })

  test('animated elements exist in every scene', async ({ page }) => {
    for (const scene of ['intro', 'about', 'craft', 'now', 'connect']) {
      const els = page.locator(`[data-scene="${scene}"] [data-animate]`)
      await expect(els.first()).toBeAttached()
    }
  })
})
