import Link from 'next/link';
import { formatDate } from 'app/articles/utils';
import Pagination from '../articles/Pagination';

export function BlogPosts({ allBlogs }) {
  const { currentPage, totalPages } = allBlogs.pagination;

  return (
    <div className="space-y-4">
      {allBlogs.posts.map((post) => (
        <Link
          key={post.slug}
          className="flex flex-col mb-4"
          href={`/articles/${post.slug}`}
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
      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}
