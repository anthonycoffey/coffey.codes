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
    // Style container border and text color
    <nav className="flex items-center text-sm my-4 border-b pb-6 mb-6 border-gray-300 dark:border-neutral-700 text-gray-600 dark:text-gray-400">
      {/* Style Home link */}
      <Link href="/" className="flex items-center hover:underline dark:hover:text-gray-200">
        <HomeIcon className="h-4 w-4 mr-1" />
        <span>Home</span>
      </Link>

      {/* Style separator */}
      <span className="mx-2">•</span>

      {/* Style Articles link */}
      <Link href="/articles" className="hover:underline dark:hover:text-gray-200">
        Articles
      </Link>

      {isArticlePage && (
        <>
          {/* Style separator */}
          <span className="mx-2">•</span>
          {/* Style final non-link title */}
          <span className="truncate max-w-xs md:max-w-sm text-gray-800 dark:text-gray-200" title={title}>
            {title || pathname.split('/').pop()}
          </span>
        </>
      )}
    </nav>
  );
}
