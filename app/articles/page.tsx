import { BlogPosts } from 'app/components/posts';
import { getBlogPosts } from 'app/articles/utils';

export const metadata = {
  title: 'Articles',
  description:
    'Articles on software development, engineering, product management, and more.',
};

export default async function Page({ searchParams }) {
  const page = searchParams.page ? Number(searchParams.page) : 1;
  const itemsPerPage = 5;
  const allBlogs = getBlogPosts(page, itemsPerPage);

  return (
    <section className="blog-page">
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">Articles</h1>
      <BlogPosts allBlogs={allBlogs} />
    </section>
  );
}
