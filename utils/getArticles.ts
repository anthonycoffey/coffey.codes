import { Article } from "types/article";

const importAll = (r): Promise<Article[]> =>
  Promise.all(
    r.keys().map(async (fileName) => {
      const module = r(fileName);
      const slug = fileName.substr(2).replace(/\/page\.mdx$/, "");

      return {
        slug,
        metadata: module?.metadata,
        component: module?.default,
        readingTime: module?.metadata_readingTime,
      };
    }),
  );

export const getAllArticles = async (): Promise<Article[]> => {
  const allArticles = await importAll(
    //@ts-ignore
    require.context("../app/articles/", true, /^\.\/[^\/]+\/page\.mdx$/),
  );

  // Sort articles by date in descending order (most recent first)
  allArticles.sort((a, b) => {
    const dateA: number = new Date(a.metadata.date).valueOf();
    const dateB: number = new Date(b.metadata.date).valueOf();
    return dateB - dateA;
  });

  return allArticles;
};

export const getArticleBySlug = async (slug: string): Promise<Article> => {
  const module = require(`../app/articles/${slug}/page.mdx`);

  return {
    slug,
    component: module?.default,
    metadata: module?.metadata,
    readingTime: module?.metadata_readingTime,
  };
};
