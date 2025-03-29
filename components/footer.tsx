'use client';
import { useEffect, useState } from 'react';
import {
  HomeIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  RssIcon,
  ArrowUpCircleIcon,
  CodeBracketIcon,
  ChatBubbleOvalLeftIcon,
  CalendarDaysIcon,
  ArrowDownTrayIcon,
  BriefcaseIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/20/solid';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

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
      href: '/portfolio',
      text: 'portfolio',
      icon: <BriefcaseIcon className="h-4 w-4 ml-1" />,
    },
    {
      href: '/articles',
      text: 'articles',
      icon: <DocumentTextIcon className="h-4 w-4 ml-1" />,
    },
    {
      href: '/contact',
      text: 'contact',
      icon: <EnvelopeIcon className="h-4 w-4 ml-1" />,
    },
    {
      href: '/case-studies',
      text: 'case studies',
      icon: <ClipboardDocumentCheckIcon className="h-4 w-4 ml-1" />,
    },
    {
      href: '/rss',
      text: 'rss',
      icon: <RssIcon className="h-4 w-4 ml-1" />,
    },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* CTA Section - Hidden on portfolio page */}
      {usePathname() !== '/portfolio' && (
        <div className="bg-blue-600 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center text-white">
              Ready to Transform Your Business?
            </h2>
            <p className="text-center text-xl mb-10 text-blue-100">
              Let&apos;s discuss how tech can solve your problems and drive growth
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/contact"
                className="px-6 py-3 text-base rounded-md text-blue-600 bg-white font-medium no-underline flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <ChatBubbleOvalLeftIcon className="mr-2 h-5 w-5" />
                Start a Conversation
              </Link>
              <Link
                target="_blank"
                href="https://calendly.com/antcoffpersonal/meet"
                className="px-6 py-3 border border-white text-base rounded-md text-white bg-transparent no-underline flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <CalendarDaysIcon className="mr-2 h-5 w-5" />
                Schedule 30-Min Consultation
              </Link>
              <Link
                target="_blank"
                href="/Anthony%20Coffey%20-%20Resume.pdf"
                className="px-6 py-3 border border-white text-base rounded-md text-white bg-transparent no-underline flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <ArrowDownTrayIcon className="mr-2 h-5 w-5" />
                Download Resume
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Original Footer Content */}
      <div className="py-12">
        <ul className="font-sm mt-8 flex flex-col space-x-0 space-y-2 md:flex-row md:space-x-4 md:space-y-0 md:justify-center">
          {links.map((link, index) => (
            <li key={index}>
              <Link
                className="flex items-center transition-all  hover:underline"
                rel={link.href.endsWith('rss') ? 'noopener noreferrer' : ''}
                target={link.href.endsWith('rss') ? '_blank' : '_self'}
                href={link.href}
              >
                <p className="ml-2 h-7">
                  <span className="flex items-center space-x-1">
                    {link.icon}
                    <span>{link.text}</span>
                  </span>
                </p>
              </Link>
            </li>
          ))}
        </ul>

        <div className="relative right-8 bottom-8">
          <a
            className={`scroll-to-top ${
              showScrollToTop ? 'visible' : 'invisible'
            }`}
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

        <div className="flex justify-center mt-8">
          <Link href="/">
            <Image
              width={300}
              height={82}
              src="/logo-horizontal.svg"
              alt="logo"
              className="h-20"
            />
          </Link>
        </div>
        <div className="justify-center mt-8 flex items-center space-x-2">
          <span>© {new Date().getFullYear()} </span>
          <span> &#183; </span>
          <Link
            href="https://github.com/anthonycoffey/coffey.codes"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center hover:underline"
          >
            View Code on GitHub
            <CodeBracketIcon className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
