'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon } from '@heroicons/react/20/solid';

interface BreadcrumbParent {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  title?: string;
  parents?: BreadcrumbParent[];
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function Breadcrumbs({ title, parents }: BreadcrumbsProps) {
  const pathname = usePathname();
  
  let derivedParents = parents;
  
  if (!derivedParents) {
    const segments = pathname.split('/').filter(Boolean);
    
    if (pathname.startsWith('/articles')) {
      derivedParents = [{ label: 'Articles', href: '/articles' }];
    } else if (pathname.startsWith('/case-study')) {
      derivedParents = [{ label: 'Case Studies', href: '/case-studies' }];
    } else if (pathname.startsWith('/portfolio')) {
      derivedParents = [{ label: 'Portfolio', href: '/portfolio' }];
    } else if (segments.length > 1) {
      // Generic fallback for any other route depth > 1
      const rootSegment = segments[0];
      derivedParents = [{ 
        label: rootSegment.split('-').map(capitalize).join(' '), 
        href: `/${rootSegment}` 
      }];
    } else {
      derivedParents = [];
    }
  }

  const isDeepPage = derivedParents.length > 0 || pathname.split('/').filter(Boolean).length > 1;

  return (
    <nav className="flex items-center flex-wrap gap-y-2 text-sm my-4 border-b pb-4 mb-6 border-border text-c-muted">
      <Link
        href="/"
        className="flex items-center hover:text-c-heading hover:underline transition-colors whitespace-nowrap"
      >
        <HomeIcon className="h-4 w-4 mr-1" />
        <span>Home</span>
      </Link>

      {derivedParents.map((parent, idx) => (
        <div key={idx} className="flex items-center whitespace-nowrap">
          <span className="mx-2 text-c-muted/50">•</span>
          <Link
            href={parent.href}
            className="hover:text-c-heading hover:underline transition-colors"
          >
            {parent.label}
          </Link>
        </div>
      ))}

      {isDeepPage && (
        <div className="flex items-center overflow-hidden">
          <span className="mx-2 text-c-muted/50">•</span>
          <span className="truncate text-c-heading font-medium" title={title}>
            {title || pathname.split('/').pop()}
          </span>
        </div>
      )}
    </nav>
  );
}
