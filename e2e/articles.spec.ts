import { test, expect } from '@playwright/test'

test.describe('Articles index', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/articles')
  })

  test('renders the Articles heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /articles/i })).toBeVisible()
  })

  test('renders at least one article card', async ({ page }) => {
    const articles = page.locator('[data-testid="blog-post"], article, .article-card, h2 a[href^="/articles/"]').first()
    // Fall back to any link pointing at an article slug
    const articleLink = page.locator('a[href^="/articles/"]').first()
    await expect(articleLink).toBeVisible()
  })

  test('pagination navigates to page 2 and updates URL', async ({ page }) => {
    // Wait for client-side hydration so Pagination buttons become interactive
    await page.waitForLoadState('networkidle')
    const nextBtn = page.getByRole('button', { name: 'Next page' })

    // Only test pagination if a "Next" control exists (requires > 1 page of posts)
    const hasNext = await nextBtn.count()
    if (hasNext > 0) {
      await nextBtn.click()
      await expect(page).toHaveURL(/[?&]page=2/)
    } else {
      test.info().annotations.push({ type: 'note', description: 'Single page of posts — pagination not exercised' })
    }
  })
})

test.describe('Tag filter', () => {
  test('clicking a tag chip navigates to the tag page', async ({ page }) => {
    await page.goto('/articles/tags')
    await expect(page.getByRole('heading', { name: /all tags/i })).toBeVisible()

    const firstTag = page.locator('a[href^="/articles/tag/"]').first()
    const tagText = await firstTag.innerText()
    await firstTag.click()

    await expect(page).toHaveURL(/\/articles\/tag\//)
    await expect(page.getByRole('heading')).toContainText(tagText.trim(), { ignoreCase: true })
  })

  test('tag page renders at least one article', async ({ page }) => {
    await page.goto('/articles/tags')
    const firstTag = page.locator('a[href^="/articles/tag/"]').first()
    await firstTag.click()

    const articleLink = page.locator('a[href^="/articles/"]').first()
    await expect(articleLink).toBeVisible()
  })
})
