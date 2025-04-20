import {
  getPaginatedBlogPostsByCategory,
  getAllCategories,
  getAllTags,
  capitalizeWords,
} from '@/app/articles/utils';
import { BlogPosts } from '@/components/posts';
import Pagination from '@/components/Pagination';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  TagIcon,
  FolderIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/20/solid';
import SearchBox from '@/components/SearchBox';

export const dynamicParams = true;

export async function generateStaticParams() {
  const categories = getAllCategories();

  const params = categories.map((category) => {
    const slug = category.toLowerCase().trim();
    return {
      category: slug,
    };
  });

  return params;
}

export function generateMetadata({ params }) {
  const category = params.category;
  const decodedCategory = capitalizeWords(decodeURIComponent(category));

  return {
    title: `Articles in Category: ${decodedCategory} | Senior Solutions Architect & AI Specialist | Anthony Coffey`,
    description: `Explore software development articles by Anthony Coffey categorized under "${decodedCategory}". Find insights on relevant topics.`,
  };
}

export default function CategoryPage({ params, searchParams }) {
  const page = searchParams?.page ? Number(searchParams.page) : 1;
  const itemsPerPage = 5;
  const category = params.category;
  const decodedCategory = capitalizeWords(decodeURIComponent(category));

  const otherCategories = getAllCategories().filter(
    (c) => c.toLowerCase() !== decodedCategory.toLowerCase(),
  );

  const popularTags = getAllTags().slice(0, 24);

  const posts = getPaginatedBlogPostsByCategory(
    decodedCategory,
    page,
    itemsPerPage,
  );

  const { totalPages } = posts.pagination;

  if (posts.posts.length === 0) {
    notFound();
  }

  return (
    <div className="article-page max-w-6xl mx-auto">
      {/* Style header border, title, back link */}
      <div className="border-b border-gray-300 dark:border-neutral-700 pb-4 mb-6">
        <h1 className="font-bold text-3xl tracking-tighter mb-4 flex items-center dark:text-white">
          <FolderIcon className="w-6 h-6 inline mr-2 text-blue-500" />
          Articles in category &quot;{decodedCategory}&quot;
        </h1>
        <div className="mb-4">
          <Link href="/articles" className="text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300">
            ← Back to all articles
          </Link>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-2/3">
          <BlogPosts allBlogs={posts} />
        </div>

        <aside className="md:w-1/3 space-y-6">
          {/* Style Search section */}
          <div className="bg-white dark:bg-neutral-900 p-4 rounded-lg border border-gray-200 dark:border-neutral-800 shadow-sm">
            <h2 className="text-lg font-semibold mb-3 flex items-center dark:text-white">
              <MagnifyingGlassIcon className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
              Search Articles
            </h2>
            <SearchBox />
          </div>

          {otherCategories.length > 0 && (
            // Style Other Categories section
            <div className="bg-white dark:bg-neutral-900 p-4 rounded-lg border border-gray-200 dark:border-neutral-800 shadow-sm">
              <h2 className="text-lg font-semibold mb-3 flex items-center dark:text-white">
                <FolderIcon className="w-5 h-5 mr-2 text-blue-500" />
                Other Categories
              </h2>
              <div className="space-y-2">
                {otherCategories.map((otherCategory) => (
                  <div
                    key={otherCategory}
                    className="flex justify-between items-center"
                  >
                    {/* Style category link */}
                    <Link
                      href={`/articles/category/${encodeURIComponent(otherCategory.toLowerCase())}`}
                      className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors"
                    >
                      {otherCategory}
                    </Link>
                    {/* Style category count badge */}
                    <span className="text-xs text-gray-500 bg-gray-100 dark:bg-neutral-800 dark:text-gray-400 px-2 py-1 rounded-full">
                      {
                        getPaginatedBlogPostsByCategory(otherCategory, 1, 100)
                          .posts.length
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
          )}

          {/* Style Popular Tags section */}
          <div className="bg-white dark:bg-neutral-900 p-4 rounded-lg border border-gray-200 dark:border-neutral-800 shadow-sm">
            <h2 className="text-lg font-semibold mb-3 flex items-center dark:text-white">
              <TagIcon className="w-5 h-5 mr-2 text-blue-500" />
              Popular Tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                // Style tag chip
                <Link
                  key={tag}
                  href={`/articles/tag/${encodeURIComponent(tag.toLowerCase())}`}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-gray-300 text-xs font-medium px-2.5 py-1.5 rounded transition-colors"
                >
                  {tag}
                </Link>
              ))}
              {/* Style "View all" link */}
              <Link
                href="/articles/tags"
                className="text-sm text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300 flex items-center mt-2"
              >
                View all tags →
              </Link>
            </div>
          </div>
        </aside>
      </div>

      <div className="w-full mt-8 flex justify-center">
        <Pagination totalPages={totalPages} initialPage={page} />
      </div>
    </div>
  );
}
