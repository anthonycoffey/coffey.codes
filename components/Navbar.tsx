'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const pathname = usePathname();
  const isOverlay = pathname === '/';

  // Hide on scroll-down, reveal on scroll-up (headroom pattern).
  // Always visible above the fold, when the mobile menu is open, or on
  // route change.
  useEffect(() => {
    setHidden(false);
    lastScrollY.current = typeof window !== 'undefined' ? window.scrollY : 0;
  }, [pathname]);

  useEffect(() => {
    // Homepage uses overlay chrome over the hero — keep it pinned and
    // never run the headroom hide/reveal there.
    if (isOverlay) {
      setHidden(false);
      return;
    }

    const SHOW_ABOVE = 30; // px from top — never hide while above the fold
    const DELTA = 3;       // px direction threshold — prevents jitter

    const onScroll = () => {
      const y = window.scrollY;
      const last = lastScrollY.current;

      if (isMenuOpen) {
        setHidden(false);
      } else if (y < SHOW_ABOVE) {
        setHidden(false);
      } else if (y > last + DELTA) {
        setHidden(true);
      } else if (y < last - DELTA) {
        setHidden(false);
      }
      lastScrollY.current = y;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isMenuOpen, isOverlay]);

  // Navbar is always a dark chrome (transparent over hero on home, solid
  // brand-blue elsewhere), so the white-on-dark logo is always correct.
  const logoSrc = '/logo-horizontal.svg';

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
      const isActive =
        path === '/' ? pathname === '/' : pathname.startsWith(path);
      return (
        <Link
          key={path}
          href={path}
          className={`flex items-center text-sm transition-colors rounded-full px-3 py-1.5 ${
            isActive
              ? 'bg-white/15 text-white font-semibold'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          {icon}
          <span>{name}</span>
        </Link>
      );
    });

  return (
    <aside
      className={`z-50 w-full tracking-tight transition-[transform,colors] duration-300 ease-out will-change-transform ${
        hidden ? '-translate-y-full' : 'translate-y-0'
      } ${
        isOverlay
          ? 'fixed top-0 bg-transparent border-none'
          : 'sticky top-0 bg-nav border-b border-nav-border shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-2">
        {/* Logo row */}
        <div className="flex items-center justify-between">
          <Link href="/">
            <Image
              width={300}
              height={82}
              src={logoSrc}
              alt="Anthony Coffey logo"
              className="h-14 w-auto"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {renderNavItems()}
            {!isOverlay && (
              <ThemeToggle variant="chrome" className="ml-2" />
            )}
          </nav>

          {/* Mobile controls */}
          <div className="flex items-center gap-2 md:hidden">
            {!isOverlay && <ThemeToggle variant="chrome" />}
            <button
              className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
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
          <nav
            className={`py-3 md:hidden flex flex-col gap-1 ${
              isOverlay
                ? 'bg-black/60 backdrop-blur-sm rounded-xl px-2 mt-1'
                : 'px-2 mt-1'
            }`}
          >
            {renderNavItems()}
          </nav>
        )}
      </div>
    </aside>
  );
}
