import Link from 'next/link';
import { formatDate } from 'app/articles/utils';
import Pagination from '../app/articles/Pagination';

export function BlogPosts({ allBlogs }) {
  const { currentPage, totalPages } = allBlogs.pagination;

  return (
    <div className="space-y-8">
      {allBlogs.posts.map((post) => (
        <Link
          key={post.slug}
          className="block p-6 mb-4 bg-white rounded-lg shadow-md hover:bg-gray-100 transition duration-300"
          href={`/articles/${post.slug}`}
        >
          <div className="w-full flex flex-col space-y-2">
            <p className="text-2xl font-bold text-gray-900">
              {post.metadata.title}
            </p>
            <p className="text-sm text-gray-500">
              {formatDate(post.metadata.publishedAt, false)}
            </p>
            <p className="text-base text-gray-700">{post.metadata.summary}</p>
          </div>
        </Link>
      ))}
      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}
