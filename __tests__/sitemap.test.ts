import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/app/(site)/articles/utils', () => ({
  getAllBlogPosts: vi.fn(),
  getAllCategories: vi.fn(() => []),
}));

vi.mock('@/app/(site)/case-studies/case-studies', () => ({
  caseStudies: [],
}));

vi.mock('@/app/(site)/portfolio/utils', () => ({
  getAllPortfolioItems: vi.fn(() => []),
}));

import sitemap from '@/app/sitemap';
import { getAllBlogPosts } from '@/app/(site)/articles/utils';

type Post = {
  slug: string;
  content: string;
  metadata: {
    title: string;
    publishedAt: string;
    summary: string;
    updated?: string;
    tags?: string[];
    category?: string;
  };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('sitemap article lastModified (SPEC-030 WS4)', () => {
  // Locks in that refreshed articles signal their update to crawlers via
  // the frontmatter `updated:` field, falling back to `publishedAt` only
  // when `updated` is absent.
  it('uses `metadata.updated` as lastModified when present', async () => {
    const POSTS: Post[] = [
      {
        slug: 'refreshed',
        content: '',
        metadata: {
          title: 'Refreshed article',
          publishedAt: '2025-03-24',
          updated: '2026-05-22',
          summary: '',
        },
      },
    ];
    vi.mocked(getAllBlogPosts as unknown as () => Post[]).mockReturnValue(
      POSTS,
    );

    const entries = await sitemap();
    const refreshed = entries.find(
      (e) => e.url === 'https://coffey.codes/articles/refreshed',
    );

    expect(refreshed).toBeDefined();
    expect(refreshed!.lastModified).toBe('2026-05-22');
  });

  it('falls back to `metadata.publishedAt` when `updated` is absent', async () => {
    const POSTS: Post[] = [
      {
        slug: 'never-refreshed',
        content: '',
        metadata: {
          title: 'Never refreshed',
          publishedAt: '2024-04-08',
          summary: '',
        },
      },
    ];
    vi.mocked(getAllBlogPosts as unknown as () => Post[]).mockReturnValue(
      POSTS,
    );

    const entries = await sitemap();
    const post = entries.find(
      (e) => e.url === 'https://coffey.codes/articles/never-refreshed',
    );

    expect(post).toBeDefined();
    expect(post!.lastModified).toBe('2024-04-08');
  });

  it('handles a mix of refreshed and never-refreshed articles correctly', async () => {
    const POSTS: Post[] = [
      {
        slug: 'a',
        content: '',
        metadata: {
          title: 'A',
          publishedAt: '2025-01-01',
          updated: '2026-05-22',
          summary: '',
        },
      },
      {
        slug: 'b',
        content: '',
        metadata: {
          title: 'B',
          publishedAt: '2025-06-01',
          summary: '',
        },
      },
    ];
    vi.mocked(getAllBlogPosts as unknown as () => Post[]).mockReturnValue(
      POSTS,
    );

    const entries = await sitemap();
    const a = entries.find((e) => e.url.endsWith('/articles/a'));
    const b = entries.find((e) => e.url.endsWith('/articles/b'));

    expect(a!.lastModified).toBe('2026-05-22');
    expect(b!.lastModified).toBe('2025-06-01');
  });
});

describe('sitemap excludes tag pages (GSC Coverage cleanup 2026-05-23)', () => {
  // Per the GSC Coverage report from 2026-05-23, 103 tag URLs in the
  // sitemap were the bulk of 132 "Discovered - currently not indexed"
  // entries that destroyed Google's crawl budget. Tag pages remain
  // accessible for user browsing but are noindex,follow at the page
  // level and absent from the sitemap.
  it('does not emit any /articles/tag/* URLs', async () => {
    vi.mocked(getAllBlogPosts as unknown as () => Post[]).mockReturnValue([]);

    const entries = await sitemap();
    const tagEntries = entries.filter((e) => e.url.includes('/articles/tag/'));

    expect(tagEntries).toHaveLength(0);
  });
});
