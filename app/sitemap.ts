import {
  getAllBlogPosts,
  getAllCategories,
} from '@/app/(site)/articles/utils';
import { caseStudies } from '@/app/(site)/case-studies/case-studies';
import { getAllPortfolioItems } from '@/app/(site)/portfolio/utils';

export const baseUrl = 'https://coffey.codes';

type SitemapEntry = {
  url: string;
  lastModified: string;
  changeFrequency?:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never';
  priority?: number;
};

export default async function sitemap(): Promise<SitemapEntry[]> {
  const today = new Date().toISOString().split('T')[0];

  const articles: SitemapEntry[] = getAllBlogPosts().map((post) => ({
    url: `${baseUrl}/articles/${post.slug}`,
    lastModified: post.metadata.updated ?? post.metadata.publishedAt,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const categories: SitemapEntry[] = getAllCategories().map((category) => ({
    url: `${baseUrl}/articles/category/${encodeURIComponent(category.toLowerCase())}`,
    lastModified: today,
    changeFrequency: 'weekly',
    priority: 0.5,
  }));

  // Tag pages are deliberately excluded from the sitemap. The site has 100+
  // unique tags, most of which surface only 1-2 articles each (thin /
  // near-duplicate content from Google's perspective). Per the GSC
  // Coverage report 2026-05-23, tag URLs were the bulk of 132 "Discovered
  // - currently not indexed" entries that wasted crawl budget. Tag pages
  // remain accessible for user browsing (linked from /articles and
  // /articles/tags) and are marked noindex,follow in the page metadata,
  // so internal-link equity still flows to the underlying articles.

  const caseStudyEntries: SitemapEntry[] = caseStudies.map((study) => ({
    url: `${baseUrl}/case-study/${study.slug}`,
    lastModified: today,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const portfolioItems: SitemapEntry[] = getAllPortfolioItems().map((item) => ({
    url: `${baseUrl}/portfolio/${item.slug}`,
    lastModified: item.metadata.updated ?? item.metadata.publishedAt,
    changeFrequency: 'monthly',
    priority: 0.85,
  }));

  const staticRoutes: SitemapEntry[] = [
    {
      url: `${baseUrl}/`,
      lastModified: today,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/articles`,
      lastModified: today,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/articles/categories`,
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/articles/tags`,
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/case-studies`,
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: today,
      changeFrequency: 'yearly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/lp/practical-ai`,
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/lp/smb-web-marketing`,
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/lp/sme-web-mobile`,
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/lp/strategic-partners`,
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  return [
    ...staticRoutes,
    ...articles,
    ...categories,
    ...caseStudyEntries,
    ...portfolioItems,
  ];
}
