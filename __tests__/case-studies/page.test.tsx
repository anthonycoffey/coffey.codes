import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock('@heroicons/react/20/solid', () => ({
  ClipboardDocumentCheckIcon: () => null,
  ChevronRightIcon: () => null,
  BoltIcon: () => null,
  ChartBarIcon: () => null,
  CpuChipIcon: () => null,
}));

import CaseStudiesPage from '@/app/(site)/case-studies/page';
import { caseStudies } from '@/app/(site)/case-studies/case-studies';

describe('CaseStudiesPage', () => {
  it('renders the page heading', async () => {
    const jsx = await CaseStudiesPage();
    render(jsx as React.ReactElement);
    expect(
      screen.getByRole('heading', { level: 1, name: /case studies/i }),
    ).toBeInTheDocument();
  });

  it('renders the case study cards with their titles and tags', async () => {
    const jsx = await CaseStudiesPage();
    render(jsx as React.ReactElement);
    expect(
      screen.getByText(/PostGIS in Action: Streamlining Fleet Operations/i),
    ).toBeInTheDocument();
    expect(screen.getByText('PostGIS')).toBeInTheDocument();
  });

  it('links each card to its /case-study/:slug detail page, newest first', async () => {
    const jsx = await CaseStudiesPage();
    render(jsx as React.ReactElement);
    const readLinks = screen.getAllByRole('link', { name: /read case study/i });
    expect(readLinks).toHaveLength(caseStudies.length);
    // The listing renders the source array reversed, so the most recently
    // appended case study surfaces first and the oldest one appears last.
    expect(readLinks[0]).toHaveAttribute(
      'href',
      `/case-study/${caseStudies[caseStudies.length - 1].slug}`,
    );
    expect(readLinks[readLinks.length - 1]).toHaveAttribute(
      'href',
      `/case-study/${caseStudies[0].slug}`,
    );
  });
});
