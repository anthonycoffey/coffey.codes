import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PortfolioLayout, { metadata } from '@/app/portfolio/layout';

describe('PortfolioLayout', () => {
  it('renders children inside the layout wrapper', () => {
    const { getByText } = render(<PortfolioLayout>Hello</PortfolioLayout>);
    expect(getByText('Hello')).toBeInTheDocument();
  });

  it('renders a wrapper div with the standardized chrome classes', () => {
    const { container } = render(<PortfolioLayout>content</PortfolioLayout>);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.tagName).toBe('DIV');
    // Mirrors the articles layout's chrome — every section layout owns these.
    expect(wrapper.className).toContain('max-w-4xl');
    expect(wrapper.className).toContain('mx-auto');
    expect(wrapper.className).toContain('px-4');
    expect(wrapper.className).toContain('min-h-[900px]');
  });

  it('exports a metadata object with title and canonical url', () => {
    expect(metadata.title).toBe('Portfolio');
    expect(metadata.alternates?.canonical).toBe('/portfolio');
  });

  it('matches snapshot', () => {
    const { container } = render(<PortfolioLayout>snap</PortfolioLayout>);
    expect(container.firstChild).toMatchSnapshot();
  });
});
