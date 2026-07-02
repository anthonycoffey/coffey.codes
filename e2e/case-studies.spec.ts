import { test, expect } from '@playwright/test';

test.describe('Case Studies Migration', () => {
  test('should navigate from listing to individual case study page', async ({ page }) => {
    // Go to case studies listing
    await page.goto('/case-studies');

    // The listing has multiple case studies rendered newest-first, so card
    // position is not stable. Pin to the PostGIS card's "Read Case Study"
    // button by its href (each card has two links to the same slug — the
    // title and the button — so also match the button's text).
    const readMoreButton = page.locator(
      'a[href="/case-study/postgis-fleet-optimization"]',
      { hasText: 'Read Case Study' },
    );
    await expect(readMoreButton).toBeVisible();
    await readMoreButton.click();

    // Verify we are on the dynamic route
    await expect(page).toHaveURL(/\/case-study\/postgis-fleet-optimization/);

    // Verify content is rendered
    await expect(page.getByRole('heading', { name: /PostGIS in Action/i, level: 1 })).toBeVisible();
    
    // Verify a text block is present
    await expect(
      page.getByText(/match technicians to jobs by location/i),
    ).toBeVisible();
  });

  test('should render visx chart blocks as inline SVGs', async ({ page }) => {
    await page.goto('/case-study/postgis-fleet-optimization');
    // The PostGIS story has two chart blocks. Wait for at least one to mount.
    const firstChart = page.locator('svg[data-chart="bar"]').first();
    await expect(firstChart).toBeVisible();
    await expect(page.locator('svg[data-chart="bar"]')).toHaveCount(2);
  });

});
