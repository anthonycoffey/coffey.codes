import { getRSSBlogPosts } from 'app/articles/utils';

export const baseUrl = 'https://coffey.codes';

export default async function sitemap() {
  let blogs = getRSSBlogPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }));

  let routes = ['', '/blog'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }));

  return [...routes, ...blogs];
}
