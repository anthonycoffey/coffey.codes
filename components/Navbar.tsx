'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  ClipboardDocumentCheckIcon,
  Bars3Icon,
  XMarkIcon,
  BriefcaseIcon,
} from '@heroicons/react/20/solid';
import ThemeToggle from './ThemeToggle';

const navItems: Record<string, { name: string; icon: React.ReactNode }> = {
  '/': {
    name: 'home',
    icon: <HomeIcon className="h-4 w-4 mr-1" />,
  },
  '/portfolio': {
    name: 'portfolio',
    icon: <BriefcaseIcon className="h-4 w-4 mr-1" />,
  },
  '/articles': {
    name: 'articles',
    icon: <DocumentTextIcon className="h-4 w-4 mr-1" />,
  },
  '/case-studies': {
    name: 'case studies',
    icon: <ClipboardDocumentCheckIcon className="h-4 w-4 mr-1" />,
  },
  '/contact': {
    name: 'contact',
    icon: <EnvelopeIcon className="h-4 w-4 mr-1" />,
  },
};

export default function Navbar() {
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (isMobile) setIsMenuOpen(false);
  }, [pathname, isMobile]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderNavItems = () =>
    Object.entries(navItems).map(([path, { name, icon }]) => {
      const isActive = path === '/' ? pathname === '/' : pathname.startsWith(path);
      return (
        <Link
          key={path}
          href={path}
          className={`flex items-center text-sm transition-colors rounded-full px-3 py-1.5 ${
            isActive
              ? 'bg-accent2 text-c-heading font-semibold'
              : 'text-c-text hover:bg-surface-hover'
          }`}
        >
          {icon}
          <span>{name}</span>
        </Link>
      );
    });

  return (
    <aside className="sticky top-0 z-50 bg-bg border-b-2 border-border tracking-tight w-full">
      <div className="max-w-7xl mx-auto px-4 py-2">
        {/* Logo row */}
        <div className="flex items-center justify-between">
          <Link href="/">
            <Image
              width={300}
              height={82}
              src="/logo-horizontal.svg"
              alt="Anthony Coffey logo"
              className="h-14 w-auto"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {renderNavItems()}
            <ThemeToggle className="ml-2" />
          </nav>

          {/* Mobile controls */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              className="p-2 text-c-text hover:bg-surface-hover rounded-full transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobile && isMenuOpen && (
          <nav className="py-3 md:hidden flex flex-col gap-1">
            {renderNavItems()}
          </nav>
        )}
      </div>
    </aside>
  );
}
