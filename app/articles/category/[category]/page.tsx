import {
  getBlogPostsByCategory,
  getAllCategories,
  capitalizeWords,
} from 'app/articles/utils';
import { BlogPosts } from 'app/components/posts';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamicParams = true;

export async function generateStaticParams() {
  const categories = getAllCategories();

  const params = categories.map((category) => {
    const slug = category.toLowerCase().trim();
    console.log(`Category param: ${slug}`);
    return {
      category: slug,
    };
  });

  return params;
}

export function generateMetadata({ params }) {
  const category = params.category;
  const decodedCategory = capitalizeWords(decodeURIComponent(category));

  return {
    title: `Articles in category "${decodedCategory}" | Anthony Coffey`,
    description: `Browse all articles in the "${decodedCategory}" category`,
  };
}

export default function CategoryPage({ params }) {
  const category = params.category;
  const decodedCategory = capitalizeWords(decodeURIComponent(category));

  console.log(
    `CategoryPage: Looking for posts with category '${decodedCategory}'`,
  );

  // Get all available categories for debugging
  const availableCategories = getAllCategories();
  console.log('Available categories:', availableCategories);

  const posts = getBlogPostsByCategory(decodedCategory);

  if (posts.posts.length === 0) {
    console.log(`No posts found for category: '${decodedCategory}'`);
    notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">
        Articles in category "{decodedCategory}"
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
