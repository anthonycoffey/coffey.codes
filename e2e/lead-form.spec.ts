import { test, expect } from '@playwright/test';

// The lead form on /lp/practical-ai posts to the Google Cloud Function via the
// /functions/* rewrite. We stub that endpoint so CI never hits the live backend
// or sends a real email, then assert the form's client behavior end to end.
const SUBMIT_ENDPOINT = '**/functions/sendContactFormEmail';
const LP_PATH = '/lp/practical-ai';

test.describe('Lead form (/lp/practical-ai)', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(SUBMIT_ENDPOINT, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{}',
      }),
    );
  });

  test('submits successfully and shows the confirmation', async ({ page }) => {
    await page.goto(LP_PATH);

    await page.getByLabel(/name/i).fill('Ada Lovelace');
    await page.getByLabel(/email/i).fill('ada@example.com');
    await page
      .getByLabel(/project brief/i)
      .fill('Need an internal analytics dashboard.');
    await page.getByLabel(/project stage/i).selectOption('Prototype / MVP');
    await page.getByLabel(/timeline/i).selectOption('1-3 months');
    await page.getByLabel(/budget/i).selectOption('$15k - $50k');
    await page.getByLabel(/consent to contact/i).check();

    await page.getByRole('button', { name: /send message/i }).click();

    await expect(page.getByText(/your message has been sent/i)).toBeVisible();
  });

  test('blocks submission and shows validation when empty', async ({ page }) => {
    await page.goto(LP_PATH);

    await page.getByRole('button', { name: /send message/i }).click();

    await expect(page.getByText(/name is required/i)).toBeVisible();
    await expect(page.getByText(/a short project brief is required/i)).toBeVisible();
    // Success confirmation must not appear.
    await expect(page.getByText(/your message has been sent/i)).toHaveCount(0);
  });

  test('case studies and portfolio links open in a new tab', async ({
    page,
  }) => {
    await page.goto(LP_PATH);

    const caseStudies = page.getByRole('link', { name: /case studies/i });
    const portfolio = page.getByRole('link', { name: /portfolio/i });

    await expect(caseStudies).toHaveAttribute('href', '/case-studies');
    await expect(caseStudies).toHaveAttribute('target', '_blank');
    await expect(portfolio).toHaveAttribute('href', '/portfolio');
    await expect(portfolio).toHaveAttribute('target', '_blank');
  });
});
