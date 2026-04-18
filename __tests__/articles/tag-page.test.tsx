import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockNotFound } = vi.hoisted(() => ({ mockNotFound: vi.fn() }))

vi.mock('next/navigation', () => ({
  notFound: mockNotFound,
}))

vi.mock('@/app/articles/utils', () => ({
  getPaginatedBlogPostsByTag: vi.fn(),
  getPaginatedBlogPosts: vi.fn(),
  getAllTags: vi.fn(),
  getAllCategories: vi.fn(),
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
  getPaginatedBlogPostsByTag,
  getPaginatedBlogPosts,
  getAllTags,
  getAllCategories,
} from '@/app/articles/utils'
import TagPage from '@/app/articles/tag/[tag]/page'

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
        category: 'web-development',
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
  vi.mocked(getAllTags).mockReturnValue(['javascript', 'react', 'typescript'])
  vi.mocked(getAllCategories).mockReturnValue(['backend', 'web-development'])
  vi.mocked(getPaginatedBlogPosts).mockReturnValue({
    posts: ONE_POST_RESULT.posts,
    pagination: ONE_POST_RESULT.pagination,
  } as any)
})

describe('TagPage', () => {
  it('calls notFound when no posts match the tag', async () => {
    vi.mocked(getPaginatedBlogPostsByTag).mockReturnValue(EMPTY_RESULT as any)
    await TagPage({
      params: Promise.resolve({ tag: 'nonexistent' }),
      searchParams: Promise.resolve({}),
    })
    expect(mockNotFound).toHaveBeenCalled()
  })

  it('does not call notFound when posts exist', async () => {
    vi.mocked(getPaginatedBlogPostsByTag).mockReturnValue(ONE_POST_RESULT as any)
    await TagPage({
      params: Promise.resolve({ tag: 'typescript' }),
      searchParams: Promise.resolve({}),
    })
    expect(mockNotFound).not.toHaveBeenCalled()
  })

  it('decodes URL-encoded tag and passes capitalized value to utils', async () => {
    vi.mocked(getPaginatedBlogPostsByTag).mockReturnValue(ONE_POST_RESULT as any)
    await TagPage({
      params: Promise.resolve({ tag: 'web%20development' }),
      searchParams: Promise.resolve({}),
    })
    expect(getPaginatedBlogPostsByTag).toHaveBeenCalledWith('Web Development', 1, 5)
  })

  it('uses page number from searchParams', async () => {
    vi.mocked(getPaginatedBlogPostsByTag).mockReturnValue(ONE_POST_RESULT as any)
    await TagPage({
      params: Promise.resolve({ tag: 'typescript' }),
      searchParams: Promise.resolve({ page: '2' }),
    })
    expect(getPaginatedBlogPostsByTag).toHaveBeenCalledWith('Typescript', 2, 5)
  })

  it('excludes the active tag from the sidebar tag list', async () => {
    vi.mocked(getPaginatedBlogPostsByTag).mockReturnValue(ONE_POST_RESULT as any)
    const jsx = await TagPage({
      params: Promise.resolve({ tag: 'typescript' }),
      searchParams: Promise.resolve({}),
    })
    render(jsx as React.ReactElement)
    // getAllTags returns ['javascript', 'react', 'typescript']
    // 'typescript' is the active tag and must be excluded from sidebar chips
    const tagLinks = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('href')?.startsWith('/articles/tag/'))
    const hrefs = tagLinks.map((a) => a.getAttribute('href'))
    expect(hrefs).not.toContain('/articles/tag/typescript')
    expect(hrefs).toContain('/articles/tag/javascript')
    expect(hrefs).toContain('/articles/tag/react')
  })
})
