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
import Image from 'next/image';
// Removed ThemeSwitcher import

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
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close menu on mobile when navigating to a new page
  useEffect(() => {
    if (isMobile) {
      setIsMenuOpen(false);
    }
  }, [pathname, isMobile]);

  // Set initial menu state based on screen size
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };

    // Call once on mount
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Navigation item rendering function
  const renderNavItems = () => {
    return Object.entries(navItems).map(([path, { name, icon }]) => {
      const isActive = path === pathname;

      return (
        <Link
          key={path}
          href={path}
          className={`flex items-center text-sm transition-all hover:text-gray-300 ${
            isActive ? 'font-normal' : 'font-normal'
          }`}
        >
          {icon}
          <span>{name}</span>
        </Link>
      );
    });
  };

  return (
    // Apply theme-aware background and text colors
    <aside className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white tracking-tight w-full">
      <div className="px-4 py-2">
        {/* Logo and mobile menu button */}
        <div className="flex items-center justify-between md:justify-center">
          <Link href="/" className="block">
            <Image
              width={300}
              height={82}
              src="/logo-horizontal.svg"
              alt="logo"
              className="h-16 w-auto bg-black/80 rounded-md"
              priority
            />
          </Link>

          {/* Container for mobile menu button */}
          <div className="flex items-center md:hidden">
            {/* Removed ThemeSwitcher */}
            <button
              className="p-2 ml-2 text-white" // Added margin
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div> {/* <-- Added missing closing div tag here */}
        </div>

        {/* Desktop Navigation - Always visible on desktop, hidden on mobile */}
        <div className="hidden md:block py-4">
          <nav className="flex justify-center items-center relative"> {/* Added relative positioning */}
            <div className="flex flex-row space-x-6">{renderNavItems()}</div>
            {/* Removed ThemeSwitcher container */}
          </nav>
        </div>

        {/* Mobile Navigation - Only visible when menu is open on mobile */}
        {isMobile && isMenuOpen && (
          <div className="py-4 md:hidden">
            <nav className="flex flex-col">
              <div className="flex flex-col space-y-3">{renderNavItems()}</div>
            </nav>
          </div>
        )}
      </div>
    </aside>
  );
}
