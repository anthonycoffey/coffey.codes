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
    await page.waitForFunction(() => document.body.style.overflow !== 'hidden');
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
    await expect(panels.intro(page)).toContainText('Anthony Coffey');
    await expect(panels.intro(page)).toContainText(
      'Senior Software Engineer - Austin, Texas',
    );
    await expect(panels.intro(page)).toContainText(
      'I build and fix the systems businesses run on.',
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
    await expect(panels.about(page)).toContainText('The rebuild stalled.');
    await expect(panels.about(page)).toContainText(
      'The last developer stopped replying.',
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
    await expect(panels.craft(page)).toContainText('Legacy rebuilds.');
    await expect(panels.craft(page)).toContainText(
      'Shipped through HIPAA, FDA and security review.',
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
    await expect(panels.final(page)).toContainText('Let’s get it shipped.');
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

// ── Scene preloading (BUG-001) ───────────────────────────────────────────
//
// The scene must load WHILE the splash is up, so entering reveals something
// already running — but it must still never load for a visitor who generates no
// input at all, which is what keeps the WebGL cost outside the Lighthouse/PSI
// audit window. These tests pin both halves of that bargain.
// The intent listener is attached by a React effect, so it does not exist
// until the page hydrates. A single pointer event fired right after goto()
// can land before that and is lost forever — nothing else fires, the canvas
// never mounts, and the test hangs until it times out. (That is exactly how
// this suite failed against a cold production deployment.) A real pointer
// moves continuously, so nudge it until the canvas appears.
async function signalIntent(page: Page) {
  await expect(async () => {
    await page.mouse.move(
      120 + Math.round(Math.random() * 240),
      120 + Math.round(Math.random() * 240),
    );
    expect(await page.locator('canvas').count()).toBeGreaterThan(0);
  }).toPass({ timeout: 30_000, intervals: [100, 250, 500] });
}

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
    await signalIntent(page);

    // The canvas is mounting and initializing on intent alone — no click yet —
    // while the splash still covers it. This is the fix: the loading animation
    // now overlaps real scene init rather than running over an idle page.
    const overlay = page.getByTestId('loader-overlay');
    await expect(overlay).toHaveClass(/loading/);
    await expect(overlay).not.toHaveClass(/opacity-0/);
  });

  test('fades the splash out on entry, revealing a running scene', async ({
    page,
  }) => {
    await page.goto('/');
    await signalIntent(page);

    const overlay = page.getByTestId('loader-overlay');
    await expect(overlay).toHaveClass(/transition-opacity/);

    // The gate reports the scene loaded before offering entry. That it waits on
    // a REAL first-frame signal rather than a timer is pinned precisely in
    // __tests__/components/Loader.test.tsx; asserting that ordering here would
    // depend on intent landing before the bar-fill floor, which is not
    // controllable against a cold deployment.
    await expect(page.getByText(/SCENE LOADED\./)).toBeVisible();
    await page.getByRole('button', { name: /enter/i }).click();

    // Fades (opacity) rather than sliding (translate), and the canvas that was
    // already running is simply uncovered.
    await expect(overlay).toHaveClass(/opacity-0/);
    await expect(overlay).not.toHaveClass(/-translate-y-full/);
    await expect(page.locator('canvas')).toBeVisible();
  });
});

// ── Shader warm-up (BUG-002) ─────────────────────────────────────────────
//
// three.js compiles a material's program on the first frame that DRAWS it, so
// anything held outside the frustum until partway through the scroll pays its
// whole compile cost on the frame it arrives. The spaceship did exactly that at
// scroll 0.62 — four programs on one frame, and a visible stall.
//
// The warm-up runs under the loading splash, so by the time the visitor can
// scroll there is nothing left to compile. That is the invariant below: this
// fails loudly if a material is ever added that is only reachable mid-scroll.
type ProbeWindow = Window & typeof globalThis & { __linkedPrograms: number };

test.describe('Homepage scene shader warm-up', () => {
  // The craft is desktop-only (min-width: 1024px) — below that it is not in the
  // scene at all and there is nothing to warm.
  test.skip(
    ({ viewport }) => !!viewport && viewport.width < 1024,
    'spaceship is desktop-only',
  );

  async function countLinkedPrograms(page: Page) {
    await page.addInitScript(() => {
      const w = window as ProbeWindow;
      w.__linkedPrograms = 0;
      const protos = [
        window.WebGL2RenderingContext,
        window.WebGLRenderingContext,
      ]
        .filter(Boolean)
        .map((ctor) => ctor.prototype);

      for (const proto of protos) {
        const link = proto.linkProgram;
        proto.linkProgram = function (...args: Parameters<typeof link>) {
          w.__linkedPrograms++;
          return link.apply(this, args);
        };
      }
    });
  }

  const linkedPrograms = (page: Page) =>
    page.evaluate(() => (window as ProbeWindow).__linkedPrograms);

  test('compiles nothing once the visitor can scroll', async ({ page }) => {
    await countLinkedPrograms(page);
    await page.goto('/');
    await signalIntent(page);

    // The gate waits for a painted frame AND the warm-up, and has its own 6s
    // ceiling behind that; under a loaded parallel run it can use most of it.
    await expect(page.getByText(/SCENE LOADED\./)).toBeVisible({
      timeout: 15_000,
    });
    await page.getByRole('button', { name: /enter/i }).click();

    // Short of the craft's trigger (0.62), inside the craft HUD window.
    await scrollTo(page, 0.55);
    await expect(panels.craft(page)).toHaveClass(isShowing);

    // Wait for the warm-up to have actually run before baselining, rather than
    // assuming it beat us here — under a loaded parallel run it may not have.
    await expect(async () => {
      expect(await linkedPrograms(page)).toBeGreaterThan(0);
    }).toPass({ timeout: 15_000, intervals: [100, 250, 500] });
    const warmed = await linkedPrograms(page);

    // Past the trigger. The scrub eases over ~1s, so give it room to land.
    await scrollTo(page, 0.78);
    await page.waitForTimeout(2000);

    // Positive control, read off the same scrollProgress ref the craft itself
    // runs on: the craft panel closes at 0.68, so seeing it gone proves
    // progress really advanced through 0.62 and the craft flew. Without this,
    // a scrub that never landed would make the assertion below vacuous.
    await expect(panels.craft(page)).not.toHaveClass(isShowing);

    // The assertion. Not one program compiled between the splash lifting and
    // the craft flying in.
    expect(await linkedPrograms(page)).toBe(warmed);
  });
});
