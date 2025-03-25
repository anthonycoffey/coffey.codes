import { getAllCategories } from '@/app/articles/utils';
import Link from 'next/link';

export function generateMetadata() {
  return {
    title: 'All Categories | Anthony Coffey',
    description: 'Browse all available categories for articles',
  };
}

export default function CategoriesPage() {
  const categories = getAllCategories();
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">All Categories</h1>
      
      <div className="mb-6">
        <Link href="/articles" className="text-blue-600 hover:underline">
          ← Back to all articles
        </Link>
      </div>
      
      <div className="flex flex-wrap gap-3 mt-4">
        {categories.map((category) => (
          <Link
            key={category}
            href={`/articles/category/${encodeURIComponent(category.toLowerCase())}`}
            className="bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm font-medium px-3 py-1.5 rounded-full transition-colors"
          >
            {category}
          </Link>
        ))}
      </div>
      
      {categories.length === 0 && (
        <p className="text-gray-600">No categories available yet.</p>
      )}
    </div>
  );
}