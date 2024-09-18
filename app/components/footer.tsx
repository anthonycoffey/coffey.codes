'use client';
import { useEffect, useState } from 'react';
import {
  HomeIcon,
  PencilIcon,
  EnvelopeIcon,
  RssIcon,
  ArrowUpCircleIcon,
  CodeBracketIcon,
} from '@heroicons/react/20/solid';

export default function Footer() {
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const nearBottom = document.documentElement.scrollHeight - 100;
      const hasScrollbar =
        document.documentElement.scrollHeight > window.innerHeight;
      setShowScrollToTop(hasScrollbar && scrollPosition >= nearBottom);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    {
      href: '/',
      text: 'home',
      icon: <HomeIcon className="h-4 w-4 ml-1" />,
    },
    {
      href: '/blog',
      text: 'blog',
      icon: <PencilIcon className="h-4 w-4 ml-1" />,
    },
    {
      href: '/contact',
      text: 'contact',
      icon: <EnvelopeIcon className="h-4 w-4 ml-1" />,
    },
    {
      href: '/rss',
      text: 'rss',
      icon: <RssIcon className="h-4 w-4 ml-1" />,
    },
  ];

  return (
    <footer className="mb-16">
      <ul className="font-sm mt-8 flex flex-col space-x-0 space-y-2 text-neutral-600 md:flex-row md:space-x-4 md:space-y-0 dark:text-neutral-300">
        {links.map((link, index) => (
          <li key={index}>
            <a
              className="flex items-center transition-all hover:text-neutral-800 dark:hover:text-neutral-100"
              rel="noopener noreferrer"
              target="_blank"
              href={link.href}
            >
              <p className="ml-2 h-7">
                <span className="flex items-center space-x-1">
                  {link.icon}
                  <span>{link.text}</span>
                </span>
              </p>
            </a>
          </li>
        ))}
      </ul>

      <div className="relative max-w-xl mx-4 mt-8 lg:mx-auto">
        <a
          className={`scroll-to-top ${showScrollToTop ? 'visible' : 'invisible'}`}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <p className="ml-2 h-7">
            <span className="flex items-center">
              Scroll to Top
              <ArrowUpCircleIcon className="h-4 w-4 ml-1" />
            </span>
          </p>
        </a>
      </div>
      <div className="justify-center mt-8 text-neutral-600 dark:text-neutral-300 flex items-center space-x-2">
        <span>© {new Date().getFullYear()} MIT Licensed</span>
        <span> &#183; </span>
        <a
          href="https://github.com/anthonycoffey/coffey.codes"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center hover:underline"
        >
          View on GitHub
          <CodeBracketIcon className="h-4 w-4 ml-1" />
        </a>
      </div>
    </footer>
  );
}
