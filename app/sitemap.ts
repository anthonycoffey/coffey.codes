import { getRSSBlogPosts } from 'app/articles/utils';

export const baseUrl = 'https://coffey.codes';

export default async function sitemap() {
  let articles = getRSSBlogPosts().map((post) => ({
    url: `${baseUrl}/articles/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }));

  let routes = ['/', '/contact', '/articles'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }));

  return [...routes, ...articles];
}
