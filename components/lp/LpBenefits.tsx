import React from 'react';

export interface LpBenefitItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}

export interface LpBenefitsProps {
  heading: string;
  intro?: string;
  items: LpBenefitItem[];
}

export default function LpBenefits({ heading, intro, items }: LpBenefitsProps) {
  return (
    <section className="mt-20">
      <h2 className="text-3xl font-semibold text-c-heading">{heading}</h2>
      {intro ? (
        <p className="mt-3 max-w-2xl text-lg text-c-muted">{intro}</p>
      ) : null}

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {items.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="rounded-lg border border-border bg-surface p-6"
          >
            <div className="mb-3 inline-flex rounded-md bg-bg-alt p-2">
              <Icon className="h-6 w-6 text-accent1-dark" />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-c-heading">
              {title}
            </h3>
            <p className="text-c-text">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
