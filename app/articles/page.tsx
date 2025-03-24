import { BlogPosts } from 'app/components/posts';
import { getBlogPosts, getAllTags, getAllCategories } from 'app/articles/utils';
import {
  DocumentTextIcon,
  TagIcon,
  FolderIcon,
} from '@heroicons/react/20/solid';
import Link from 'next/link';

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

  // Get the 5 most used tags and categories
  const allTags = getAllTags().slice(0, 5);
  const allCategories = getAllCategories().slice(0, 5);

  return (
    <section className="article-page">
      <div className="border-b pb-4 mb-4 max-w-6xl mx-auto">
        <h1 className="font-bold text-3xl lg:text-4xl tracking-tighter mb-2 flex items-center">
          <DocumentTextIcon className="w-8 h-8 inline mr-3 text-blue-600" />
          Articles
        </h1>
        <p className="text-gray-600 mb-4">
          Unpacking the strategies, challenges, and breakthroughs in software
          development, project management, and cloud technology.
        </p>

        <div className="flex flex-wrap gap-6 mt-4">
          {allCategories.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold flex items-center mb-2">
                <FolderIcon className="w-4 h-4 mr-1" />
                Popular Categories
              </h2>
              <div className="flex flex-wrap gap-2">
                {allCategories.map((category) => (
                  <Link
                    key={category}
                    href={`/articles/category/${category.toLowerCase()}`}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-medium px-2 py-1 rounded-full transition-colors"
                  >
                    {category}
                  </Link>
                ))}
                <Link
                  href="/articles/categories"
                  className="text-xs text-blue-600 hover:underline flex items-center"
                >
                  View all categories →
                </Link>
              </div>
            </div>
          )}

          {allTags.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold flex items-center mb-2">
                <TagIcon className="w-4 h-4 mr-1" />
                Popular Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/articles/tag/${tag.toLowerCase()}`}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium px-2 py-1 rounded transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
                <Link
                  href="/articles/tags"
                  className="text-xs text-blue-600 hover:underline flex items-center"
                >
                  View all tags →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      <BlogPosts allBlogs={allBlogs} />
    </section>
  );
}
