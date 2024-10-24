import { BlogPosts } from 'app/components/posts';
import { getBlogPosts } from 'app/articles/utils';
import { DocumentTextIcon } from '@heroicons/react/20/solid';
import { Fragment } from 'react';

export const metadata = {
  title: 'Articles',
  description:
    'Articles on software development, engineering, product management, and more.',
};

export default async function Page({ searchParams }) {
  const params = await searchParams;
  const page = params.page ? Number(params.page) : 1;
  const itemsPerPage = 5;
  const allBlogs = getBlogPosts(page, itemsPerPage);

  return (
    <section className="article-page">
      <h1 className="font-semibold text-2xl lg:text-3xl tracking-tighter">
        <DocumentTextIcon className="w-6 h-6 inline mr-2" /> Articles
      </h1>
      <p className="text-neutral-200 mb-4">
        Welcome to my blog! Discover articles on software engineering, systems
        design and product management.
      </p>
      <BlogPosts allBlogs={allBlogs} />
    </section>
  );
}
