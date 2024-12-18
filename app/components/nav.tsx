'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  HomeIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  ClipboardDocumentCheckIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/20/solid';

const navItems = {
  '/': {
    name: 'home',
    icon: <HomeIcon className="h-4 w-4 ml-1" />,
  },
  '/articles': {
    name: 'articles',
    icon: <DocumentTextIcon className="h-4 w-4 ml-1" />,
  },
  '/case-studies': {
    name: 'case studies',
    icon: <ClipboardDocumentCheckIcon className="h-4 w-4 ml-1" />,
  },
  '/contact': {
    name: 'contact',
    icon: <EnvelopeIcon className="h-4 w-4 ml-1" />,
  },
};

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(true);
      } else {
        setIsMenuOpen(false);
      }
    };

    handleResize(); // Set initial state
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <aside className="-ml-[8px] tracking-tight">
      <div className="flex justify-between items-center">
        <a href="/">
          <img src="/logo-horizontal.svg" alt="logo" className="h-20" />
        </a>
        <button
          className="md:hidden p-2"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>
      <div
        className={`${
          isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden transition-all duration-500 ease-in-out md:flex justify-between`}
      >
        <nav
          className="flex flex-col md:flex-row items-start relative px-0 pb-0 fade md:overflow-auto scroll-pr-6 md:relative mb-4"
          id="nav"
        >
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-1">
            {Object.entries(navItems).map(([path, { name, icon }]) => {
              return (
                <Link
                  key={path}
                  href={path}
                  className="transition-all hover:underline flex align-middle relative"
                >
                  <span className="flex items-center space-x-1">
                    {icon}
                    <span>{name}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </aside>
  );
}
