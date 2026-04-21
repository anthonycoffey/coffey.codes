import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockNotFound } = vi.hoisted(() => ({ mockNotFound: vi.fn() }))

vi.mock('next/navigation', () => ({
  notFound: mockNotFound,
}))

vi.mock('@/app/articles/utils', () => ({
  getPaginatedBlogPostsByCategory: vi.fn(),
  getAllCategories: vi.fn(),
  getAllTags: vi.fn(),
  capitalizeWords: vi.fn((text: string) =>
    text
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  ),
}))

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('@/components/posts', () => ({ BlogPosts: () => <div data-testid="blog-posts" /> }))
vi.mock('@/components/Pagination', () => ({ default: () => <div data-testid="pagination" /> }))
vi.mock('@/components/SearchBox', () => ({ default: () => <div data-testid="search-box" /> }))
vi.mock('@heroicons/react/20/solid', () => ({
  TagIcon: () => null,
  FolderIcon: () => null,
  MagnifyingGlassIcon: () => null,
}))

import {
  getPaginatedBlogPostsByCategory,
  getAllCategories,
  getAllTags,
} from '@/app/articles/utils'
import CategoryPage from '@/app/articles/category/[category]/page'

const EMPTY_RESULT = {
  posts: [],
  pagination: { totalItems: 0, totalPages: 0, currentPage: 1, itemsPerPage: 5 },
}

const ONE_POST_RESULT = {
  posts: [
    {
      metadata: {
        title: 'Test Post',
        publishedAt: '2024-01-01',
        summary: 'Summary',
        tags: ['typescript'],
        category: 'backend',
      },
      slug: 'test-post',
      content: '',
    },
  ],
  pagination: { totalItems: 1, totalPages: 1, currentPage: 1, itemsPerPage: 5 },
}

beforeEach(() => {
  vi.clearAllMocks()
  mockNotFound.mockReset()
  vi.mocked(getAllCategories).mockReturnValue(['backend', 'frontend', 'devops'])
  vi.mocked(getAllTags).mockReturnValue(['typescript', 'react'])
})

describe('CategoryPage', () => {
  it('calls notFound when no posts match the category', async () => {
    vi.mocked(getPaginatedBlogPostsByCategory).mockReturnValue(EMPTY_RESULT as never)
    await CategoryPage({
      params: Promise.resolve({ category: 'nonexistent' }),
      searchParams: Promise.resolve({}),
    })
    expect(mockNotFound).toHaveBeenCalled()
  })

  it('does not call notFound when posts exist', async () => {
    vi.mocked(getPaginatedBlogPostsByCategory).mockReturnValue(ONE_POST_RESULT as never)
    await CategoryPage({
      params: Promise.resolve({ category: 'backend' }),
      searchParams: Promise.resolve({}),
    })
    expect(mockNotFound).not.toHaveBeenCalled()
  })

  it('decodes URL-encoded category and passes to utils', async () => {
    vi.mocked(getPaginatedBlogPostsByCategory).mockReturnValue(ONE_POST_RESULT as never)
    await CategoryPage({
      params: Promise.resolve({ category: 'web%20development' }),
      searchParams: Promise.resolve({}),
    })
    expect(getPaginatedBlogPostsByCategory).toHaveBeenCalledWith('Web Development', 1, 5)
  })

  it('uses page number from searchParams', async () => {
    vi.mocked(getPaginatedBlogPostsByCategory).mockReturnValue(ONE_POST_RESULT as never)
    await CategoryPage({
      params: Promise.resolve({ category: 'backend' }),
      searchParams: Promise.resolve({ page: '3' }),
    })
    expect(getPaginatedBlogPostsByCategory).toHaveBeenCalledWith('Backend', 3, 5)
  })

  it('excludes the active category from the sidebar list', async () => {
    vi.mocked(getPaginatedBlogPostsByCategory).mockReturnValue(ONE_POST_RESULT as never)
    const jsx = await CategoryPage({
      params: Promise.resolve({ category: 'backend' }),
      searchParams: Promise.resolve({}),
    })
    render(jsx as React.ReactElement)
    // getAllCategories returns ['backend', 'frontend', 'devops']
    // 'backend' is active — should appear in the heading but NOT in the "Other Categories" links
    const categoryLinks = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('href')?.startsWith('/articles/category/'))
    const hrefs = categoryLinks.map((a) => a.getAttribute('href'))
    expect(hrefs).not.toContain('/articles/category/backend')
    expect(hrefs).toContain('/articles/category/frontend')
    expect(hrefs).toContain('/articles/category/devops')
  })
})
