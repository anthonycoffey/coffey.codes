import { getAllBlogPosts } from '@/app/articles/utils';

export const baseUrl = 'https://coffey.codes';

export default async function sitemap() {
  const articles = getAllBlogPosts().map((post) => ({
    url: `${baseUrl}/articles/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }));

  const routes = ['/', '/contact', '/articles', '/case-studies'].map(
    (route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date().toISOString().split('T')[0],
    }),
  );

  return [...routes, ...articles];
}
