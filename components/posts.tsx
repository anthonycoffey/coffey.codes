import Link from 'next/link';
import { formatDate } from '@/utils/date';

export function BlogPosts({ allBlogs }) {
  return (
    <div className="space-y-8">
      {allBlogs.posts.map((post) => (
        // Add dark mode bg, border, hover styles to post container
        <div key={post.slug} className="p-6 mb-4 bg-white dark:bg-neutral-900 rounded-lg shadow-md dark:border dark:border-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-800 transition duration-300">
          <div className="w-full flex flex-col space-y-2">
            <Link
              href={`/articles/${post.slug}`}
              className="block"
            >
              {/* Style title */}
              <h4 className="text-lg font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                {post.metadata.title}
              </h4>
            </Link>
            {/* Style date */}
            <p className="text-sm text-gray-500 dark:text-gray-400">
              
              {formatDate(post.metadata.publishedAt, false)}
            </p>
            {/* Style summary */}
            <p className="text-base text-gray-700 dark:text-gray-300">{post.metadata.summary}</p>
            
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {post.metadata.category && (
                // Style category chip
                <Link
                  href={`/articles/category/${encodeURIComponent(post.metadata.category.toLowerCase())}`}
                  className="inline-block bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-medium px-2.5 py-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800"
                >
                  {post.metadata.category}
                </Link>
              )}
              
              {post.metadata.tags && post.metadata.tags.map((tag) => (
                // Style tag chip
                <Link
                  key={tag}
                  href={`/articles/tag/${encodeURIComponent(tag.toLowerCase())}`}
                  className="inline-block bg-gray-100 text-gray-800 dark:bg-neutral-800 dark:text-gray-300 text-xs font-medium px-2.5 py-0.5 rounded hover:bg-gray-200 dark:hover:bg-neutral-700"
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
