/**
 * Portfolio item loader.
 *
 * Mirrors the pattern in app/(site)/articles/utils.ts: each portfolio
 * item is an MDX file under app/(site)/portfolio/items/<slug>.mdx with
 * frontmatter for metadata and an MDX body.
 *
 * Used by the dynamic route at app/(site)/portfolio/[slug]/page.tsx
 * and (for hard-coded fallbacks) by the listing at app/(site)/portfolio/page.tsx.
 */

import fs from 'node:fs';
import path from 'node:path';

export interface PortfolioMetadata {
  /** Display title, used in <h1> and metadata. */
  title: string;
  /** One-sentence summary. Used in card descriptions, OG, meta description. */
  summary: string;
  /** ISO date when the item was published / last updated. */
  publishedAt: string;
  /** Optional explicit update date. */
  updated?: string;
  /** Tech stack chips. */
  tags?: string[];
  /**
   * Listing thumbnail — image shown on the `/portfolio` index card.
   * Optimized for card aspect / crop. Falls back to `featured` when omitted.
   */
  thumbnail?: string;
  /**
   * Featured / hero image — the "main" shot used on the detail page hero
   * and as the first slot in the media gallery. Path under /public.
   */
  featured?: string;
  /**
   * Additional gallery images (excluding `featured`). Rendered on the
   * detail page in declared order, after `featured`. Path under /public.
   */
  images?: string[];
  /** Primary external link (live demo, repo). */
  link?: string;
  /** Source code repo (optional second link distinct from `link`). */
  repo?: string;
  /** Client or "Personal Project". */
  client?: string;
  /** Year (for the card grid). */
  year?: string;
  /** Optional category, e.g. "Open Source", "Client Work". */
  category?: string;
}

export interface PortfolioItem {
  slug: string;
  metadata: PortfolioMetadata;
  content: string;
  mtime?: string;
}

const ITEMS_DIR = path.join(
  process.cwd(),
  'app',
  '(site)',
  'portfolio',
  'items',
);

function parseFrontmatter(raw: string): {
  metadata: PortfolioMetadata;
  content: string;
} {
  const fmRegex = /---\s*([\s\S]*?)\s*---/;
  const match = fmRegex.exec(raw);
  if (!match) {
    throw new Error('Portfolio item: no frontmatter block found');
  }
  const fmBlock = match[1] ?? '';
  const content = raw.replace(fmRegex, '').trim();

  const metadata: Partial<PortfolioMetadata> = {};

  // Simple parser: key: value per line. `tags` and `images` are
  // comma-separated arrays; everything else is a scalar string.
  for (const line of fmBlock.trim().split('\n')) {
    const sep = line.indexOf(':');
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim();
    let value = line.slice(sep + 1).trim();
    // Strip surrounding single/double quotes
    value = value.replace(/^['"](.*)['"]$/, '$1');

    switch (key) {
      case 'tags':
        metadata.tags = value
          .replace(/^\[|\]$/g, '')
          .split(',')
          .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
          .filter(Boolean);
        break;
      case 'images':
        metadata.images = value
          .replace(/^\[|\]$/g, '')
          .split(',')
          .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
          .filter(Boolean);
        break;
      case 'title':
      case 'summary':
      case 'publishedAt':
      case 'updated':
      case 'thumbnail':
      case 'featured':
      case 'link':
      case 'repo':
      case 'client':
      case 'year':
      case 'category':
        (metadata as Record<string, string>)[key] = value;
        break;
      default:
        // Ignore unknown keys
        break;
    }
  }

  if (!metadata.title || !metadata.summary || !metadata.publishedAt) {
    throw new Error(
      'Portfolio item: missing required frontmatter (title, summary, publishedAt)',
    );
  }

  return { metadata: metadata as PortfolioMetadata, content };
}

function getMdxFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => path.extname(f) === '.mdx');
}

function readItem(filePath: string): {
  metadata: PortfolioMetadata;
  content: string;
  mtime: string;
} {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const mtime = fs.statSync(filePath).mtime.toISOString();
  return { ...parseFrontmatter(raw), mtime };
}

/** All portfolio items, sorted by publishedAt descending. */
export function getAllPortfolioItems(): PortfolioItem[] {
  return getMdxFiles(ITEMS_DIR)
    .map((file): PortfolioItem => {
      const { metadata, content, mtime } = readItem(path.join(ITEMS_DIR, file));
      const slug = path.basename(file, '.mdx');
      return { slug, metadata, content, mtime };
    })
    .sort((a, b) => {
      const ad = new Date(a.metadata.publishedAt).getTime();
      const bd = new Date(b.metadata.publishedAt).getTime();
      return bd - ad;
    });
}

/** Single item by slug; null when not found. */
export function getPortfolioItem(slug: string): PortfolioItem | null {
  return getAllPortfolioItems().find((p) => p.slug === slug) ?? null;
}
