import { test, expect } from '@playwright/test'

const ARTICLE_PATH =
  '/articles/building-an-mdx-powered-blog-using-app-router-next-js'

test.describe('Article comments (Giscus)', () => {
  test('renders the Giscus widget on an article page', async ({ page }) => {
    await page.goto(ARTICLE_PATH)

    const commentsSection = page.locator('section[aria-label="Comments"]')
    await expect(commentsSection).toBeVisible()

    const widget = commentsSection.locator('giscus-widget')
    await expect(widget).toHaveCount(1)
    await expect(widget).toHaveAttribute('repo', /\/.+/)
  })

  test('Giscus widget appears after the article body in the DOM', async ({
    page,
  }) => {
    await page.goto(ARTICLE_PATH)

    await expect(page.locator('article').first()).toBeVisible()
    await expect(page.locator('section[aria-label="Comments"]')).toBeVisible()

    const ordering = await page.evaluate(() => {
      const a = document.querySelector('article')
      const g = document.querySelector('section[aria-label="Comments"]')
      if (!a || !g) return null
      return a.compareDocumentPosition(g) & Node.DOCUMENT_POSITION_FOLLOWING
        ? 'after'
        : 'before'
    })
    expect(ordering).toBe('after')
  })
})
