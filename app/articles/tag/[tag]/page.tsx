import {
  getBlogPostsByTag,
  getAllTags,
  getAllCategories,
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
  const tags = getAllTags();

  return tags.map((tag) => ({
    tag: tag.toLowerCase(),
  }));
}

export function generateMetadata({ params }) {
  const tag = params.tag;
  const decodedTag = capitalizeWords(decodeURIComponent(tag));

  return {
    title: `Articles tagged with "${decodedTag}" | Anthony Coffey`,
    description: `Browse all articles tagged with "${decodedTag}"`,
  };
}

export default function TagPage({ params, searchParams }) {
  const page = searchParams?.page ? Number(searchParams.page) : 1;
  const itemsPerPage = 5;
  const tag = params.tag;
  const decodedTag = capitalizeWords(decodeURIComponent(tag));
  const posts = getBlogPostsByTag(decodedTag, page, itemsPerPage);

  // Get pagination data
  const { totalPages } = posts.pagination;

  // Get popular tags for sidebar (excluding current tag)
  const popularTags = getAllTags()
    .filter((t) => t.toLowerCase() !== decodedTag.toLowerCase())
    .slice(0, 8);

  // Get categories for sidebar
  const allCategories = getAllCategories();

  if (posts.posts.length === 0) {
    notFound();
  }

  return (
    <div className="article-page max-w-6xl mx-auto">
      <div className="border-b pb-4 mb-6">
        <h1 className="font-bold text-3xl tracking-tighter mb-4 flex items-center">
          <TagIcon className="w-6 h-6 inline mr-2 text-blue-500" />
          Articles tagged with "{decodedTag}"
        </h1>
        <div className="mb-4">
          <Link href="/articles" className="text-blue-600 hover:underline">
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
          {/* Search box */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold mb-3 flex items-center">
              <MagnifyingGlassIcon className="w-5 h-5 mr-2 text-gray-500" />
              Search Articles
            </h2>
            <SearchBox />
          </div>

          {/* Categories section */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold mb-3 flex items-center">
              <FolderIcon className="w-5 h-5 mr-2 text-blue-500" />
              Categories
            </h2>
            <div className="space-y-2">
              {allCategories.map((category) => (
                <div
                  key={category}
                  className="flex justify-between items-center"
                >
                  <Link
                    href={`/articles/category/${encodeURIComponent(category.toLowerCase())}`}
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    {category}
                  </Link>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {
                      getBlogPostsByTag(decodedTag, 1, 100).posts.filter(
                        (post) =>
                          post.metadata.category &&
                          post.metadata.category.toLowerCase() ===
                            category.toLowerCase(),
                      ).length
                    }
                  </span>
                </div>
              ))}
              <Link
                href="/articles/categories"
                className="text-sm text-blue-600 hover:underline flex items-center mt-2"
              >
                View all categories →
              </Link>
            </div>
          </div>

          {/* Other tags section */}
          {popularTags.length > 0 && (
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold mb-3 flex items-center">
                <TagIcon className="w-5 h-5 mr-2 text-blue-500" />
                Other Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((otherTag) => (
                  <Link
                    key={otherTag}
                    href={`/articles/tag/${encodeURIComponent(otherTag.toLowerCase())}`}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-1.5 rounded transition-colors"
                  >
                    {otherTag}
                  </Link>
                ))}
                <Link
                  href="/articles/tags"
                  className="text-sm text-blue-600 hover:underline flex items-center mt-2"
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
