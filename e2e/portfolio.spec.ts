import { test, expect } from '@playwright/test';

test.describe('Portfolio index', () => {
  test('renders the Portfolio heading', async ({ page }) => {
    await page.goto('/portfolio');
    await expect(
      page.getByRole('heading', { level: 1, name: /portfolio/i }),
    ).toBeVisible();
  });

  test('all project cards are navigable links (no modal trigger)', async ({
    page,
  }) => {
    await page.goto('/portfolio');
    const expectedLinks = [
      { name: /periscope/i, href: '/portfolio/periscope' },
      { name: /personal blog/i, href: '/portfolio/coffey-codes' },
      { name: /drum machine/i, href: '/portfolio/drum-machine' },
      { name: /simply voice/i, href: '/portfolio/simply-voice' },
      { name: /piano scale/i, href: '/portfolio/piano-scale-visualizer' },
    ];
    for (const { name, href } of expectedLinks) {
      const heading = page.getByRole('heading', { level: 3, name });
      const link = heading.locator('xpath=ancestor::a[1]');
      await expect(link).toHaveAttribute('href', href);
    }
  });
});

test.describe('Portfolio item pages', () => {
  test('/portfolio/coffey-codes renders the project heading', async ({
    page,
  }) => {
    await page.goto('/portfolio/coffey-codes');
    await expect(
      page.getByRole('heading', { level: 1, name: /coffey\.codes/i }),
    ).toBeVisible();
  });

  test('/portfolio/drum-machine renders the project heading', async ({
    page,
  }) => {
    await page.goto('/portfolio/drum-machine');
    await expect(
      page.getByRole('heading', { level: 1, name: /drum machine/i }),
    ).toBeVisible();
  });

  test('/portfolio/simply-voice renders the project heading', async ({
    page,
  }) => {
    await page.goto('/portfolio/simply-voice');
    await expect(
      page.getByRole('heading', { level: 1, name: /simply voice/i }),
    ).toBeVisible();
  });

  test('/portfolio/piano-scale-visualizer renders the project heading', async ({
    page,
  }) => {
    await page.goto('/portfolio/piano-scale-visualizer');
    await expect(
      page.getByRole('heading', { level: 1, name: /piano scale/i }),
    ).toBeVisible();
  });

  test('navigating from the index card reaches the item page', async ({
    page,
  }) => {
    await page.goto('/portfolio');
    const coffeyCodesHeading = page.getByRole('heading', {
      level: 3,
      name: /personal blog/i,
    });
    const card = coffeyCodesHeading.locator('xpath=ancestor::a[1]');
    await card.click();
    await expect(page).toHaveURL(/\/portfolio\/coffey-codes/);
    await expect(
      page.getByRole('heading', { level: 1, name: /coffey\.codes/i }),
    ).toBeVisible();
  });

  test('back-to-portfolio link is present on item pages', async ({ page }) => {
    await page.goto('/portfolio/coffey-codes');
    await expect(
      page.getByRole('link', { name: /back to portfolio/i }),
    ).toBeVisible();
  });
});
