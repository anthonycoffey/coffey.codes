import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

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

import RelatedPosts, { selectRelatedPosts } from '@/components/RelatedPosts';
import type { BlogPost } from '@/app/(site)/articles/utils';

function makePost(
  slug: string,
  overrides: Partial<BlogPost['metadata']> = {},
): BlogPost {
  return {
    slug,
    content: '',
    metadata: {
      title: `Post ${slug}`,
      publishedAt: '2025-01-01',
      summary: `Summary for ${slug}`,
      tags: [],
      ...overrides,
    },
  };
}

describe('selectRelatedPosts', () => {
  it('excludes the current post from results', () => {
    const current = makePost('current', { tags: ['react'], category: 'Web Development' });
    const other = makePost('other', { tags: ['react'], category: 'Web Development' });
    const result = selectRelatedPosts(current, [current, other], 3);
    expect(result.map((p) => p.slug)).not.toContain('current');
    expect(result.map((p) => p.slug)).toContain('other');
  });

  it('ranks candidates by number of shared tags (descending)', () => {
    const current = makePost('current', {
      tags: ['react', 'typescript', 'nextjs'],
      category: 'Web Development',
    });
    const a = makePost('a', { tags: ['react', 'typescript', 'nextjs'] }); // 3 shared
    const b = makePost('b', { tags: ['react', 'typescript'] }); // 2 shared
    const c = makePost('c', { tags: ['react'] }); // 1 shared
    const result = selectRelatedPosts(current, [current, c, a, b], 3);
    expect(result.map((p) => p.slug)).toEqual(['a', 'b', 'c']);
  });

  it('uses same-category as a tiebreaker when shared-tag counts are equal', () => {
    const current = makePost('current', {
      tags: ['react'],
      category: 'Web Development',
    });
    const sameCategory = makePost('same-cat', {
      tags: ['react'],
      category: 'Web Development',
    });
    const differentCategory = makePost('diff-cat', {
      tags: ['react'],
      category: 'Mobile Development',
    });
    const result = selectRelatedPosts(
      current,
      [current, differentCategory, sameCategory],
      3,
    );
    expect(result.map((p) => p.slug)).toEqual(['same-cat', 'diff-cat']);
  });

  it('uses publishedAt recency as a final tiebreaker', () => {
    const current = makePost('current', {
      tags: ['react'],
      category: 'Web Development',
    });
    const older = makePost('older', {
      tags: ['react'],
      category: 'Web Development',
      publishedAt: '2024-01-01',
    });
    const newer = makePost('newer', {
      tags: ['react'],
      category: 'Web Development',
      publishedAt: '2026-01-01',
    });
    const result = selectRelatedPosts(current, [current, older, newer], 3);
    expect(result.map((p) => p.slug)).toEqual(['newer', 'older']);
  });

  it('returns empty array when no candidate shares a tag or category', () => {
    const current = makePost('current', {
      tags: ['react'],
      category: 'Web Development',
    });
    const unrelated = makePost('unrelated', {
      tags: ['aws'],
      category: 'Cloud & DevOps',
    });
    const result = selectRelatedPosts(current, [current, unrelated], 3);
    expect(result).toEqual([]);
  });

  it('caps results at the requested limit', () => {
    const current = makePost('current', {
      tags: ['react'],
      category: 'Web Development',
    });
    const candidates = Array.from({ length: 8 }, (_, i) =>
      makePost(`p${i}`, { tags: ['react'], category: 'Web Development' }),
    );
    const result = selectRelatedPosts(current, [current, ...candidates], 3);
    expect(result).toHaveLength(3);
  });

  it('returns fewer results when fewer viable candidates exist', () => {
    const current = makePost('current', {
      tags: ['react'],
      category: 'Web Development',
    });
    const one = makePost('one', { tags: ['react'] });
    const unrelated = makePost('unrelated', { tags: ['aws'] });
    const result = selectRelatedPosts(current, [current, one, unrelated], 3);
    expect(result.map((p) => p.slug)).toEqual(['one']);
  });

  it('treats tag matching as case-insensitive and trimmed', () => {
    const current = makePost('current', {
      tags: ['React ', 'TypeScript'],
      category: 'Web Development',
    });
    const matchy = makePost('matchy', { tags: ['react', 'typescript'] });
    const result = selectRelatedPosts(current, [current, matchy], 3);
    expect(result.map((p) => p.slug)).toEqual(['matchy']);
  });
});

describe('<RelatedPosts />', () => {
  it('renders a section with up to 3 article links', () => {
    const current = makePost('current', {
      tags: ['react'],
      category: 'Web Development',
    });
    const a = makePost('a', {
      tags: ['react'],
      category: 'Web Development',
      title: 'A Title',
    });
    const b = makePost('b', {
      tags: ['react'],
      category: 'Web Development',
      title: 'B Title',
    });

    render(<RelatedPosts current={current} candidates={[current, a, b]} />);

    expect(screen.getByRole('heading', { name: /related/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /A Title/ })).toHaveAttribute(
      'href',
      '/articles/a',
    );
    expect(screen.getByRole('link', { name: /B Title/ })).toHaveAttribute(
      'href',
      '/articles/b',
    );
  });

  it('renders nothing when there are no related candidates', () => {
    const current = makePost('current', {
      tags: ['react'],
      category: 'Web Development',
    });
    const unrelated = makePost('unrelated', {
      tags: ['aws'],
      category: 'Cloud & DevOps',
    });
    const { container } = render(
      <RelatedPosts current={current} candidates={[current, unrelated]} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
