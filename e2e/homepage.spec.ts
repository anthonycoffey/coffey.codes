import { test, expect, type Page } from '@playwright/test';

// Must match the SCROLL_MULTIPLIER constant in ScrollContainer.tsx
const SCROLL_MULTIPLIER = 6;

// Total scrollable distance = (SCROLL_MULTIPLIER - 1) × viewport height
const totalScroll = (vh: number) => (SCROLL_MULTIPLIER - 1) * vh;

// Playwright's toBeVisible/toBeHidden only check display:none and visibility:hidden —
// they do NOT check opacity.  The overlay panels hide via opacity: 0 (CSS transition),
// so we verify visibility by checking whether the CSS module `.visible` class is
// present on the panel container.  The class appears in the compiled attribute as a
// substring (e.g. "__visible"), so a /visible/ regex match is reliable.
const panels = {
  intro: (page: Page) => page.locator('[class*="introPanel"]').first(),
  final: (page: Page) => page.locator('[class*="introPanel"]').last(),
  about: (page: Page) => page.locator('[class*="hudPanel"]').first(),
  craft: (page: Page) => page.locator('[class*="hudPanel"]').last(),
};

const isShowing = /visible/;

// Brings the page to front (prevents Chrome from throttling RAF in parallel workers)
// then scrolls and waits for GSAP + React to process the new position.
async function scrollTo(page: Page, fraction: number) {
  await page.bringToFront();
  const vh = page.viewportSize()!.height;
  const y = fraction * totalScroll(vh);
  await page.evaluate((y: number) => window.scrollTo(0, y), y);
  // Confirm the scroll landed, then give GSAP/RAF one cycle to react
  await page.waitForFunction(
    (target: number) => window.scrollY >= target - 10,
    y,
  );
  await page.waitForTimeout(500);
}

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // The scene's *reveal* is gated behind a "click/tap to enter" splash on
    // every viewport. Click the gate, then wait for the canvas to mount and for
    // the loader to release the scroll lock (body overflow) before any
    // assertions or scrolling. (When the scene actually loads relative to that
    // click is covered by the "scene preloading" suite below.)
    await page.getByRole('button', { name: /enter/i }).click();
    await page.waitForSelector('canvas');
    await page.waitForFunction(
      () => document.body.style.overflow !== 'hidden',
    );
  });

  // ── Structure ──────────────────────────────────────────────────────────

  test('renders the scroll container at full viewport height', async ({
    page,
  }) => {
    const vh = page.viewportSize()!.height;
    const container = page.locator('#scroll-container');
    await expect(container).toBeVisible();
    const box = await container.boundingBox();
    expect(box!.height).toBeCloseTo(vh, -1);
  });

  test('canvas element is present (WebGL scene mounted)', async ({ page }) => {
    await expect(page.locator('canvas')).toBeVisible();
  });

  test('page body is 600vh tall (full scroll range intact)', async ({
    page,
  }) => {
    const vh = page.viewportSize()!.height;
    const bodyScrollHeight = await page.evaluate(
      () => document.body.scrollHeight,
    );
    expect(bodyScrollHeight).toBeCloseTo(SCROLL_MULTIPLIER * vh, -2);
  });

  // ── Overlay visibility at rest ─────────────────────────────────────────

  test('no overlay panels have the visible class before scrolling', async ({
    page,
  }) => {
    await expect(panels.intro(page)).not.toHaveClass(isShowing);
    await expect(panels.final(page)).not.toHaveClass(isShowing);
    await expect(panels.about(page)).not.toHaveClass(isShowing);
    await expect(panels.craft(page)).not.toHaveClass(isShowing);
  });

  // ── Intro overlay (progress 0.15–0.35) ────────────────────────────────

  test('intro overlay panel becomes visible when scrolled into range (~25%)', async ({
    page,
  }) => {
    await scrollTo(page, 0.25);
    await expect(panels.intro(page)).toHaveClass(isShowing);
    await expect(panels.intro(page)).toContainText('Who Am I?');
    await expect(panels.intro(page)).toContainText(
      'Anthony Coffey - Austin, Texas',
    );
  });

  test('intro overlay social links are present and correctly labelled', async ({
    page,
  }) => {
    await scrollTo(page, 0.25);
    await expect(panels.intro(page)).toHaveClass(isShowing);
    await expect(page.getByRole('link', { name: 'GitHub' })).toBeTruthy();
    await expect(page.getByRole('link', { name: 'LinkedIn' })).toBeTruthy();
    await expect(page.getByRole('link', { name: 'Linktree Hub' })).toBeTruthy();
  });

  // ── About overlay (progress 0.35–0.52) ────────────────────────────────

  test('about overlay panel becomes visible when scrolled into range (~44%)', async ({
    page,
  }) => {
    await scrollTo(page, 0.44);
    await expect(panels.about(page)).toHaveClass(isShowing);
    await expect(panels.about(page)).toContainText('Musician.');
    await expect(panels.about(page)).toContainText(
      'Creativity is at the core of everything that I love to do.',
    );
  });

  test('intro overlay panel is hidden once scrolled past its range', async ({
    page,
  }) => {
    await scrollTo(page, 0.44);
    await expect(panels.about(page)).toHaveClass(isShowing);
    await expect(panels.intro(page)).not.toHaveClass(isShowing);
  });

  // ── Craft overlay (progress 0.52–0.68) ────────────────────────────────

  test('craft overlay panel becomes visible when scrolled into range (~60%)', async ({
    page,
  }) => {
    await scrollTo(page, 0.6);
    await expect(panels.craft(page)).toHaveClass(isShowing);
    await expect(panels.craft(page)).toContainText('I solve big problems.');
    await expect(panels.craft(page)).toContainText(
      'The trends and tools change, but my role does not.',
    );
  });

  test('about overlay panel is hidden once scrolled past its range', async ({
    page,
  }) => {
    await scrollTo(page, 0.6);
    await expect(panels.craft(page)).toHaveClass(isShowing);
    await expect(panels.about(page)).not.toHaveClass(isShowing);
  });

  // ── Silent zone (progress 0.68–0.82) — no overlays ───────────────────

  test('no overlay panel has the visible class in the silent zone (~75%)', async ({
    page,
  }) => {
    await scrollTo(page, 0.75);
    await expect(panels.intro(page)).not.toHaveClass(isShowing);
    await expect(panels.about(page)).not.toHaveClass(isShowing);
    await expect(panels.craft(page)).not.toHaveClass(isShowing);
    await expect(panels.final(page)).not.toHaveClass(isShowing);
  });

  // ── FinalOverlay (progress 0.82–1.00) ───────────────────────────────────

  test('final overlay panel becomes visible when scrolled into range (~91%)', async ({
    page,
  }) => {
    await scrollTo(page, 0.91);
    await expect(panels.final(page)).toHaveClass(isShowing);
    await expect(panels.final(page)).toContainText('Want to know more?');
  });

  test('final overlay contact link points to /contact and is clickable', async ({
    page,
  }) => {
    await scrollTo(page, 0.91);
    await expect(panels.final(page)).toHaveClass(isShowing);
    const link = panels.final(page).locator('a[href="/contact"]');
    await expect(link).toHaveAttribute('href', '/contact');
    await link.click({ trial: true });
  });

  // ── ToC Overlay (progress 0–1.0) ────────────────────────────────────────

  test('Table of Contents container is present and interactive', async ({
    page,
  }) => {
    // The ToC Container should always be visible/present
    const toc = page.locator('[class*="tocContainer"]');
    await expect(toc).toBeVisible();
    await expect(toc).toContainText('U7•RΔ9//ZΩ');
  });

  test('Scroll prompts appear at start and end of page', async ({ page }) => {
    // At top (start)
    const promptContainer = page.locator('[class*="scrollPromptContainer"]');
    await expect(promptContainer).toHaveClass(isShowing);
    await expect(promptContainer).toContainText(
      'System Ready // Scroll to Explore',
    );

    // Scroll past 0.1, prompt should hide
    await scrollTo(page, 0.25);
    await expect(promptContainer).not.toHaveClass(isShowing);

    // Scroll to very bottom, prompt should reverse
    await scrollTo(page, 0.98);
    await expect(promptContainer).toHaveClass(isShowing);
    await expect(promptContainer).toContainText('SCROLL TO TOP');
  });
});

// ── Scene preloading (BUG-001) ───────────────────────────────────────────────
//
// The scene must load WHILE the splash is up, so entering reveals something
// already running — but it must still never load for a visitor who generates no
// input at all, which is what keeps the WebGL cost outside the Lighthouse/PSI
// audit window. These tests pin both halves of that bargain.
test.describe('Homepage scene preloading', () => {
  test('does not mount the canvas without any user interaction', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByTestId('loader-overlay')).toBeVisible();

    // Well past the gate's bar-fill floor, with no pointer/key/wheel/touch
    // event ever dispatched: no canvas, so no three.js execution. This is the
    // guard that protects the homepage perf score.
    await page.waitForTimeout(3000);
    expect(await page.locator('canvas').count()).toBe(0);
  });

  test('loads the scene behind the splash once the pointer moves', async ({
    page,
  }) => {
    await page.goto('/');
    await page.mouse.move(200, 200);

    // Canvas mounts on intent alone — before any click.
    await page.waitForSelector('canvas');

    // ...and the splash is still up, covering the init it is animating over.
    const overlay = page.getByTestId('loader-overlay');
    await expect(overlay).toHaveClass(/loading/);
    await expect(overlay).not.toHaveClass(/opacity-0/);
  });

  test('only offers entry once the scene has reported a rendered frame', async ({
    page,
  }) => {
    await page.goto('/');
    await page.mouse.move(200, 200);
    await page.waitForSelector('canvas');

    // "SCENE LOADED." is now a claim backed by a real first-frame signal, not a
    // timer, so it appears alongside the enter button.
    await expect(page.getByRole('button', { name: /enter/i })).toBeVisible();
    await expect(page.getByText(/SCENE LOADED\./)).toBeVisible();
  });

  test('fades the splash out on entry, revealing a running scene', async ({
    page,
  }) => {
    await page.goto('/');
    await page.mouse.move(200, 200);
    await page.waitForSelector('canvas');

    const overlay = page.getByTestId('loader-overlay');
    await expect(overlay).toHaveClass(/transition-opacity/);

    await page.getByRole('button', { name: /enter/i }).click();

    // Fades (opacity) rather than sliding (translate), and the canvas that was
    // already running is simply uncovered.
    await expect(overlay).toHaveClass(/opacity-0/);
    await expect(overlay).not.toHaveClass(/-translate-y-full/);
    await expect(page.locator('canvas')).toBeVisible();
  });
});
