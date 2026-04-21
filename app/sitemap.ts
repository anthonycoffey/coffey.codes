import { getAllBlogPosts, getAllCategories, getAllTags } from '@/app/articles/utils';

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
    lastModified: post.metadata.publishedAt,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const categories: SitemapEntry[] = getAllCategories().map((category) => ({
    url: `${baseUrl}/articles/category/${encodeURIComponent(category.toLowerCase())}`,
    lastModified: today,
    changeFrequency: 'weekly',
    priority: 0.5,
  }));

  const tags: SitemapEntry[] = getAllTags().map((tag) => ({
    url: `${baseUrl}/articles/tag/${encodeURIComponent(tag.toLowerCase())}`,
    lastModified: today,
    changeFrequency: 'weekly',
    priority: 0.4,
  }));

  const staticRoutes: SitemapEntry[] = [
    { url: `${baseUrl}/`, lastModified: today, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/articles`, lastModified: today, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/articles/categories`, lastModified: today, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/articles/tags`, lastModified: today, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/portfolio`, lastModified: today, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: today, changeFrequency: 'yearly', priority: 0.7 },
    { url: `${baseUrl}/lp/practical-ai`, lastModified: today, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/lp/smb-web-marketing`, lastModified: today, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/lp/sme-web-mobile`, lastModified: today, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/lp/strategic-partners`, lastModified: today, changeFrequency: 'monthly', priority: 0.8 },
  ];

  return [...staticRoutes, ...articles, ...categories, ...tags];
}
