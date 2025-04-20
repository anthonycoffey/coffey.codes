import { BlogPosts } from '@/components/posts';
import {
  getPaginatedBlogPosts,
  getAllTags,
  getAllCategories,
} from '@/app/articles/utils';
import Pagination from '@/components/Pagination';
import {
  DocumentTextIcon,
  TagIcon,
  FolderIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/20/solid';
import Link from 'next/link';
import SearchBox from '@/components/SearchBox';

export const metadata = {
  title:
    'Software Development Articles & Insights | Anthony Coffey - Solutions Architect, AI/ML',
  description:
    'Explore articles by Anthony Coffey, Solutions Architect & AI/ML Specialist, on software engineering, AI/ML integration, cloud architecture, web development best practices, and project management strategies.',
};

export default async function ArticlesPage({ searchParams }) {
  const params = await searchParams;
  const page = params.page ? Number(params.page) : 1;
  const itemsPerPage = 5;
  const allBlogs = getPaginatedBlogPosts(page, itemsPerPage);

  const popularTags = getAllTags().slice(0, 24);
  const allCategories = getAllCategories();

  return (
    <div className="article-page mx-auto">
      {/* Add dark mode border and text color */}
      <div className="border-b border-gray-300 dark:border-neutral-700 pb-4 mb-6">
        <h1 className="font-bold text-3xl lg:text-4xl tracking-tighter mb-2 flex items-center">
          <DocumentTextIcon className="w-8 h-8 inline mr-3 text-blue-600" />
          Articles
        </h1>
        {/* Add dark mode text color */}
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Unpacking the strategies, challenges, and breakthroughs in software
          development, project management, and cloud technology.
        </p>
      </div>

      <div className="flex flex-col md:flex-row-reverse gap-8">
        <aside className="md:w-1/3 space-y-6">
          {/* Add dark mode bg, border, text to Search section */}
          <div className="bg-white dark:bg-neutral-900 p-4 rounded-lg border border-gray-200 dark:border-neutral-800 shadow-sm">
            <h2 className="text-lg font-semibold mb-3 flex items-center dark:text-white">
              <MagnifyingGlassIcon className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
              Search
            </h2>
            <SearchBox />
          </div>

          {/* Add dark mode bg, border, text to Categories section */}
          <div className="bg-white dark:bg-neutral-900 p-4 rounded-lg border border-gray-200 dark:border-neutral-800 shadow-sm">
            <h2 className="text-lg font-semibold mb-3 flex items-center dark:text-white">
              <FolderIcon className="w-5 h-5 mr-2 text-blue-500" />
              Categories
            </h2>
            <div className="space-y-2">
              {allCategories.map((category) => (
                <div
                  key={category}
                  className="flex justify-between items-center"
                >
                  {/* Style category link */}
                  <Link
                    href={`/articles/category/${encodeURIComponent(category.toLowerCase())}`}
                    className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors"
                  >
                    {category}
                  </Link>
                  {/* Style category count badge */}
                  <span className="text-xs text-gray-500 bg-gray-100 dark:bg-neutral-800 dark:text-gray-400 px-2 py-1 rounded-full">
                    {
                      getPaginatedBlogPosts(1, 100).posts.filter(
                        (post) =>
                          post.metadata.category &&
                          post.metadata.category.toLowerCase() ===
                            category.toLowerCase(),
                      ).length
                    }
                  </span>
                </div>
              ))}
              {/* Style "View all" link */}
              <Link
                href="/articles/categories"
                className="text-sm text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300 flex items-center mt-2"
              >
                View all categories →
              </Link>
            </div>
          </div>

          {/* Add dark mode bg, border, text to Tags section */}
          <div className="bg-white dark:bg-neutral-900 p-4 rounded-lg border border-gray-200 dark:border-neutral-800 shadow-sm">
            <h2 className="text-lg font-semibold mb-3 flex items-center dark:text-white">
              <TagIcon className="w-5 h-5 mr-2 text-blue-500" />
              Popular Tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                // Correctly style tag link/chip
                <Link
                  key={tag}
                  href={`/articles/tag/${encodeURIComponent(tag.toLowerCase())}`}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-gray-300 text-xs font-medium px-2.5 py-1.5 rounded transition-colors"
                >
                  {tag}
                </Link>
              ))}
              {/* Correctly style "View all" link */}
              <Link
                href="/articles/tags"
                className="text-sm text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300 flex items-center mt-2"
              >
                View all tags →
              </Link>
            </div>
          </div>
        </aside>

        <div className="md:w-2/3">
          <BlogPosts allBlogs={allBlogs} />
        </div>
      </div>

      <div className="w-full mt-8 flex justify-center">
        <Pagination
          totalPages={allBlogs.pagination.totalPages}
          initialPage={page}
        />
      </div>
    </div>
  );
}
