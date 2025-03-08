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
      <div className="border-b pb-4 mb-4 max-w-6xl mx-auto">
        <h1 className="font-bold text-3xl lg:text-4xl tracking-tighter mb-2 flex items-center">
          <DocumentTextIcon className="w-8 h-8 inline mr-3 text-blue-600" />
          Articles
        </h1>
        <p className="text-gray-600">
          Unpacking the strategies, challenges, and breakthroughs in software
          development, project management, and cloud technology.
        </p>
      </div>
      <BlogPosts allBlogs={allBlogs} />
    </section>
  );
}
