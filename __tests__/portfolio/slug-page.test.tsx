import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

vi.mock('@/app/(site)/portfolio/utils', () => ({
  getPortfolioItem: vi.fn(),
  getAllPortfolioItems: vi.fn(),
}));

vi.mock('@/components/mdx', () => ({
  CustomMDX: () => null,
}));

vi.mock('@/components/Breadcrumbs', () => ({
  default: () => null,
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
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

vi.mock('@heroicons/react/24/outline', () => ({
  ArrowTopRightOnSquareIcon: () => null,
  CodeBracketSquareIcon: () => null,
  TagIcon: () => null,
}));

vi.mock('@/app/sitemap', () => ({
  baseUrl: 'https://coffey.codes',
}));

vi.mock('@/utils/date', () => ({
  formatDate: (d: string) => d,
}));

import {
  getPortfolioItem,
  getAllPortfolioItems,
} from '@/app/(site)/portfolio/utils';
import PortfolioItemPage, {
  generateStaticParams,
} from '@/app/(site)/portfolio/[slug]/page';

const SAMPLE_ITEM = {
  slug: 'coffey-codes',
  metadata: {
    title: 'coffey.codes — Personal Blog & Portfolio',
    summary: 'A performant, SEO-optimized personal site.',
    publishedAt: '2023-01-01',
    tags: ['Next.js', 'TypeScript', 'MDX'],
    mainImage: '/portfolio/coffey.codes-portfolio.png',
    link: 'https://coffey.codes',
    client: 'Personal Project',
    year: '2023',
    featured: true,
    category: 'Web Development',
  },
  content: '## Overview\n\nThis is the content.',
  mtime: '2023-01-01T00:00:00.000Z',
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getPortfolioItem).mockImplementation((slug: string) =>
    slug === 'coffey-codes' ? SAMPLE_ITEM : null,
  );
  vi.mocked(getAllPortfolioItems).mockReturnValue([SAMPLE_ITEM]);
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

describe('PortfolioItemPage', () => {
  it('renders the project title from frontmatter', async () => {
    const element = await PortfolioItemPage({
      params: Promise.resolve({ slug: 'coffey-codes' }),
    });
    const html = renderToStaticMarkup(element);
    // HTML-encodes & → &amp; in static markup
    expect(html).toMatch(/coffey\.codes.*Personal Blog.*Portfolio/i);
  });

  it('renders the summary', async () => {
    const element = await PortfolioItemPage({
      params: Promise.resolve({ slug: 'coffey-codes' }),
    });
    const html = renderToStaticMarkup(element);
    expect(html).toContain('A performant, SEO-optimized personal site.');
  });

  it('renders tech stack tag chips', async () => {
    const element = await PortfolioItemPage({
      params: Promise.resolve({ slug: 'coffey-codes' }),
    });
    const html = renderToStaticMarkup(element);
    expect(html).toContain('Next.js');
    expect(html).toContain('TypeScript');
    expect(html).toContain('MDX');
  });

  it('renders a "View live" link when metadata.link is set', async () => {
    const element = await PortfolioItemPage({
      params: Promise.resolve({ slug: 'coffey-codes' }),
    });
    const html = renderToStaticMarkup(element);
    expect(html).toContain('View live');
    expect(html).toContain('https://coffey.codes');
  });

  it('renders a "View on GitHub" link when metadata.repo is set', async () => {
    const itemWithRepo = {
      ...SAMPLE_ITEM,
      metadata: {
        ...SAMPLE_ITEM.metadata,
        repo: 'https://github.com/anthonycoffey/coffey.codes',
      },
    };
    vi.mocked(getPortfolioItem).mockReturnValue(itemWithRepo);
    const element = await PortfolioItemPage({
      params: Promise.resolve({ slug: 'coffey-codes' }),
    });
    const html = renderToStaticMarkup(element);
    expect(html).toContain('View on GitHub');
    expect(html).toContain('https://github.com/anthonycoffey/coffey.codes');
  });

  it('calls notFound() for an unknown slug', async () => {
    vi.mocked(getPortfolioItem).mockReturnValue(null);
    await expect(
      PortfolioItemPage({ params: Promise.resolve({ slug: 'unknown-slug' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('emits a CreativeWork JSON-LD block with correct fields', async () => {
    const element = await PortfolioItemPage({
      params: Promise.resolve({ slug: 'coffey-codes' }),
    });
    const html = renderToStaticMarkup(element);
    const schema = findJsonLdByType(html, 'CreativeWork');

    expect(schema).not.toBeNull();
    expect(schema!.name).toBe('coffey.codes — Personal Blog & Portfolio');
    expect(schema!.description).toBe('A performant, SEO-optimized personal site.');
    expect(schema!.url).toBe('https://coffey.codes/portfolio/coffey-codes');
    expect(schema!.author['@type']).toBe('Person');
    expect(schema!.author.name).toBe('Anthony Coffey');
  });

  it('emits a BreadcrumbList JSON-LD block', async () => {
    const element = await PortfolioItemPage({
      params: Promise.resolve({ slug: 'coffey-codes' }),
    });
    const html = renderToStaticMarkup(element);
    const schema = findJsonLdByType(html, 'BreadcrumbList');

    expect(schema).not.toBeNull();
    expect(schema!.itemListElement).toHaveLength(3);
    expect(schema!.itemListElement[1].name).toBe('Portfolio');
    expect(schema!.itemListElement[2].name).toBe(
      'coffey.codes — Personal Blog & Portfolio',
    );
  });

  it('datePublished in JSON-LD is a full ISO 8601 datetime with timezone', async () => {
    const element = await PortfolioItemPage({
      params: Promise.resolve({ slug: 'coffey-codes' }),
    });
    const html = renderToStaticMarkup(element);
    const schema = findJsonLdByType(html, 'CreativeWork');

    const ISO_DATETIME_WITH_TZ =
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})$/;
    expect(schema!.datePublished).toMatch(ISO_DATETIME_WITH_TZ);
  });
});

describe('generateStaticParams', () => {
  it('includes coffey-codes, drum-machine, simply-voice, piano-scale-visualizer slugs', async () => {
    const allItems = [
      { slug: 'coffey-codes', metadata: SAMPLE_ITEM.metadata, content: '' },
      {
        slug: 'drum-machine',
        metadata: { ...SAMPLE_ITEM.metadata, title: 'React Drum Machine' },
        content: '',
      },
      {
        slug: 'simply-voice',
        metadata: { ...SAMPLE_ITEM.metadata, title: 'Simply Voice' },
        content: '',
      },
      {
        slug: 'piano-scale-visualizer',
        metadata: {
          ...SAMPLE_ITEM.metadata,
          title: 'Piano Scale Visualizer',
        },
        content: '',
      },
    ];
    vi.mocked(getAllPortfolioItems).mockReturnValue(allItems);

    const params = await generateStaticParams();
    const slugs = params.map((p) => p.slug);
    expect(slugs).toContain('coffey-codes');
    expect(slugs).toContain('drum-machine');
    expect(slugs).toContain('simply-voice');
    expect(slugs).toContain('piano-scale-visualizer');
  });
});
