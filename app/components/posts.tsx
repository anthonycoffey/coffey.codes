import Link from 'next/link';
import { formatDate } from 'app/blog/utils';

export function BlogPosts({ allBlogs }) {
  const { currentPage, totalPages } = allBlogs.pagination;

  return (
    <div>
      {allBlogs.posts.map((post) => (
        <Link
          key={post.slug}
          className="flex flex-col space-y-1 mb-4"
          href={`/blog/${post.slug}`}
        >
          <div className="w-full flex flex-col">
            <p className="text-neutral-900 dark:text-neutral-100 tracking-tight">
              {post.metadata.title}
            </p>
            <p className="text-neutral-600 dark:text-neutral-400">
              {formatDate(post.metadata.publishedAt, false)}
            </p>
            <p>{post.metadata.summary}</p>
          </div>
        </Link>
      ))}

      <div className="relative flex justify-between mt-4">
        {currentPage > 1 && (
          <Link
            href={`?page=${currentPage - 1}`}
            className="px-4 py-2 bg-gray-700 rounded"
          >
            Previous
          </Link>
        )}
        <span className="absolute left-1/2 transform -translate-x-1/2">
          Page {currentPage} of {totalPages}
        </span>
        {currentPage < totalPages && (
          <Link
            href={`?page=${currentPage + 1}`}
            className="px-4 py-2 bg-gray-700 rounded absolute right-0"
          >
            Next
          </Link>
        )}
      </div>
    </div>
  );
}
