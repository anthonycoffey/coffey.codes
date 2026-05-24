import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/app/(site)/articles/utils', () => ({
  capitalizeWords: (s: string) =>
    s
      .split(' ')
      .map((w) => w[0]?.toUpperCase() + w.slice(1))
      .join(' '),
}));

import { generateMetadata as articlesMeta } from '@/app/(site)/articles/page';
import { generateMetadata as categoryMeta } from '@/app/(site)/articles/category/[category]/page';
import { generateMetadata as tagMeta } from '@/app/(site)/articles/tag/[tag]/page';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Articles list pagination — noindex on paginated views', () => {
  describe('/articles', () => {
    it('page 1 (no ?page param) does not set robots.index = false', async () => {
      const meta = await articlesMeta({ searchParams: Promise.resolve({}) });
      // robots may be undefined OR may not be { index: false }
      const robots = meta.robots as
        | { index?: boolean; follow?: boolean }
        | undefined;
      expect(robots?.index).not.toBe(false);
    });

    it('?page=1 still does not set noindex (canonical view)', async () => {
      const meta = await articlesMeta({
        searchParams: Promise.resolve({ page: '1' }),
      });
      const robots = meta.robots as
        | { index?: boolean; follow?: boolean }
        | undefined;
      expect(robots?.index).not.toBe(false);
    });

    it('?page=2 sets robots to noindex,follow', async () => {
      const meta = await articlesMeta({
        searchParams: Promise.resolve({ page: '2' }),
      });
      const robots = meta.robots as { index: boolean; follow: boolean };
      expect(robots).toBeDefined();
      expect(robots.index).toBe(false);
      expect(robots.follow).toBe(true);
    });

    it('?page=99 also noindex,follow', async () => {
      const meta = await articlesMeta({
        searchParams: Promise.resolve({ page: '99' }),
      });
      const robots = meta.robots as { index: boolean; follow: boolean };
      expect(robots.index).toBe(false);
      expect(robots.follow).toBe(true);
    });
  });

  describe('/articles/category/[category]', () => {
    it('page 1 does not set noindex', async () => {
      const meta = await categoryMeta({
        params: Promise.resolve({ category: 'engineering' }),
        searchParams: Promise.resolve({}),
      });
      const robots = meta.robots as
        | { index?: boolean; follow?: boolean }
        | undefined;
      expect(robots?.index).not.toBe(false);
    });

    it('page 3 sets noindex,follow', async () => {
      const meta = await categoryMeta({
        params: Promise.resolve({ category: 'engineering' }),
        searchParams: Promise.resolve({ page: '3' }),
      });
      const robots = meta.robots as { index: boolean; follow: boolean };
      expect(robots.index).toBe(false);
      expect(robots.follow).toBe(true);
    });
  });

  describe('/articles/tag/[tag] (always noindex,follow)', () => {
    // Per GSC Coverage report 2026-05-23: 103 tag URLs were the bulk of
    // 132 "Discovered - currently not indexed" entries. Tag pages are
    // now noindex on every page (including page 1) and absent from the
    // sitemap. They remain accessible for user browsing via the
    // /articles/tags index.
    it('page 1 sets noindex,follow', async () => {
      const meta = await tagMeta({
        params: Promise.resolve({ tag: 'react' }),
      });
      const robots = meta.robots as { index: boolean; follow: boolean };
      expect(robots).toBeDefined();
      expect(robots.index).toBe(false);
      expect(robots.follow).toBe(true);
    });

    it('page 4 also noindex,follow (no change from page 1)', async () => {
      // Tag pages no longer differentiate based on ?page= — every paginated
      // view is noindex,follow because every tag page (paginated or not) is.
      const meta = await tagMeta({
        params: Promise.resolve({ tag: 'react' }),
      });
      const robots = meta.robots as { index: boolean; follow: boolean };
      expect(robots.index).toBe(false);
      expect(robots.follow).toBe(true);
    });
  });
});
