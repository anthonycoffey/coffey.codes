'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon } from '@heroicons/react/20/solid';

interface BreadcrumbsProps {
  title?: string;
}

export default function Breadcrumbs({ title }: BreadcrumbsProps) {
  const pathname = usePathname();
  const isArticlePage = pathname.startsWith('/articles/');

  return (
    <nav className="flex items-center text-sm my-4 border-b pb-4 mb-6 border-border text-c-muted">
      <Link
        href="/"
        className="flex items-center hover:text-c-heading hover:underline transition-colors"
      >
        <HomeIcon className="h-4 w-4 mr-1" />
        <span>Home</span>
      </Link>

      <span className="mx-2">•</span>

      <Link
        href="/articles"
        className="hover:text-c-heading hover:underline transition-colors"
      >
        Articles
      </Link>

      {isArticlePage && (
        <>
          <span className="mx-2">•</span>
          <span className="truncate text-c-heading" title={title}>
            {title || pathname.split('/').pop()}
          </span>
        </>
      )}
    </nav>
  );
}
