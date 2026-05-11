import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

vi.mock('@/components/Breadcrumbs', () => ({
  default: () => null,
}));
vi.mock('@/components/GoBack', () => ({
  default: () => null,
}));
vi.mock('@/app/(site)/case-study/[slug]/CaseStudyBrief', () => ({
  default: () => null,
}));
vi.mock('@/app/(site)/case-study/[slug]/CaseStudyStory', () => ({
  default: () => null,
}));
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));

import CaseStudyPage from '@/app/(site)/case-study/[slug]/page';
import { caseStudies } from '@/app/(site)/case-studies/case-studies';
import { baseUrl } from '@/app/sitemap';

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

describe('Case study page JSON-LD publisher schema', () => {
  const slug = caseStudies[0].slug;

  it('emits Article publisher as Organization with logo', async () => {
    const element = await CaseStudyPage({
      params: Promise.resolve({ slug }),
    });
    const html = renderToStaticMarkup(element);
    const article = findJsonLdByType(html, 'Article');

    expect(article).not.toBeNull();
    expect(article!.publisher['@type']).toBe('Organization');
    expect(article!.publisher.name).toBe('coffey.codes');
    expect(article!.publisher.url).toBe(baseUrl);
    expect(article!.publisher.logo['@type']).toBe('ImageObject');
    expect(article!.publisher.logo.url).toMatch(
      /\/publisher-logo\.png$/,
    );
  });

  it('keeps author as Person (separate from publisher)', async () => {
    const element = await CaseStudyPage({
      params: Promise.resolve({ slug }),
    });
    const html = renderToStaticMarkup(element);
    const article = findJsonLdByType(html, 'Article');

    expect(article!.author['@type']).toBe('Person');
    expect(article!.author.name).toBe('Anthony Coffey');
  });
});
