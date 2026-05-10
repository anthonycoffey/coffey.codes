import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

vi.mock('@/app/(site)/articles/utils', () => ({
  getAllBlogPosts: vi.fn(),
}));

vi.mock('@/components/mdx', () => ({
  CustomMDX: () => null,
}));

vi.mock('@/components/GoBack', () => ({
  default: () => null,
}));

vi.mock('@/components/CommentsLazy', () => ({
  default: () => null,
}));

vi.mock('@/components/Breadcrumbs', () => ({
  default: () => null,
}));

vi.mock('next/link', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('next/image', () => ({
  default: ({
    alt,
    ...rest
  }: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => {
    const { priority, ...imgProps } = rest as React.ImgHTMLAttributes<HTMLImageElement> & {
      priority?: boolean;
    };
    // Surface priority as a data attribute the test can assert against;
    // jsdom strips React-only props otherwise.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={alt ?? ''}
        data-priority={priority ? 'true' : undefined}
        {...imgProps}
      />
    );
  },
}));

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));

import { getAllBlogPosts } from '@/app/(site)/articles/utils';
import Blog from '@/app/(site)/articles/[slug]/page';
import { baseUrl } from '@/app/sitemap';

const SAMPLE_POST = {
  slug: 'test-article',
  metadata: {
    title: 'Test Article',
    publishedAt: '2026-01-01',
    summary: 'A test summary',
    tags: ['react', 'typescript'],
    category: 'engineering',
  },
  content: 'body',
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(
    getAllBlogPosts as unknown as () => (typeof SAMPLE_POST)[],
  ).mockReturnValue([SAMPLE_POST]);
});

const findJsonLdByType = (html: string, type: string) => {
  const re =
    /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
  let match;
  while ((match = re.exec(html))) {
    try {
      const data = JSON.parse(match[1]);
      if (data['@type'] === type) return data;
    } catch {
      /* ignore */
    }
  }
  return null;
};

describe('Article page JSON-LD publisher schema', () => {
  it('emits publisher as Organization with logo (Google Article rich-result requirement)', async () => {
    const element = await Blog({
      params: Promise.resolve({ slug: 'test-article' }),
    });
    const html = renderToStaticMarkup(element);
    const blogPosting = findJsonLdByType(html, 'BlogPosting');

    expect(blogPosting).not.toBeNull();
    expect(blogPosting!.publisher).toBeDefined();
    expect(blogPosting!.publisher['@type']).toBe('Organization');
    expect(blogPosting!.publisher.name).toBe('coffey.codes');
    expect(blogPosting!.publisher.url).toBe(baseUrl);
  });

  it('publisher.logo is an ImageObject with absolute URL and dimensions', async () => {
    const element = await Blog({
      params: Promise.resolve({ slug: 'test-article' }),
    });
    const html = renderToStaticMarkup(element);
    const blogPosting = findJsonLdByType(html, 'BlogPosting');

    expect(blogPosting!.publisher.logo).toBeDefined();
    expect(blogPosting!.publisher.logo['@type']).toBe('ImageObject');
    expect(blogPosting!.publisher.logo.url).toMatch(
      /^https?:\/\/.+\/publisher-logo\.png$/,
    );
    expect(typeof blogPosting!.publisher.logo.width).toBe('number');
    expect(typeof blogPosting!.publisher.logo.height).toBe('number');
    expect(blogPosting!.publisher.logo.width).toBeGreaterThanOrEqual(112);
    expect(blogPosting!.publisher.logo.height).toBeGreaterThanOrEqual(112);
  });

  it('author remains Person (separate from publisher)', async () => {
    const element = await Blog({
      params: Promise.resolve({ slug: 'test-article' }),
    });
    const html = renderToStaticMarkup(element);
    const blogPosting = findJsonLdByType(html, 'BlogPosting');

    expect(blogPosting!.author['@type']).toBe('Person');
    expect(blogPosting!.author.name).toBe('Anthony Coffey');
  });
});

describe('Article page JSON-LD datetime hygiene', () => {
  // Schema.org permits date-only values on datePublished / dateModified,
  // but Google's Rich Results Test downgrades date-only to a
  // "missing timezone" warning. Always emit a full ISO 8601 datetime.
  const ISO_DATETIME_WITH_TZ =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})$/;

  it('datePublished is an ISO 8601 datetime with timezone, even when frontmatter is date-only', async () => {
    const element = await Blog({
      params: Promise.resolve({ slug: 'test-article' }),
    });
    const html = renderToStaticMarkup(element);
    const blogPosting = findJsonLdByType(html, 'BlogPosting');

    expect(blogPosting!.datePublished).toMatch(ISO_DATETIME_WITH_TZ);
  });

  it('dateModified is an ISO 8601 datetime with timezone', async () => {
    const element = await Blog({
      params: Promise.resolve({ slug: 'test-article' }),
    });
    const html = renderToStaticMarkup(element);
    const blogPosting = findJsonLdByType(html, 'BlogPosting');

    expect(blogPosting!.dateModified).toMatch(ISO_DATETIME_WITH_TZ);
  });
});

describe('Article page CWV image hygiene', () => {
  it('the avatar image (above the fold on every article) is marked priority and has a sizes hint', async () => {
    const element = await Blog({
      params: Promise.resolve({ slug: 'test-article' }),
    });
    const html = renderToStaticMarkup(element);

    // The avatar is the only Image rendered by the article page itself
    // (post body images are rendered inside CustomMDX which we mock).
    const imgMatch = html.match(/<img[^>]*src="\/headshot\.png"[^>]*>/);
    expect(imgMatch).not.toBeNull();
    const tag = imgMatch![0];

    expect(tag).toMatch(/data-priority="true"/);
    expect(tag).toMatch(/sizes="/);
  });
});
