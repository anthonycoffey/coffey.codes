/**
 * Loader tests for portfolio frontmatter parser.
 *
 * Verifies the new `thumbnail` / `featured` / `images[]` schema introduced
 * in SPEC-034. The parser is exercised indirectly through getAllPortfolioItems()
 * by stubbing `node:fs` so we don't depend on real MDX files on disk.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { files } = vi.hoisted(() => ({ files: new Map<string, string>() }));

vi.mock('node:fs', () => ({
  default: {
    existsSync: () => true,
    readdirSync: () => Array.from(files.keys()),
    readFileSync: (filePath: string) => {
      const name = filePath.split(/[\\/]/).pop()!;
      return files.get(name) ?? '';
    },
    statSync: () => ({ mtime: new Date('2025-01-01T00:00:00Z') }),
  },
}));

import { getAllPortfolioItems } from '@/app/(site)/portfolio/utils';

const setFiles = (entries: Record<string, string>) => {
  files.clear();
  for (const [k, v] of Object.entries(entries)) files.set(k, v);
};

beforeEach(() => {
  setFiles({});
});

const FM = (lines: string[]) => `---\n${lines.join('\n')}\n---\n\nBody.`;

describe('PortfolioMetadata frontmatter parser', () => {
  it('parses thumbnail, featured, and images[] into typed fields', () => {
    setFiles({
      'sample.mdx': FM([
        'title: Sample',
        'summary: A sample.',
        'publishedAt: 2025-01-01',
        'thumbnail: /portfolio/sample-thumb.png',
        'featured: /portfolio/sample-hero.png',
        'images: [/portfolio/s-1.png, /portfolio/s-2.png, /portfolio/s-3.png]',
      ]),
    });
    const [item] = getAllPortfolioItems();
    expect(item.metadata.thumbnail).toBe('/portfolio/sample-thumb.png');
    expect(item.metadata.featured).toBe('/portfolio/sample-hero.png');
    expect(item.metadata.images).toEqual([
      '/portfolio/s-1.png',
      '/portfolio/s-2.png',
      '/portfolio/s-3.png',
    ]);
  });

  it('treats omitted media fields as undefined / empty', () => {
    setFiles({
      'bare.mdx': FM([
        'title: Bare',
        'summary: No media.',
        'publishedAt: 2025-01-01',
      ]),
    });
    const [item] = getAllPortfolioItems();
    expect(item.metadata.thumbnail).toBeUndefined();
    expect(item.metadata.featured).toBeUndefined();
    expect(item.metadata.images).toBeUndefined();
  });

  it('does NOT pick up the removed legacy fields (mainImage, gallery)', () => {
    setFiles({
      'legacy.mdx': FM([
        'title: Legacy',
        'summary: Has legacy keys.',
        'publishedAt: 2025-01-01',
        'mainImage: /portfolio/legacy.png',
        'gallery: [/portfolio/g1.png]',
      ]),
    });
    const [item] = getAllPortfolioItems();
    // Legacy keys are silently dropped — the schema is the new one.
    expect(
      (item.metadata as unknown as Record<string, unknown>).mainImage,
    ).toBeUndefined();
    expect(
      (item.metadata as unknown as Record<string, unknown>).gallery,
    ).toBeUndefined();
  });
});
