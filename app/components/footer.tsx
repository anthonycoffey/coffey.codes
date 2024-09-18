'use client';
import { useEffect, useState } from 'react';
import { ArrowUpRightIcon, ArrowUpCircleIcon } from '@heroicons/react/20/solid';

export default function Footer() {
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const nearBottom = document.documentElement.scrollHeight - 100;
      setShowScrollToTop(scrollPosition >= nearBottom);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    {
      href: '/rss',
      text: 'rss',
      icon: <ArrowUpRightIcon className="h-4 w-4 ml-1" />,
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
                <span className="flex items-center">
                  {link.text}
                  {link.icon}
                </span>
              </p>
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-neutral-600 dark:text-neutral-300">
        © {new Date().getFullYear()} MIT Licensed
      </p>
      <div className="relative max-w-xl mx-4 mt-8 lg:mx-auto">
        <a
          className={`scroll-to-top ${showScrollToTop ? 'visible' : ''}`}
          rel="noopener noreferrer"
          target="_blank"
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
    </footer>
  );
}
