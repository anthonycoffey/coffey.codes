import Link from 'next/link';
import { formatDate } from 'app/blog/utils';
import Pagination from '../blog/Pagination';

export function BlogPosts({ allBlogs }) {
  const { currentPage, totalPages } = allBlogs.pagination;

  return (
    <>
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
      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </>
  );
}
