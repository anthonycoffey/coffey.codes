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
    'Articles | Anthony Coffey - Solutions Architect, AI/ML',
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
      <div className="border-b border-border pb-4 mb-6">
        <h1 className="font-outfit font-bold text-3xl lg:text-4xl tracking-tighter mb-2 flex items-center text-c-heading">
          <DocumentTextIcon className="w-8 h-8 inline mr-3 text-accent1-dark" />
          Articles
        </h1>
        <p className="text-c-muted mb-4">
          Unpacking the strategies, challenges, and breakthroughs in software
          development, project management, and cloud technology.
        </p>
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

          <div className="bg-surface p-4 rounded-lg border border-border shadow-sm">
            <h2 className="text-lg font-semibold mb-3 flex items-center text-c-heading">
              <FolderIcon className="w-5 h-5 mr-2 text-accent1-dark" />
              Categories
            </h2>
            <div className="space-y-2">
              {allCategories.map((category) => (
                <div key={category} className="flex justify-between items-center">
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
                          post.metadata.category.toLowerCase() === category.toLowerCase(),
                      ).length
                    }
                  </span>
                </div>
              ))}
              <Link href="/articles/categories" className="text-sm text-link hover:underline flex items-center mt-2">
                View all categories →
              </Link>
            </div>
          </div>

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
              <Link href="/articles/tags" className="text-sm text-link hover:underline flex items-center mt-2">
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
