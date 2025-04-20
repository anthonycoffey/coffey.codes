import {
  getPaginatedBlogPostsByTag,
  getAllTags,
  getAllCategories,
  capitalizeWords,
  getPaginatedBlogPosts,
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
  const tags = getAllTags();

  return tags.map((tag) => ({
    tag: tag.toLowerCase(),
  }));
}

export function generateMetadata({ params }) {
  const tag = params.tag;
  const decodedTag = capitalizeWords(decodeURIComponent(tag));

  return {
    title: `Articles Tagged: ${decodedTag} | Senior Solutions Architect & AI Specialist | Anthony Coffey`,
    description: `Find software development articles by Anthony Coffey tagged with "${decodedTag}". Explore specific technologies and concepts.`,
  };
}

export default function TagPage({ params, searchParams }) {
  const page = searchParams?.page ? Number(searchParams.page) : 1;
  const itemsPerPage = 5;
  const tag = params.tag;
  const decodedTag = capitalizeWords(decodeURIComponent(tag));
  const posts = getPaginatedBlogPostsByTag(decodedTag, page, itemsPerPage);

  // Get pagination data
  const { totalPages } = posts.pagination;

  // Get popular tags for sidebar (excluding current tag)
  const popularTags = getAllTags()
    .filter((t) => t.toLowerCase() !== decodedTag.toLowerCase())
    .slice(0, 24);

  // Get categories for sidebar
  const allCategories = getAllCategories();

  if (posts.posts.length === 0) {
    notFound();
  }

  return (
    <div className="article-page max-w-6xl mx-auto">
      {/* Style header border, title, back link */}
      <div className="border-b border-gray-300 dark:border-neutral-700 pb-4 mb-6">
        <h1 className="font-bold text-3xl tracking-tighter mb-4 flex items-center dark:text-white">
          <TagIcon className="w-6 h-6 inline mr-2 text-blue-500" />
          Articles tagged with &quot;{decodedTag}&quot;
        </h1>
        <div className="mb-4">
          <Link href="/articles" className="text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300">
            ← Back to all articles
          </Link>
        </div>
      </div>

      {/* Main content with sidebar layout */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Main content area */}
        <div className="md:w-2/3">
          <BlogPosts allBlogs={posts} />
        </div>

        {/* Sidebar */}
        <aside className="md:w-1/3 space-y-6">
          {/* Style Search section */}
          <div className="bg-white dark:bg-neutral-900 p-4 rounded-lg border border-gray-200 dark:border-neutral-800 shadow-sm">
            <h2 className="text-lg font-semibold mb-3 flex items-center dark:text-white">
              <MagnifyingGlassIcon className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
              Search Articles
            </h2>
            <SearchBox />
          </div>

          {/* Style Categories section */}
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

          {/* Style Other Tags section */}
          {popularTags.length > 0 && (
            <div className="bg-white dark:bg-neutral-900 p-4 rounded-lg border border-gray-200 dark:border-neutral-800 shadow-sm">
              <h2 className="text-lg font-semibold mb-3 flex items-center dark:text-white">
                <TagIcon className="w-5 h-5 mr-2 text-blue-500" />
                Other Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((otherTag) => (
                  // Style tag chip
                  <Link
                    key={otherTag}
                    href={`/articles/tag/${encodeURIComponent(otherTag.toLowerCase())}`}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-gray-300 text-xs font-medium px-2.5 py-1.5 rounded transition-colors"
                  >
                    {otherTag}
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
          )}
        </aside>
      </div>

      {/* Centered Pagination */}
      <div className="w-full mt-8 flex justify-center">
        <Pagination totalPages={totalPages} initialPage={page} />
      </div>
    </div>
  );
}
