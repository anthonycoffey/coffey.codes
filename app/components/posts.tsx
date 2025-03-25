import Link from 'next/link';
import { formatDate } from 'app/articles/utils';

export function BlogPosts({ allBlogs }) {
  return (
    <div className="space-y-8">
      {allBlogs.posts.map((post) => (
        <div key={post.slug} className="p-6 mb-4 bg-white rounded-lg shadow-md hover:bg-gray-100 transition duration-300">
          <div className="w-full flex flex-col space-y-2">
            <Link
              href={`/articles/${post.slug}`}
              className="block"
            >
              <h4 className="text-lg font-bold text-gray-900 hover:text-blue-600">
                {post.metadata.title}
              </h4>
            </Link>
            <p className="text-sm text-gray-500">
              
              {formatDate(post.metadata.publishedAt, false)}
            </p>
            <p className="text-base text-gray-700">{post.metadata.summary}</p>
            
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {post.metadata.category && (
                <Link
                  href={`/articles/category/${encodeURIComponent(post.metadata.category.toLowerCase())}`}
                  className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full hover:bg-blue-200"
                >
                  {post.metadata.category}
                </Link>
              )}
              
              {post.metadata.tags && post.metadata.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/articles/tag/${encodeURIComponent(tag.toLowerCase())}`}
                  className="inline-block bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded hover:bg-gray-200"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}