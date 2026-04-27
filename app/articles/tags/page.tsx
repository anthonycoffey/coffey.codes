import { getAllTags } from '@/app/articles/utils';
import Link from 'next/link';
import { TagIcon } from '@heroicons/react/20/solid';

import type { Metadata } from 'next';

export function generateMetadata(): Metadata {
  return {
    title: 'Articles Tags',
    description:
      'Browse articles by tag — React, Next.js, AWS, AI/ML, Git, and other technologies covered by Anthony Coffey.',
    alternates: { canonical: '/articles/tags' },
  };
}

export default function TagsPage() {
  const tags = getAllTags();
  
  return (
    <div>
      <div className="border-b border-border pb-4 mb-6">
        <h1 className="font-bold text-3xl tracking-tighter pt-2 mb-4 flex items-center text-c-heading">
          <TagIcon className="w-6 h-6 inline mr-2 text-accent1-dark" />
          All Tags
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
        {tags.map((tag) => (
          <Link
            key={tag}
            href={`/articles/tag/${encodeURIComponent(tag.toLowerCase())}`}
            className="bg-bg-alt hover:bg-surface-hover text-c-muted text-sm font-medium px-3 py-1.5 rounded transition-colors"
          >
            {tag}
          </Link>
        ))}
      </div>

      {tags.length === 0 && (
        <p className="text-c-muted">No tags available yet.</p>
      )}
    </div>
  );
}
