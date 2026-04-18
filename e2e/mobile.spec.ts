import { test, expect } from '@playwright/test'

test.describe('Homepage — mobile layout (375px)', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('scenes stack vertically, not side by side', async ({ page }) => {
    const track = page.locator('#scroll-track')
    const box = await track.boundingBox()
    // On mobile the track height should exceed viewport (scenes stacked)
    expect(box!.height).toBeGreaterThan(812 * 2)
  })

  test('intro scene is visible on load', async ({ page }) => {
    const intro = page.locator('[data-scene="intro"]')
    await expect(intro).toBeVisible()
  })

  test('second scene is reachable by vertical scroll', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, window.innerHeight))
    await page.waitForTimeout(300)
    const about = page.locator('[data-scene="about"]')
    await expect(about).toBeVisible()
  })

  test('all 5 scenes are present in the DOM', async ({ page }) => {
    const scenes = page.locator('[data-scene]')
    await expect(scenes).toHaveCount(5)
  })
})
