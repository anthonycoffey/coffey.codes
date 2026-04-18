import { render, screen, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
}))

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('@/components/SearchBox', () => ({
  default: ({ initialValue }: { initialValue?: string }) => (
    <input data-testid="search-box" defaultValue={initialValue} />
  ),
}))

vi.mock('@/components/Pagination', () => ({
  default: () => <div data-testid="pagination" />,
}))

vi.mock('@/utils/date', () => ({
  formatDate: vi.fn((d: string) => d),
}))

vi.mock('@heroicons/react/20/solid', () => ({
  MagnifyingGlassIcon: () => null,
  DocumentTextIcon: () => null,
  XCircleIcon: () => null,
}))

import { useSearchParams } from 'next/navigation'
import SearchPage from '@/app/articles/search/page'

const MOCK_POSTS = [
  {
    slug: 'post-1',
    title: 'First Result',
    publishedAt: '2024-01-01',
    summary: 'Summary one',
    tags: ['react'],
    category: 'frontend',
  },
]

function mockFetch(posts: typeof MOCK_POSTS) {
  global.fetch = vi.fn().mockResolvedValue({
    json: async () => ({ posts }),
  } as Response)
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams() as any)
})

describe('SearchPage — empty state', () => {
  it('shows the empty search prompt when no query is present', async () => {
    mockFetch([])
    render(<SearchPage />)
    await waitFor(() => {
      expect(screen.getByText(/search articles/i)).toBeInTheDocument()
    })
  })
})

describe('SearchPage — with query', () => {
  beforeEach(() => {
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('q=react') as any)
  })

  it('renders search results when API returns matches', async () => {
    mockFetch(MOCK_POSTS)
    render(<SearchPage />)
    await waitFor(() => {
      expect(screen.getByText('First Result')).toBeInTheDocument()
    })
  })

  it('shows no-results message when API returns empty array', async () => {
    mockFetch([])
    render(<SearchPage />)
    await waitFor(() => {
      expect(screen.getByText(/no articles found/i)).toBeInTheDocument()
    })
  })

  it('calls fetch with the encoded query', async () => {
    mockFetch(MOCK_POSTS)
    render(<SearchPage />)
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/search?q=react'),
      )
    })
  })
})

describe('SearchPage — custom search event', () => {
  it('re-fetches when search-query-updated event fires', async () => {
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams() as any)
    mockFetch([])
    render(<SearchPage />)

    await act(async () => {
      window.dispatchEvent(
        new CustomEvent('search-query-updated', { detail: { query: 'typescript' } }),
      )
    })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/search?q=typescript'),
      )
    })
  })
})

describe('SearchPage — pagination', () => {
  it('renders pagination when results exceed 5 items', async () => {
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('q=test') as any)
    const manyPosts = Array.from({ length: 6 }, (_, i) => ({
      slug: `post-${i}`,
      title: `Post ${i}`,
      publishedAt: '2024-01-01',
      summary: 'Summary',
      tags: [],
      category: '',
    }))
    mockFetch(manyPosts)
    render(<SearchPage />)
    await waitFor(() => {
      expect(screen.getByTestId('pagination')).toBeInTheDocument()
    })
  })

  it('does not render pagination when results fit on one page', async () => {
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('q=test') as any)
    mockFetch(MOCK_POSTS)
    render(<SearchPage />)
    await waitFor(() => {
      expect(screen.getByText('First Result')).toBeInTheDocument()
    })
    expect(screen.queryByTestId('pagination')).not.toBeInTheDocument()
  })
})
