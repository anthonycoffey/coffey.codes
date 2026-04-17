import { test, expect } from '@playwright/test'

test.describe('Homepage — scroll skeleton', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('renders full-viewport on load — no page bottom visible', async ({ page }) => {
    const viewportHeight = page.viewportSize()!.height
    const body = await page.locator('body').boundingBox()
    // The scroll container should be exactly viewport height, not taller
    const container = page.locator('#scroll-container')
    await expect(container).toBeVisible()
    const box = await container.boundingBox()
    expect(box!.height).toBeCloseTo(viewportHeight, -1)
  })

  test('scroll track contains 5 scenes side by side', async ({ page }) => {
    const scenes = page.locator('[data-scene]')
    await expect(scenes).toHaveCount(5)
  })

  test('scrolling moves the track horizontally', async ({ page }) => {
    const track = page.locator('#scroll-track')
    const before = await track.boundingBox()

    // Scroll down to trigger GSAP horizontal movement
    await page.mouse.wheel(0, 600)
    await page.waitForTimeout(400)

    const after = await track.boundingBox()
    // Track x position should have shifted left (negative direction)
    expect(after!.x).toBeLessThan(before!.x)
  })

  test('all 5 scenes are reachable by scrolling', async ({ page }) => {
    const sceneIds = ['intro', 'about', 'craft', 'now', 'connect']
    const trackWidth = await page.locator('#scroll-track').evaluate(
      (el) => el.scrollWidth
    )
    const viewportWidth = page.viewportSize()!.width
    const totalScroll = trackWidth - viewportWidth

    for (let i = 0; i < sceneIds.length; i++) {
      const scrollAmount = (totalScroll / (sceneIds.length - 1)) * i
      await page.evaluate((y) => window.scrollTo(0, y), scrollAmount)
      await page.waitForTimeout(300)
      const scene = page.locator(`[data-scene="${sceneIds[i]}"]`)
      await expect(scene).toBeVisible()
    }
  })
})
