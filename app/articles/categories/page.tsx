import { getAllCategories } from '@/app/articles/utils';
import Link from 'next/link';
import { FolderIcon } from '@heroicons/react/20/solid';

import type { Metadata } from 'next';

export function generateMetadata(): Metadata {
  return {
    title: 'Articles Categories',
    description:
      'Browse articles by category — software engineering, AI/ML, cloud computing, and web development from Anthony Coffey.',
    alternates: { canonical: '/articles/categories' },
  };
}

export default function CategoriesPage() {
  const categories = getAllCategories();
  
  return (
    <div className="pt-6 sm:pt-8">
      <div className="border-b border-border pb-4 mb-6">
        <h1 className="font-bold text-3xl lg:text-4xl mb-2 flex items-center text-c-heading">
          <FolderIcon className="w-8 h-8 inline mr-3 text-accent1-dark" />
          All Categories
        </h1>
        <div className="mb-4">
          <Link
            href="/articles"
            className="text-link hover:underline transition-colors"
          >
            ← Back to all articles
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mt-4">
        {categories.map((category) => (
          <Link
            key={category}
            href={`/articles/category/${encodeURIComponent(category.toLowerCase())}`}
            className="bg-accent2 hover:bg-surface-hover text-c-heading text-sm font-medium px-3 py-1.5 rounded-full transition-colors"
          >
            {category}
          </Link>
        ))}
      </div>

      {categories.length === 0 && (
        <p className="text-c-muted">No categories available yet.</p>
      )}
    </div>
  );
}
