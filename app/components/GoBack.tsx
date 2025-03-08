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
    <nav className="flex items-center text-sm my-4">
      <Link href="/" className="flex items-center hover:underline">
        <HomeIcon className="h-4 w-4 mr-1" />
        <span>Home</span>
      </Link>

      <span className="mx-2">•</span>

      <Link href="/articles" className="hover:underline">
        Articles
      </Link>

      {isArticlePage && (
        <>
          <span className="mx-2">•</span>
          <span className="truncate max-w-xs md:max-w-sm" title={title}>
            {title || pathname.split('/').pop()}
          </span>
        </>
      )}
    </nav>
  );
}
