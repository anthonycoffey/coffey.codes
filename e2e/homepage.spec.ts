import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('renders the scroll container at full viewport height', async ({ page }) => {
    const viewportHeight = page.viewportSize()!.height
    const container = page.locator('#scroll-container')
    await expect(container).toBeVisible()
    const box = await container.boundingBox()
    expect(box!.height).toBeCloseTo(viewportHeight, -1)
  })
})
