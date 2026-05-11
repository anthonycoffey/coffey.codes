import { test, expect } from '@playwright/test';

test.describe('Case Studies Migration', () => {
  test('should navigate from listing to individual case study page', async ({ page }) => {
    // Go to case studies listing
    await page.goto('/case-studies');

    // The listing now has multiple case studies; pick the PostGIS one
    // specifically by href since every card uses the same link label.
    const readMoreButton = page.locator(
      'a[href="/case-study/postgis-fleet-optimization"]',
    );
    await expect(readMoreButton).toBeVisible();
    await readMoreButton.click();

    // Verify we are on the dynamic route
    await expect(page).toHaveURL(/\/case-study\/postgis-fleet-optimization/);

    // Verify content is rendered
    await expect(page.getByRole('heading', { name: /PostGIS in Action/i, level: 1 })).toBeVisible();
    
    // Verify a text block is present
    await expect(
      page.getByText(/no ability to match technicians to jobs by location/i),
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
