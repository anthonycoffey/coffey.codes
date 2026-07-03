import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Testimonials from '@/components/Testimonials';
import LogoGrid from '@/components/LogoGrid';
import { ArrowRightIcon } from '@heroicons/react/24/solid';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

// Public path in /public, URL-encoded for the space in the filename.
const RESUME_HREF = '/Anthony%20Coffey%20-%20Resume.pdf';

export interface LpCaseStudy {
  href: string;
  title: string;
  blurb: string;
}

export interface LpProofProps {
  heading?: string;
  intro?: string;
  caseStudies: LpCaseStudy[];
  /** Filenames under /public/logos to show as the tech strip. */
  techLogos: string[];
}

export default function LpProof({
  heading = 'Proof, not promises',
  intro,
  caseStudies,
  techLogos,
}: LpProofProps) {
  return (
    <section className="mt-20">
      <h2 className="text-3xl font-semibold text-c-heading">{heading}</h2>
      {intro ? (
        <p className="mt-3 max-w-2xl text-lg text-c-muted">{intro}</p>
      ) : null}

      {caseStudies.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {caseStudies.map(({ href, title, blurb }) => (
            <Link
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col rounded-lg border border-border bg-surface p-6 no-underline transition-colors hover:bg-surface-hover"
            >
              <h3 className="mb-2 text-lg font-semibold text-c-heading">
                {title}
              </h3>
              <p className="mb-4 flex-1 text-c-text">{blurb}</p>
              <span className="inline-flex items-center gap-1 font-semibold text-link">
                Read the case study
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      ) : null}

      <div className="mt-12">
        <Testimonials />
      </div>

      <div className="mt-12">
        <p className="mb-6 text-center font-mono text-sm uppercase tracking-wide text-c-muted">
          Tools I build with
        </p>
        <LogoGrid logos={techLogos} />
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Button
          as="a"
          href="/portfolio"
          variant="primary"
          size="md"
          target="_blank"
          rel="noopener noreferrer"
        >
          See my portfolio
        </Button>
        <Button
          as="a"
          href={RESUME_HREF}
          variant="secondary"
          size="md"
          target="_blank"
          rel="noopener noreferrer"
          download
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          Download my resume
        </Button>
      </div>
    </section>
  );
}
