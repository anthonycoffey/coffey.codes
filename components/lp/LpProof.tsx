import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Testimonials from '@/components/Testimonials';
import LogoGrid from '@/components/LogoGrid';
import { ArrowRightIcon } from '@heroicons/react/24/solid';

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
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {caseStudies.map(({ href, title, blurb }) => (
            <Link
              key={href}
              href={href}
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

      <div className="mt-10 flex justify-center">
        <Button as="a" href="/portfolio" variant="secondary" size="md">
          See the full portfolio
        </Button>
      </div>
    </section>
  );
}
