import { getAllTags } from '@/app/articles/utils';
import Link from 'next/link';
import { TagIcon } from '@heroicons/react/20/solid';
import PageHeader from '@/components/PageHeader';

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
    <>
      <PageHeader title="All Tags" icon={TagIcon}>
        <Link
          href="/articles"
          className="text-link hover:underline transition-colors"
        >
          ← Back to all articles
        </Link>
      </PageHeader>

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
    </>
  );
}
