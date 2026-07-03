import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BoltIcon } from '@heroicons/react/24/outline';

import LpHero, { LP_FORM_ANCHOR } from '@/components/lp/LpHero';
import LpBenefits from '@/components/lp/LpBenefits';
import LpFinalCta from '@/components/lp/LpFinalCta';

describe('LpHero', () => {
  it('renders the promise, eyebrow, credibility, CTA anchor, and the form island', () => {
    render(
      <LpHero
        eyebrow="Practical AI"
        title="Ship AI that actually works"
        subhead="Built by a senior engineer."
        credibility={['12+ years shipping production software', 'Austin, Texas']}
        formHeading="Discuss your AI initiative"
        form={<div data-testid="form-island" />}
      />,
    );

    expect(
      screen.getByRole('heading', { level: 1, name: /ship ai that actually works/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Practical AI')).toBeInTheDocument();
    expect(
      screen.getByText(/12\+ years shipping production software/i),
    ).toBeInTheDocument();
    expect(screen.getByTestId('form-island')).toBeInTheDocument();

    const cta = screen.getByRole('link', { name: /start your project/i });
    expect(cta).toHaveAttribute('href', `#${LP_FORM_ANCHOR}`);
  });
});

describe('LpBenefits', () => {
  it('renders the heading and every benefit item', () => {
    render(
      <LpBenefits
        heading="Why me"
        intro="A short intro."
        items={[
          { icon: BoltIcon, title: 'Fast delivery', body: 'On time.' },
          { icon: BoltIcon, title: 'Senior only', body: 'No bait-and-switch.' },
        ]}
      />,
    );

    expect(screen.getByRole('heading', { name: /why me/i })).toBeInTheDocument();
    expect(screen.getByText('Fast delivery')).toBeInTheDocument();
    expect(screen.getByText('Senior only')).toBeInTheDocument();
    expect(screen.getByText('No bait-and-switch.')).toBeInTheDocument();
  });
});

describe('LpFinalCta', () => {
  it('renders the closing CTA as a new-tab booking link', () => {
    render(
      <LpFinalCta
        heading="Ready to talk?"
        body="Book a free intro call."
        ctaLabel="Book Free Call"
        calendlyHref="https://calendly.com/test/meet"
      />,
    );

    const link = screen.getByRole('link', { name: /book free call/i });
    expect(link).toHaveAttribute('href', 'https://calendly.com/test/meet');
    expect(link).toHaveAttribute('target', '_blank');
  });
});
