'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  HomeIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  RssIcon,
  ArrowUpCircleIcon,
  CodeBracketIcon,
  ChatBubbleOvalLeftIcon,
  CalendarDaysIcon,
  BriefcaseIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/20/solid';
import SocialIcons from './SocialIcons';

const navLinks = [
  { href: '/', text: 'Home', icon: <HomeIcon className="h-4 w-4" /> },
  { href: '/portfolio', text: 'Portfolio', icon: <BriefcaseIcon className="h-4 w-4" /> },
  { href: '/articles', text: 'Articles', icon: <DocumentTextIcon className="h-4 w-4" /> },
  { href: '/contact', text: 'Contact', icon: <EnvelopeIcon className="h-4 w-4" /> },
  { href: '/case-studies', text: 'Case Studies', icon: <ClipboardDocumentCheckIcon className="h-4 w-4" /> },
  { href: '/rss', text: 'RSS', icon: <RssIcon className="h-4 w-4" />, external: true },
];

export default function Footer() {
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const nearBottom = document.documentElement.scrollHeight - 100;
      const hasScrollbar = document.documentElement.scrollHeight > window.innerHeight;
      setShowScrollToTop(hasScrollbar && scrollPosition >= nearBottom);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <footer className="bg-bg-alt border-t-2 border-border text-c-text">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Col 1: Logo + tagline + social */}
          <div className="flex flex-col gap-4">
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
            <p className="text-c-muted text-sm leading-relaxed">
              Full-stack engineer &amp; Fractional CTO based in Austin, TX.
            </p>
            <SocialIcons />
          </div>

          {/* Col 2: Nav links */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-c-muted mb-4">Navigation</p>
            <ul className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    target={link.external ? '_blank' : undefined}
                    className="flex items-center gap-2 text-sm text-c-text hover:text-link transition-colors"
                  >
                    {link.icon}
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: CTA */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-bold uppercase tracking-widest text-c-muted mb-0">Get in touch</p>
            <p className="font-outfit text-xl text-c-heading leading-snug">
              Ready to build something?
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent1-dark text-surface text-sm font-semibold hover:opacity-90 transition-opacity no-underline"
              >
                <ChatBubbleOvalLeftIcon className="h-4 w-4" />
                Start a Conversation
              </Link>
              <Link
                href="https://calendly.com/antcoffpersonal/meet"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-border text-c-text text-sm font-semibold hover:bg-surface-hover transition-colors no-underline"
              >
                <CalendarDaysIcon className="h-4 w-4" />
                Schedule a Call
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-c-muted">
          <span>&copy; {new Date().getFullYear()} Anthony Coffey</span>
          <Link
            href="https://github.com/anthonycoffey/coffey.codes"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-link transition-colors"
          >
            View on GitHub
            <CodeBracketIcon className="h-4 w-4" />
          </Link>
          <button
            className={`flex items-center gap-1 hover:text-link transition-all cursor-pointer ${showScrollToTop ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Scroll to top"
          >
            Scroll to Top
            <ArrowUpCircleIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
