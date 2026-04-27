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

export async function generateMetadata({ params }) {
  const { category } = await params;
  const decodedCategory = capitalizeWords(decodeURIComponent(category));

  return {
    title: `${decodedCategory} Articles`,
    description: `Articles categorized under ${decodedCategory} — software engineering insights and deep dives by Anthony Coffey.`,
    alternates: { canonical: `/articles/category/${encodeURIComponent(category)}` },
  };
}

export default async function CategoryPage({ params, searchParams }) {
  const resolvedSearchParams = await searchParams;
  const page = resolvedSearchParams?.page ? Number(resolvedSearchParams.page) : 1;
  const itemsPerPage = 5;
  const { category } = await params;
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
      <div className="border-b border-border pb-4 mb-6">
        <h1 className="font-bold text-3xl tracking-tighter pt-2 mb-4 flex items-center text-c-heading">
          <FolderIcon className="w-6 h-6 inline mr-2 text-accent1-dark" />
          Articles in category &quot;{decodedCategory}&quot;
        </h1>
        <div className="mb-4">
          <Link
            href="/articles"
            className="text-link hover:underline transition-colors"
          >
            ← Back to all articles
          </Link>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-1/3 space-y-6">
          <div className="bg-surface p-4 rounded-lg border border-border shadow-sm">
            <h2 className="text-lg font-semibold mb-3 flex items-center text-c-heading">
              <MagnifyingGlassIcon className="w-5 h-5 mr-2 text-c-muted" />
              Search
            </h2>
            <SearchBox />
          </div>

          {otherCategories.length > 0 && (
            <div className="bg-surface p-4 rounded-lg border border-border shadow-sm">
              <h2 className="text-lg font-semibold mb-3 flex items-center text-c-heading">
                <FolderIcon className="w-5 h-5 mr-2 text-accent1-dark" />
                Other Categories
              </h2>
              <div className="space-y-2">
                {otherCategories.map((otherCategory) => (
                  <div
                    key={otherCategory}
                    className="flex justify-between items-center"
                  >
                    <Link
                      href={`/articles/category/${encodeURIComponent(otherCategory.toLowerCase())}`}
                      className="text-c-text hover:text-link transition-colors"
                    >
                      {otherCategory}
                    </Link>
                    <span className="text-xs text-c-muted bg-bg-alt px-2 py-1 rounded-full">
                      {
                        getPaginatedBlogPostsByCategory(otherCategory, 1, 100)
                          .posts.length
                      }
                    </span>
                  </div>
                ))}
                <Link
                  href="/articles/categories"
                  className="text-sm text-link hover:underline flex items-center mt-2"
                >
                  View all categories →
                </Link>
              </div>
            </div>
          )}

          <div className="bg-surface p-4 rounded-lg border border-border shadow-sm">
            <h2 className="text-lg font-semibold mb-3 flex items-center text-c-heading">
              <TagIcon className="w-5 h-5 mr-2 text-accent1-dark" />
              Popular Tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <Link
                  key={tag}
                  href={`/articles/tag/${encodeURIComponent(tag.toLowerCase())}`}
                  className="bg-bg-alt hover:bg-surface-hover text-c-muted text-xs font-medium px-2.5 py-1.5 rounded transition-colors"
                >
                  {tag}
                </Link>
              ))}
              <Link
                href="/articles/tags"
                className="text-sm text-link hover:underline flex items-center mt-2"
              >
                View all tags →
              </Link>
            </div>
          </div>
        </aside>

        <div className="md:w-2/3">
          <BlogPosts allBlogs={posts} />
        </div>
      </div>

      <div className="w-full mt-8 flex justify-center">
        <Pagination totalPages={totalPages} initialPage={page} />
      </div>
    </div>
  );
}
