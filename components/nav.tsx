'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
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

const navItems = {
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

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close menu on mobile when navigating to a new page
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsMenuOpen(false);
    }
  }, [pathname]);

  // Set initial menu state based on screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMenuOpen(window.innerWidth >= 768);
    };

    // Call once on mount
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <aside className="bg-gray-900 text-white tracking-tight w-full">
      <div className="px-4 py-2">
        {/* Logo and mobile menu button */}
        <div className="flex items-center justify-between md:justify-center">
          <Link href="/" className="block">
            <img src="/logo-horizontal.svg" alt="logo" className="h-16" />
          </Link>

          <button
            className="md:hidden p-2 text-white"
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

        {/* Navigation items */}
        {isMenuOpen && (
          <div className="py-4">
            <nav className="flex flex-col md:flex-row md:justify-center md:items-center">
              <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-6">
                {Object.entries(navItems).map(([path, { name, icon }]) => {
                  const isActive = path === pathname;

                  return (
                    <Link
                      key={path}
                      href={path}
                      className={`flex items-center text-sm transition-all hover:text-gray-300 ${
                        isActive ? 'font-bold' : 'font-normal'
                      }`}
                    >
                      {icon}
                      <span>{name}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
        )}
      </div>
    </aside>
  );
}