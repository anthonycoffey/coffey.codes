import { getAllCategories } from '@/app/articles/utils';
import Link from 'next/link';
import { FolderIcon } from '@heroicons/react/20/solid';
import PageHeader from '@/components/PageHeader';

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
    <>
      <PageHeader title="All Categories" icon={FolderIcon}>
        <Link
          href="/articles"
          className="text-link hover:underline transition-colors"
        >
          ← Back to all articles
        </Link>
      </PageHeader>

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
    </>
  );
}
