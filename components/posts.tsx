import Link from 'next/link';
import { formatDate } from '@/utils/date';

export function BlogPosts({ allBlogs }) {
  return (
    <div className="space-y-8">
      {allBlogs.posts.map((post) => (
        // Add dark mode bg, border, hover styles to post container
        <div key={post.slug} className="p-6 mb-4 bg-surface rounded-lg border border-border hover:bg-surface-hover transition duration-300">
          <div className="w-full flex flex-col space-y-2">
            <Link href={`/articles/${post.slug}`} className="block">
              <h4 className="font-outfit text-lg font-bold text-c-heading hover:text-link">
                {post.metadata.title}
              </h4>
            </Link>
            <p className="text-sm text-c-muted">
              {formatDate(post.metadata.publishedAt, false)}
            </p>
            <p className="text-base text-c-text">{post.metadata.summary}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {post.metadata.category && (
                <Link
                  href={`/articles/category/${encodeURIComponent(post.metadata.category.toLowerCase())}`}
                  className="inline-block bg-accent2 text-c-heading text-xs font-medium px-2.5 py-0.5 rounded-full hover:bg-surface-hover"
                >
                  {post.metadata.category}
                </Link>
              )}
              {post.metadata.tags && post.metadata.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/articles/tag/${encodeURIComponent(tag.toLowerCase())}`}
                  className="inline-block bg-bg-alt text-c-muted text-xs font-medium px-2.5 py-0.5 rounded hover:bg-surface-hover"
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
