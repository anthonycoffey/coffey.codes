import {
  getPaginatedBlogPostsByTag,
  getAllTags,
  getAllCategories,
  capitalizeWords,
  getPaginatedBlogPosts,
} from '@/app/(site)/articles/utils';
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
import PageHeader from '@/components/PageHeader';

export const dynamicParams = true;

export async function generateStaticParams() {
  const tags = getAllTags();

  return tags.map((tag) => ({
    tag: tag.toLowerCase(),
  }));
}

export async function generateMetadata({ params, searchParams }) {
  const { tag } = await params;
  const resolvedSearchParams = await searchParams;
  const isPaginated =
    resolvedSearchParams?.page && Number(resolvedSearchParams.page) > 1;
  const decodedTag = capitalizeWords(decodeURIComponent(tag));
  const title = `${decodedTag} Articles`;
  const description = `Articles tagged ${decodedTag} — technical write-ups and deep dives by Anthony Coffey.`;
  const url = `/articles/tag/${encodeURIComponent(tag)}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: isPaginated ? { index: false, follow: true } : undefined,
    openGraph: { type: 'website', url, title, description },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function TagPage({ params, searchParams }) {
  const resolvedSearchParams = await searchParams;
  const page = resolvedSearchParams?.page
    ? Number(resolvedSearchParams.page)
    : 1;
  const itemsPerPage = 5;
  const { tag } = await params;
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
    <>
      <PageHeader
        title={<>Articles tagged with &quot;{decodedTag}&quot;</>}
        icon={TagIcon}
      >
        <Link
          href="/articles"
          className="text-link hover:underline transition-colors"
        >
          ← Back to all articles
        </Link>
      </PageHeader>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-1/3 space-y-6">
          <div className="bg-surface p-4 rounded-lg border border-border shadow-sm">
            <h2 className="text-lg font-semibold mb-3 flex items-center text-c-heading">
              <MagnifyingGlassIcon className="w-5 h-5 mr-2 text-c-muted" />
              Search
            </h2>
            <SearchBox />
          </div>

          <div className="bg-surface p-4 rounded-lg border border-border shadow-sm">
            <h2 className="text-lg font-semibold mb-3 flex items-center text-c-heading">
              <FolderIcon className="w-5 h-5 mr-2 text-accent1-dark" />
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
                    className="text-c-text hover:text-link transition-colors"
                  >
                    {category}
                  </Link>

                  <span className="text-xs text-c-muted bg-bg-alt px-2 py-1 rounded-full">
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
              <Link
                href="/articles/categories"
                className="text-sm text-link hover:underline flex items-center mt-2"
              >
                View all categories →
              </Link>
            </div>
          </div>

          {popularTags.length > 0 && (
            <div className="bg-surface p-4 rounded-lg border border-border shadow-sm">
              <h2 className="text-lg font-semibold mb-3 flex items-center text-c-heading">
                <TagIcon className="w-5 h-5 mr-2 text-accent1-dark" />
                Other Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((otherTag) => (
                  <Link
                    key={otherTag}
                    href={`/articles/tag/${encodeURIComponent(otherTag.toLowerCase())}`}
                    className="bg-bg-alt hover:bg-surface-hover text-c-muted text-xs font-medium px-2.5 py-1.5 rounded transition-colors"
                  >
                    {otherTag}
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
          )}
        </aside>

        {/* Main content area */}
        <div className="md:w-2/3">
          <BlogPosts allBlogs={posts} />
        </div>
      </div>

      {/* Centered Pagination */}
      <div className="w-full mt-8 flex justify-center">
        <Pagination totalPages={totalPages} initialPage={page} />
      </div>
    </>
  );
}
