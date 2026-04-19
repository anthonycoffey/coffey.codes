import { test, expect } from '@playwright/test'

// Must match the SCROLL_MULTIPLIER constant in ScrollContainer.tsx
const SCROLL_MULTIPLIER = 6

// Total scrollable distance = (SCROLL_MULTIPLIER - 1) × viewport height
const totalScroll = (vh: number) => (SCROLL_MULTIPLIER - 1) * vh

// Playwright's toBeVisible/toBeHidden only check display:none and visibility:hidden —
// they do NOT check opacity.  The overlay panels hide via opacity: 0 (CSS transition),
// so we verify visibility by checking whether the CSS module `.visible` class is
// present on the panel container.  The class appears in the compiled attribute as a
// substring (e.g. "__visible"), so a /visible/ regex match is reliable.
const panels = {
  intro: (page: any) => page.locator('[class*="introPanel"]').first(),
  shine: (page: any) => page.locator('[class*="introPanel"]').last(),
  about: (page: any) => page.locator('[class*="hudPanel"]').first(),
  craft: (page: any) => page.locator('[class*="hudPanel"]').last(),
}

const isShowing  = /visible/
const isHidden   = expect.not

// Brings the page to front (prevents Chrome from throttling RAF in parallel workers)
// then scrolls and waits for GSAP + React to process the new position.
async function scrollTo(page: any, fraction: number) {
  await page.bringToFront()
  const vh = page.viewportSize()!.height
  const y = fraction * totalScroll(vh)
  await page.evaluate((y: number) => window.scrollTo(0, y), y)
  // Confirm the scroll landed, then give GSAP/RAF one cycle to react
  await page.waitForFunction((target: number) => window.scrollY >= target - 10, y)
  await page.waitForTimeout(500)
}

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for the WebGL canvas to mount before any assertions or scrolling
    await page.waitForSelector('canvas')
  })

  // ── Structure ──────────────────────────────────────────────────────────

  test('renders the scroll container at full viewport height', async ({ page }) => {
    const vh = page.viewportSize()!.height
    const container = page.locator('#scroll-container')
    await expect(container).toBeVisible()
    const box = await container.boundingBox()
    expect(box!.height).toBeCloseTo(vh, -1)
  })

  test('canvas element is present (WebGL scene mounted)', async ({ page }) => {
    await expect(page.locator('canvas')).toBeVisible()
  })

  test('page body is 600vh tall (full scroll range intact)', async ({ page }) => {
    const vh = page.viewportSize()!.height
    const bodyScrollHeight = await page.evaluate(() => document.body.scrollHeight)
    expect(bodyScrollHeight).toBeCloseTo(SCROLL_MULTIPLIER * vh, -2)
  })

  // ── Overlay visibility at rest ─────────────────────────────────────────

  test('no overlay panels have the visible class before scrolling', async ({ page }) => {
    await expect(panels.intro(page)).not.toHaveClass(isShowing)
    await expect(panels.shine(page)).not.toHaveClass(isShowing)
    await expect(panels.about(page)).not.toHaveClass(isShowing)
    await expect(panels.craft(page)).not.toHaveClass(isShowing)
  })

  // ── Intro overlay (progress 0.15–0.35) ────────────────────────────────

  test('intro overlay panel becomes visible when scrolled into range (~25%)', async ({ page }) => {
    await scrollTo(page, 0.25)
    await expect(panels.intro(page)).toHaveClass(isShowing)
    await expect(panels.intro(page)).toContainText('Who Am I?')
    await expect(panels.intro(page)).toContainText('Anthony Coffey - Austin, Texas')
  })

  test('intro overlay social links are present and correctly labelled', async ({ page }) => {
    await scrollTo(page, 0.25)
    await expect(panels.intro(page)).toHaveClass(isShowing)
    await expect(page.getByRole('link', { name: 'GitHub' })).toBeTruthy()
    await expect(page.getByRole('link', { name: 'LinkedIn' })).toBeTruthy()
    await expect(page.getByRole('link', { name: 'Linktree Hub' })).toBeTruthy()
  })

  // ── About overlay (progress 0.35–0.52) ────────────────────────────────

  test('about overlay panel becomes visible when scrolled into range (~44%)', async ({ page }) => {
    await scrollTo(page, 0.44)
    await expect(panels.about(page)).toHaveClass(isShowing)
    await expect(panels.about(page)).toContainText('Musician.')
    await expect(panels.about(page)).toContainText('Creativity is at the core of everything that I love to do.')
  })

  test('intro overlay panel is hidden once scrolled past its range', async ({ page }) => {
    await scrollTo(page, 0.44)
    await expect(panels.about(page)).toHaveClass(isShowing)
    await expect(panels.intro(page)).not.toHaveClass(isShowing)
  })

  // ── Craft overlay (progress 0.52–0.68) ────────────────────────────────

  test('craft overlay panel becomes visible when scrolled into range (~60%)', async ({ page }) => {
    await scrollTo(page, 0.60)
    await expect(panels.craft(page)).toHaveClass(isShowing)
    await expect(panels.craft(page)).toContainText('I solve big problems.')
    await expect(panels.craft(page)).toContainText('The trends and tools change, but my role does not.')
  })

  test('about overlay panel is hidden once scrolled past its range', async ({ page }) => {
    await scrollTo(page, 0.60)
    await expect(panels.craft(page)).toHaveClass(isShowing)
    await expect(panels.about(page)).not.toHaveClass(isShowing)
  })

  // ── Silent zone (progress 0.68–0.82) — no overlays ───────────────────

  test('no overlay panel has the visible class in the silent zone (~75%)', async ({ page }) => {
    await scrollTo(page, 0.75)
    await expect(panels.intro(page)).not.toHaveClass(isShowing)
    await expect(panels.about(page)).not.toHaveClass(isShowing)
    await expect(panels.craft(page)).not.toHaveClass(isShowing)
    await expect(panels.shine(page)).not.toHaveClass(isShowing)
  })

  // ── Shine / FinalOverlay (progress 0.82–1.00) ─────────────────────────

  test('shine overlay panel becomes visible when scrolled into range (~91%)', async ({ page }) => {
    await scrollTo(page, 0.91)
    await expect(panels.shine(page)).toHaveClass(isShowing)
    await expect(panels.shine(page)).toContainText('Want to know more?')
  })

  test('shine overlay contact link points to /contact', async ({ page }) => {
    await scrollTo(page, 0.91)
    await expect(panels.shine(page)).toHaveClass(isShowing)
    const link = panels.shine(page).locator('a[href="/contact"]')
    await expect(link).toHaveAttribute('href', '/contact')
  })
})
