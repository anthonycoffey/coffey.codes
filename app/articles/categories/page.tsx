import { getAllCategories } from '@/app/articles/utils';
import Link from 'next/link';

export function generateMetadata() {
  return {
    title: 'All Article Categories | Anthony Coffey',
    description: 'Browse articles by category on topics like software engineering, AI, cloud computing, and web development from Anthony Coffey.',
  };
}

export default function CategoriesPage() {
  const categories = getAllCategories();
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 dark:text-white">All Categories</h1>
      
      <div className="mb-6">
        {/* Style back link */}
        <Link href="/articles" className="text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300">
          ← Back to all articles
        </Link>
      </div>
      
      <div className="flex flex-wrap gap-3 mt-4">
        {categories.map((category) => (
          // Style category chip
          <Link
            key={category}
            href={`/articles/category/${encodeURIComponent(category.toLowerCase())}`}
            className="bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-200 text-sm font-medium px-3 py-1.5 rounded-full transition-colors"
          >
            {category}
          </Link>
        ))}
      </div>
      
      {categories.length === 0 && (
        // Style "No categories" message
        <p className="text-gray-600 dark:text-gray-400">No categories available yet.</p>
      )}
    </div>
  );
}
