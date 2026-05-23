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

vi.mock('@/components/ShareButtons', () => ({
  default: () => null,
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
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

describe('Article page video schema (when frontmatter has youtubeId)', () => {
  const VIDEO_POST = {
    slug: 'video-article',
    metadata: {
      title: 'A Video Article',
      publishedAt: '2026-05-10',
      summary: 'An article that embeds a video',
      tags: ['video'],
      category: 'engineering',
      youtubeId: 'TEST_VIDEO_ID',
    },
    content: 'body',
  };

  it('emits a nested VideoObject inside BlogPosting when youtubeId is set', async () => {
    vi.mocked(
      getAllBlogPosts as unknown as () => (typeof VIDEO_POST)[],
    ).mockReturnValue([VIDEO_POST]);

    const element = await Blog({
      params: Promise.resolve({ slug: 'video-article' }),
    });
    const html = renderToStaticMarkup(element);
    const blogPosting = findJsonLdByType(html, 'BlogPosting');

    expect(blogPosting!.video).toBeDefined();
    expect(blogPosting!.video['@type']).toBe('VideoObject');
    expect(blogPosting!.video.name).toBe('A Video Article');
    expect(blogPosting!.video.thumbnailUrl).toMatch(
      /^https:\/\/img\.youtube\.com\/vi\/TEST_VIDEO_ID\//,
    );
    expect(blogPosting!.video.embedUrl).toBe(
      'https://www.youtube.com/embed/TEST_VIDEO_ID',
    );
    expect(blogPosting!.video.contentUrl).toBe(
      'https://www.youtube.com/watch?v=TEST_VIDEO_ID',
    );
    // Google's Rich Results Test flags date-only uploadDate as a
    // "missing timezone" warning. Same fix as datePublished /
    // dateModified: ISO 8601 datetime with timezone.
    const ISO_DATETIME_WITH_TZ =
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})$/;
    expect(blogPosting!.video.uploadDate).toMatch(ISO_DATETIME_WITH_TZ);
  });

  it('does NOT emit a video field when youtubeId is absent', async () => {
    vi.mocked(
      getAllBlogPosts as unknown as () => (typeof SAMPLE_POST)[],
    ).mockReturnValue([SAMPLE_POST]);

    const element = await Blog({
      params: Promise.resolve({ slug: 'test-article' }),
    });
    const html = renderToStaticMarkup(element);
    const blogPosting = findJsonLdByType(html, 'BlogPosting');

    expect(blogPosting!.video).toBeUndefined();
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

describe('Article page `updated` frontmatter -> BlogPosting.dateModified', () => {
  // Locks in SPEC-030 WS2a: frontmatter `updated:` is the editorial signal for
  // a substantive edit (title, meta description, body). When present, it MUST
  // be the dateModified Google sees in JSON-LD.
  it('dateModified reads from `updated` when set (precedence over mtime / publishedAt)', async () => {
    const POST_WITH_UPDATED = {
      slug: 'updated-article',
      metadata: {
        title: 'An Updated Article',
        publishedAt: '2025-01-01',
        updated: '2026-05-22',
        summary: 'Refreshed for the WS1 metadata sprint',
        tags: ['react'],
        category: 'engineering',
      },
      content: 'body',
      // mtime is a much more recent date — `updated` should still win.
      mtime: '2026-11-30T00:00:00.000Z',
    };
    vi.mocked(
      getAllBlogPosts as unknown as () => (typeof POST_WITH_UPDATED)[],
    ).mockReturnValue([POST_WITH_UPDATED]);

    const element = await Blog({
      params: Promise.resolve({ slug: 'updated-article' }),
    });
    const html = renderToStaticMarkup(element);
    const blogPosting = findJsonLdByType(html, 'BlogPosting');

    expect(blogPosting!.dateModified).toBe('2026-05-22T00:00:00.000Z');
  });
});

describe('Article page renders RelatedPosts (SPEC-030 WS3 wiring)', () => {
  // Locks in that the article template actually mounts the RelatedPosts
  // component. RelatedPosts' own ranking logic is tested in
  // __tests__/components/RelatedPosts.test.tsx — this just guards the wiring.
  it('renders the "Related articles" section when other tag-overlap candidates exist', async () => {
    const CURRENT = {
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
    const SIBLING = {
      slug: 'sibling-article',
      metadata: {
        title: 'Sibling Article',
        publishedAt: '2026-02-01',
        summary: 'Shares tags with the current article',
        tags: ['react', 'typescript'],
        category: 'engineering',
      },
      content: 'body',
    };
    vi.mocked(
      getAllBlogPosts as unknown as () => (typeof CURRENT)[],
    ).mockReturnValue([CURRENT, SIBLING]);

    const element = await Blog({
      params: Promise.resolve({ slug: 'test-article' }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toMatch(/Related articles/);
    expect(html).toMatch(/Sibling Article/);
    expect(html).toMatch(/href="\/articles\/sibling-article"/);
  });

  it('renders no related-posts section when no candidates share tags or category', async () => {
    const CURRENT = {
      slug: 'test-article',
      metadata: {
        title: 'Test Article',
        publishedAt: '2026-01-01',
        summary: 'A test summary',
        tags: ['react'],
        category: 'engineering',
      },
      content: 'body',
    };
    const UNRELATED = {
      slug: 'unrelated',
      metadata: {
        title: 'Unrelated',
        publishedAt: '2026-02-01',
        summary: 'No tag overlap, different category',
        tags: ['aws'],
        category: 'cloud-and-devops',
      },
      content: 'body',
    };
    vi.mocked(
      getAllBlogPosts as unknown as () => (typeof CURRENT)[],
    ).mockReturnValue([CURRENT, UNRELATED]);

    const element = await Blog({
      params: Promise.resolve({ slug: 'test-article' }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).not.toMatch(/Related articles/);
    expect(html).not.toMatch(/href="\/articles\/unrelated"/);
  });
});
