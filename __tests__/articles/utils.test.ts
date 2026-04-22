import { describe, it, expect, vi, beforeEach } from 'vitest'
import fs from 'fs'

const FIXTURE_A = `---
title: Alpha Post
publishedAt: 2024-06-15
summary: Alpha summary
tags: typescript, react
category: web-development
---

Alpha content.`

const FIXTURE_B = `---
title: Beta Post
publishedAt: 2024-01-01
summary: Beta summary
tags: javascript, node
category: backend
---

Beta content.`

const FIXTURE_C = `---
title: Gamma Post
publishedAt: 2023-05-20
summary: Gamma summary
tags: typescript, node
category: web-development
---

Gamma content.`

vi.mock('fs', () => ({
  default: {
    readdirSync: vi.fn(() => ['post-a.mdx', 'post-b.mdx', 'post-c.mdx']),
    readFileSync: vi.fn((filePath: string) => {
      if (filePath.endsWith('post-a.mdx')) return FIXTURE_A
      if (filePath.endsWith('post-b.mdx')) return FIXTURE_B
      if (filePath.endsWith('post-c.mdx')) return FIXTURE_C
      return ''
    }),
  },
}))

import {
  getAllBlogPosts,
  getPaginatedBlogPosts,
  getPaginatedBlogPostsByTag,
  getPaginatedBlogPostsByCategory,
  getAllTags,
  getAllCategories,
  capitalizeWords,
} from '@/app/articles/utils'

beforeEach(() => {
  vi.mocked(fs.readFileSync).mockImplementation((filePath: string) => {
    if (filePath.endsWith('post-a.mdx')) return FIXTURE_A
    if (filePath.endsWith('post-b.mdx')) return FIXTURE_B
    if (filePath.endsWith('post-c.mdx')) return FIXTURE_C
    return ''
  })
  vi.mocked(fs.readdirSync).mockReturnValue(['post-a.mdx', 'post-b.mdx', 'post-c.mdx'] as never)
})

describe('capitalizeWords', () => {
  it('capitalizes first letter of each word', () => {
    expect(capitalizeWords('hello world')).toBe('Hello World')
  })

  it('handles a single word', () => {
    expect(capitalizeWords('typescript')).toBe('Typescript')
  })

  it('handles empty string', () => {
    expect(capitalizeWords('')).toBe('')
  })

  it('handles already-capitalized words', () => {
    expect(capitalizeWords('Hello World')).toBe('Hello World')
  })

  it('handles multi-word hyphenated strings (each space-segment)', () => {
    expect(capitalizeWords('web development')).toBe('Web Development')
  })
})

describe('getAllBlogPosts', () => {
  it('returns all posts', () => {
    expect(getAllBlogPosts()).toHaveLength(3)
  })

  it('includes slugs derived from filenames', () => {
    const slugs = getAllBlogPosts().map((p) => p.slug)
    expect(slugs).toContain('post-a')
    expect(slugs).toContain('post-b')
    expect(slugs).toContain('post-c')
  })

  it('includes parsed metadata and raw content', () => {
    const alpha = getAllBlogPosts().find((p) => p.slug === 'post-a')!
    expect(alpha.metadata.title).toBe('Alpha Post')
    expect(alpha.metadata.publishedAt).toBe('2024-06-15')
    expect(alpha.metadata.summary).toBe('Alpha summary')
    expect(alpha.content).toContain('Alpha content')
  })

  it('throws when frontmatter is missing', () => {
    vi.mocked(fs.readFileSync).mockReturnValueOnce('no frontmatter here')
    expect(() => getAllBlogPosts()).toThrow()
  })

  it('throws when required metadata fields are absent', () => {
    vi.mocked(fs.readFileSync).mockReturnValueOnce(`---
publishedAt: 2024-01-01
---
no title or summary`)
    expect(() => getAllBlogPosts()).toThrow()
  })
})

describe('getPaginatedBlogPosts', () => {
  it('sorts posts by publishedAt descending', () => {
    const { posts } = getPaginatedBlogPosts(1, 10)
    expect(posts[0].metadata.publishedAt).toBe('2024-06-15')
    expect(posts[1].metadata.publishedAt).toBe('2024-01-01')
    expect(posts[2].metadata.publishedAt).toBe('2023-05-20')
  })

  it('returns correct slice for page 1', () => {
    const { posts } = getPaginatedBlogPosts(1, 2)
    expect(posts).toHaveLength(2)
    expect(posts[0].slug).toBe('post-a')
    expect(posts[1].slug).toBe('post-b')
  })

  it('returns correct slice for page 2', () => {
    const { posts } = getPaginatedBlogPosts(2, 2)
    expect(posts).toHaveLength(1)
    expect(posts[0].slug).toBe('post-c')
  })

  it('computes totalPages and totalItems correctly', () => {
    const { pagination } = getPaginatedBlogPosts(1, 2)
    expect(pagination.totalPages).toBe(2)
    expect(pagination.totalItems).toBe(3)
  })

  it('defaults to page 1 and 10 items per page', () => {
    const { posts, pagination } = getPaginatedBlogPosts()
    expect(posts).toHaveLength(3)
    expect(pagination.currentPage).toBe(1)
    expect(pagination.itemsPerPage).toBe(10)
  })
})

describe('getPaginatedBlogPostsByTag', () => {
  it('filters posts by tag', () => {
    const { posts } = getPaginatedBlogPostsByTag('react')
    expect(posts).toHaveLength(1)
    expect(posts[0].slug).toBe('post-a')
  })

  it('filters case-insensitively', () => {
    const { posts } = getPaginatedBlogPostsByTag('TypeScript')
    expect(posts).toHaveLength(2)
  })

  it('sorts results by date descending', () => {
    const { posts } = getPaginatedBlogPostsByTag('typescript')
    expect(posts[0].metadata.publishedAt).toBe('2024-06-15')
    expect(posts[1].metadata.publishedAt).toBe('2023-05-20')
  })

  it('returns empty posts for unmatched tag', () => {
    const { posts } = getPaginatedBlogPostsByTag('nonexistent')
    expect(posts).toHaveLength(0)
  })

  it('computes pagination for filtered results', () => {
    const { pagination } = getPaginatedBlogPostsByTag('typescript', 1, 1)
    expect(pagination.totalItems).toBe(2)
    expect(pagination.totalPages).toBe(2)
  })
})

describe('getPaginatedBlogPostsByCategory', () => {
  it('filters posts by category', () => {
    const { posts } = getPaginatedBlogPostsByCategory('backend')
    expect(posts).toHaveLength(1)
    expect(posts[0].slug).toBe('post-b')
  })

  it('filters case-insensitively', () => {
    const { posts } = getPaginatedBlogPostsByCategory('Web-Development')
    expect(posts).toHaveLength(2)
  })

  it('sorts results by date descending', () => {
    const { posts } = getPaginatedBlogPostsByCategory('web-development')
    expect(posts[0].metadata.publishedAt).toBe('2024-06-15')
    expect(posts[1].metadata.publishedAt).toBe('2023-05-20')
  })

  it('returns empty posts for unmatched category', () => {
    const { posts } = getPaginatedBlogPostsByCategory('unknown')
    expect(posts).toHaveLength(0)
  })
})

describe('getAllTags', () => {
  it('returns deduplicated sorted tags', () => {
    expect(getAllTags()).toEqual(['javascript', 'node', 'react', 'typescript'])
  })
})

describe('getAllCategories', () => {
  it('returns deduplicated sorted categories', () => {
    expect(getAllCategories()).toEqual(['backend', 'web-development'])
  })
})
