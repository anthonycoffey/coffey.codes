import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/app/articles/utils', () => ({
  getAllBlogPosts: vi.fn(),
}))

vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data: unknown, init?: { status?: number }) => ({
      json: async () => data,
      status: init?.status ?? 200,
    })),
  },
}))

import { GET } from '@/app/api/search/route'
import { getAllBlogPosts } from '@/app/articles/utils'

const MOCK_POSTS = [
  {
    metadata: {
      title: 'Alpha Post',
      summary: 'Alpha summary about TypeScript',
      publishedAt: '2024-06-15',
      tags: ['typescript', 'react'],
      category: 'web-development',
    },
    slug: 'alpha-post',
    content: 'Alpha content body text.',
  },
  {
    metadata: {
      title: 'Beta Post',
      summary: 'Beta summary about Node.js backends',
      publishedAt: '2024-01-01',
      tags: ['javascript', 'node'],
      category: 'backend',
    },
    slug: 'beta-post',
    content: 'Beta content body text.',
  },
]

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getAllBlogPosts).mockReturnValue(MOCK_POSTS as any)
})

describe('GET /api/search', () => {
  it('returns empty posts when ?q param is absent', async () => {
    const res = await GET(new Request('http://localhost/api/search'))
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.posts).toEqual([])
  })

  it('returns empty posts when query matches nothing', async () => {
    const res = await GET(new Request('http://localhost/api/search?q=nonexistent'))
    const data = await res.json()
    expect(data.posts).toHaveLength(0)
  })

  it('matches by title (case-insensitive)', async () => {
    const res = await GET(new Request('http://localhost/api/search?q=ALPHA'))
    const data = await res.json()
    expect(data.posts).toHaveLength(1)
    expect(data.posts[0].title).toBe('Alpha Post')
  })

  it('matches by summary', async () => {
    const res = await GET(new Request('http://localhost/api/search?q=node.js'))
    const data = await res.json()
    expect(data.posts).toHaveLength(1)
    expect(data.posts[0].slug).toBe('beta-post')
  })

  it('matches by tag', async () => {
    const res = await GET(new Request('http://localhost/api/search?q=react'))
    const data = await res.json()
    expect(data.posts).toHaveLength(1)
    expect(data.posts[0].slug).toBe('alpha-post')
  })

  it('matches by category', async () => {
    const res = await GET(new Request('http://localhost/api/search?q=backend'))
    const data = await res.json()
    expect(data.posts).toHaveLength(1)
    expect(data.posts[0].slug).toBe('beta-post')
  })

  it('matches by content body', async () => {
    const res = await GET(new Request('http://localhost/api/search?q=Alpha+content'))
    const data = await res.json()
    expect(data.posts).toHaveLength(1)
    expect(data.posts[0].slug).toBe('alpha-post')
  })

  it('returns formatted post fields without content', async () => {
    const res = await GET(new Request('http://localhost/api/search?q=alpha'))
    const data = await res.json()
    const post = data.posts[0]
    expect(post).toHaveProperty('title')
    expect(post).toHaveProperty('summary')
    expect(post).toHaveProperty('slug')
    expect(post).toHaveProperty('publishedAt')
    expect(post).toHaveProperty('tags')
    expect(post).toHaveProperty('category')
    expect(post).not.toHaveProperty('content')
  })

  it('returns 500 when getAllBlogPosts throws', async () => {
    vi.mocked(getAllBlogPosts).mockImplementationOnce(() => {
      throw new Error('FS error')
    })
    const res = await GET(new Request('http://localhost/api/search?q=test'))
    expect(res.status).toBe(500)
    const data = await res.json()
    expect(data.posts).toEqual([])
    expect(data.error).toBeDefined()
  })
})
