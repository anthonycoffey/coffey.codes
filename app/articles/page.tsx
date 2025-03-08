import { BlogPosts } from 'components/posts';
import { getBlogPosts } from 'app/articles/utils';
import { DocumentTextIcon } from '@heroicons/react/20/solid';
import { Fragment } from 'react';

export const metadata = {
  title: 'Articles',
  description:
    'Unpacking the strategies, challenges, and breakthroughs in software development, project management, and cloud technology.',
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
      <p className="mb-4">
        Unpacking the strategies, challenges, and breakthroughs in software
        development, project management, and cloud technology.
      </p>
      <BlogPosts allBlogs={allBlogs} />
    </section>
  );
}
