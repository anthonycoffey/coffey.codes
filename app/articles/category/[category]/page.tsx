import {
  getBlogPostsByCategory,
  getAllCategories,
  getAllTags,
  capitalizeWords
} from 'app/articles/utils';
import { BlogPosts } from 'app/components/posts';
import Pagination from 'app/articles/Pagination';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TagIcon, FolderIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import SearchBox from 'app/components/SearchBox';

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
    title: `Articles in category "${decodedCategory}" | Anthony Coffey`,
    description: `Browse all articles in the "${decodedCategory}" category`,
  };
}

export default function CategoryPage({ params, searchParams }) {
  const page = searchParams?.page ? Number(searchParams.page) : 1;
  const itemsPerPage = 5;
  const category = params.category;
  const decodedCategory = capitalizeWords(decodeURIComponent(category));
  
  // Get other categories for sidebar (excluding current category)
  const otherCategories = getAllCategories()
    .filter(c => c.toLowerCase() !== decodedCategory.toLowerCase());
  
  // Get popular tags for sidebar
  const popularTags = getAllTags().slice(0, 8);

  const posts = getBlogPostsByCategory(decodedCategory, page, itemsPerPage);
  
  // Get pagination data
  const { totalPages } = posts.pagination;

  if (posts.posts.length === 0) {
    console.log(`No posts found for category: '${decodedCategory}'`);
    notFound();
  }

  return (
    <div className="article-page max-w-6xl mx-auto">
      <div className="border-b pb-4 mb-6">
        <h1 className="font-bold text-3xl tracking-tighter mb-4 flex items-center">
          <FolderIcon className="w-6 h-6 inline mr-2 text-blue-500" />
          Articles in category "{decodedCategory}"
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
          
          {/* Other categories section */}
          {otherCategories.length > 0 && (
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold mb-3 flex items-center">
                <FolderIcon className="w-5 h-5 mr-2 text-blue-500" />
                Other Categories
              </h2>
              <div className="space-y-2">
                {otherCategories.map((otherCategory) => (
                  <div key={otherCategory} className="flex justify-between items-center">
                    <Link
                      href={`/articles/category/${encodeURIComponent(otherCategory.toLowerCase())}`}
                      className="text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      {otherCategory}
                    </Link>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {getBlogPostsByCategory(otherCategory, 1, 100).posts.length}
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
          )}
          
          {/* Tags section */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold mb-3 flex items-center">
              <TagIcon className="w-5 h-5 mr-2 text-blue-500" />
              Popular Tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <Link
                  key={tag}
                  href={`/articles/tag/${encodeURIComponent(tag.toLowerCase())}`}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-1.5 rounded transition-colors"
                >
                  {tag}
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
        </aside>
      </div>
      
      {/* Centered Pagination */}
      <div className="w-full mt-8 flex justify-center">
        <Pagination totalPages={totalPages} initialPage={page} />
      </div>
    </div>
  );
}
