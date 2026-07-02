import React from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import RetroWindow from '@/components/ui/RetroWindow';
import SocialIcons from '@/components/SocialIcons';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

export interface LpHeroProps {
  /** Small ICP tag above the headline, e.g. "Practical AI". */
  eyebrow: string;
  /** The H1 promise. One idea. */
  title: string;
  /** One or two sentences naming the mechanism or the who. */
  subhead: string;
  /** Short trust bullets shown with check icons. */
  credibility: string[];
  /** Primary CTA. Defaults to anchoring to the form. */
  primaryCta?: { label: string; href?: string };
  /** Heading shown above the form. */
  formHeading: string;
  /** RetroWindow title bar text for the form card. */
  formWindowTitle?: string;
  /** The lead form island. */
  form: React.ReactNode;
}

// Anchor the hero CTA scrolls to and the form column carries.
export const LP_FORM_ANCHOR = 'start-project';

export default function LpHero({
  eyebrow,
  title,
  subhead,
  credibility,
  primaryCta,
  formHeading,
  formWindowTitle = 'start_project.exe',
  form,
}: LpHeroProps) {
  const ctaLabel = primaryCta?.label ?? 'Start your project';
  const ctaHref = primaryCta?.href ?? `#${LP_FORM_ANCHOR}`;

  return (
    <section className="grid gap-12 lg:grid-cols-2 lg:items-start">
      <div>
        <p className="mb-4 inline-block rounded-full border border-border bg-bg-alt px-3 py-1 font-mono text-xs uppercase tracking-wide text-accent1-dark">
          {eyebrow}
        </p>
        <h1 className="mb-4 text-4xl font-bold leading-tight text-c-heading md:text-5xl">
          {title}
        </h1>
        <p className="mb-6 max-w-xl text-lg text-c-muted">{subhead}</p>

        <ul className="mb-8 space-y-3">
          {credibility.map((item) => (
            <li key={item} className="flex items-start gap-3 text-c-text">
              <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent1-dark" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <Button as="a" href={ctaHref} variant="primary" size="lg">
          {ctaLabel}
        </Button>

        <div className="mt-10 flex items-center gap-4">
          <Image
            width={72}
            height={72}
            src="/headshot.png"
            alt="Anthony Coffey"
            className="h-16 w-16 rounded-full border border-border object-cover shadow-md"
          />
          <div>
            <p className="font-semibold text-c-heading">Anthony Coffey</p>
            <p className="text-sm text-c-muted">
              Senior software engineer, Austin, Texas
            </p>
            <SocialIcons align="left" />
          </div>
        </div>
      </div>

      <div id={LP_FORM_ANCHOR} className="scroll-mt-24">
        <RetroWindow title={formWindowTitle}>
          <div className="p-6">
            <h2 className="mb-6 text-center text-2xl font-semibold text-c-heading">
              {formHeading}
            </h2>
            {form}
          </div>
        </RetroWindow>
      </div>
    </section>
  );
}
