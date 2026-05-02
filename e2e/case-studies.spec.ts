import { test, expect } from '@playwright/test';

test.describe('Case Studies Migration', () => {
  test('should navigate from listing to individual case study page', async ({ page }) => {
    // Go to case studies listing
    await page.goto('/case-studies');

    // Find the PostGIS case study and click "Read Case Study"
    const readMoreButton = page.getByRole('link', { name: /Read Case Study/i });
    await expect(readMoreButton).toBeVisible();
    await readMoreButton.click();

    // Verify we are on the dynamic route
    await expect(page).toHaveURL(/\/case-study\/postgis-fleet-optimization/);

    // Verify content is rendered
    await expect(page.getByRole('heading', { name: /PostGIS in Action/i, level: 1 })).toBeVisible();
    
    // Verify a text block is present
    await expect(page.getByText('The client needed an update to their web app')).toBeVisible();
  });

  test('should render visx chart blocks as inline SVGs', async ({ page }) => {
    await page.goto('/case-study/postgis-fleet-optimization');
    // The PostGIS story has two chart blocks. Wait for at least one to mount.
    const firstChart = page.locator('svg[data-chart="bar"]').first();
    await expect(firstChart).toBeVisible();
    await expect(page.locator('svg[data-chart="bar"]')).toHaveCount(2);
  });

  test('should render a PDF download CTA when the case study has a pdfPath', async ({
    page,
  }) => {
    await page.goto('/case-study/postgis-fleet-optimization');
    const cta = page.getByTestId('case-study-pdf-cta');
    await expect(cta).toBeVisible();
    const downloadLink = cta.getByRole('link', {
      name: /download pdf version/i,
    });
    await expect(downloadLink).toHaveAttribute(
      'href',
      /Case%20Study%20-%20PostGIS%20in%20Action\.pdf$/,
    );
  });
});
