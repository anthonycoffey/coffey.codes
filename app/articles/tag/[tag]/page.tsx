import {
  getBlogPostsByTag,
  getAllTags,
  capitalizeWords,
} from 'app/articles/utils';
import { BlogPosts } from 'app/components/posts';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamicParams = true;

export async function generateStaticParams() {
  const tags = getAllTags();

  return tags.map((tag) => ({
    tag: tag.toLowerCase(),
  }));
}

export function generateMetadata({ params }) {
  const tag = params.tag;
  const decodedTag = capitalizeWords(decodeURIComponent(tag));

  return {
    title: `Articles tagged with "${decodedTag}" | Anthony Coffey`,
    description: `Browse all articles tagged with "${decodedTag}"`,
  };
}

export default function TagPage({ params }) {
  const tag = params.tag;
  const decodedTag = capitalizeWords(decodeURIComponent(tag));
  const posts = getBlogPostsByTag(decodedTag);

  if (posts.posts.length === 0) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">
        Articles tagged with "{decodedTag}"
      </h1>

      <div className="mb-6">
        <Link href="/articles" className="text-blue-600 hover:underline">
          ← Back to all articles
        </Link>
      </div>

      <BlogPosts allBlogs={posts} />
    </div>
  );
}
