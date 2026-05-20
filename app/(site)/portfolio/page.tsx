import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowDownTrayIcon,
  CalendarDaysIcon,
  ChatBubbleOvalLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  CodeBracketSquareIcon,
  UserIcon,
} from '@heroicons/react/24/solid';

import Button from '@/components/ui/Button';
import PageHeader from '@/components/PageHeader';
import Testimonials from '@/components/Testimonials';
import { getAllPortfolioItems } from '@/app/(site)/portfolio/utils';

export default function PortfolioSection() {
  const items = getAllPortfolioItems();

  return (
    <>
      <PageHeader
        title="Portfolio"
        icon={CodeBracketSquareIcon}
        description="Check out some of my recent work!"
      />

      <div className="space-y-6 mb-12">
        {items.map((item, i) => {
          const { slug, metadata } = item;
          return (
            <Link
              key={slug}
              href={`/portfolio/${slug}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:bg-surface-hover md:flex-row"
            >
              {/* Thumbnail — large, fills its half of the card.
               * aspect-video reserves space on mobile (CLS guard); on md+
               * the column stretches to match the content height. */}
              <div className="relative aspect-video bg-bg-alt md:aspect-auto md:w-2/5 lg:w-1/2">
                {metadata.mainImage && (
                  <Image
                    src={metadata.mainImage}
                    alt={metadata.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={i === 0}
                    className="object-cover"
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <h2 className="font-outfit text-xl font-bold text-c-heading transition-colors group-hover:text-accent1-dark">
                  {metadata.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-c-muted">
                  {metadata.summary}
                </p>

                {metadata.tags && metadata.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {metadata.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-accent2 px-2 py-0.5 text-xs font-semibold text-c-heading"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-auto flex items-center justify-between pt-4 text-xs text-c-muted">
                  <span className="flex items-center gap-3">
                    {metadata.client && (
                      <span className="flex items-center gap-1">
                        <UserIcon className="h-3 w-3" />
                        {metadata.client}
                      </span>
                    )}
                    {metadata.year && (
                      <span className="flex items-center gap-1">
                        <ClockIcon className="h-3 w-3" />
                        {metadata.year}
                      </span>
                    )}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-link transition-all group-hover:gap-2">
                    View project
                    <ChevronRightIcon className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Testimonials */}
      <section className="mt-4 mb-12">
        <h2 className="font-outfit text-2xl md:text-3xl font-bold mb-4 text-c-heading">
          What other clients have said
        </h2>
        <Testimonials />
      </section>

      {/* Bottom CTA */}
      <div className="bg-accent2 border-2 border-border p-8 rounded-2xl text-center mt-4">
        <h2 className="font-outfit text-2xl md:text-3xl font-bold mb-3 text-c-heading">
          Ready to Build Your Next Great Project?
        </h2>
        <p className="text-c-text mb-8">
          Let&apos;s create a custom solution that achieves your business goals
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button as="a" href="/contact" variant="primary">
            <ChatBubbleOvalLeftIcon className="h-5 w-5" />
            Start Your Project
          </Button>
          <Button
            as="a"
            href="https://calendly.com/antcoffpersonal/meet"
            variant="secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            <CalendarDaysIcon className="h-5 w-5" />
            Book Free Consultation
          </Button>
          <Button
            as="a"
            href="/Anthony%20Coffey%20-%20Resume.pdf"
            variant="secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            Download Resume
          </Button>
        </div>
      </div>
    </>
  );
}
