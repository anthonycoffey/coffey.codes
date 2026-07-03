import React from 'react';
import Button from '@/components/ui/Button';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';

export interface LpFinalCtaProps {
  heading: string;
  body: string;
  ctaLabel: string;
  /** Calendly (or other) booking link. */
  calendlyHref?: string;
}

const DEFAULT_CALENDLY = 'https://calendly.com/antcoffpersonal/meet';

export default function LpFinalCta({
  heading,
  body,
  ctaLabel,
  calendlyHref = DEFAULT_CALENDLY,
}: LpFinalCtaProps) {
  return (
    <section className="mt-20 rounded-xl border border-border bg-bg-alt px-6 py-12 text-center">
      <h2 className="text-3xl font-semibold text-c-heading">{heading}</h2>
      <p className="mx-auto mt-3 max-w-2xl text-lg text-c-muted">{body}</p>
      <div className="mt-8 flex justify-center">
        <Button
          as="a"
          href={calendlyHref}
          variant="primary"
          size="lg"
          target="_blank"
          rel="noopener noreferrer"
        >
          <CalendarDaysIcon className="h-5 w-5" />
          {ctaLabel}
        </Button>
      </div>
    </section>
  );
}
