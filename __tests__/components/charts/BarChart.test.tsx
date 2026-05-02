import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@visx/responsive', () => ({
  ParentSize: ({
    children,
  }: {
    children: (dims: { width: number; height: number }) => React.ReactNode;
  }) => <>{children({ width: 600, height: 320 })}</>,
}));

import BarChart from '@/components/charts/BarChart';

describe('BarChart', () => {
  const data = [
    { label: 'Legacy', value: 400 },
    { label: 'PostGIS', value: 45 },
  ];

  it('renders the title', () => {
    render(<BarChart title="Query Latency" data={data} unit="ms" />);
    expect(screen.getByText('Query Latency')).toBeInTheDocument();
  });

  it('renders an SVG marked as a bar chart', () => {
    const { container } = render(<BarChart title="t" data={data} />);
    expect(container.querySelector('svg[data-chart="bar"]')).not.toBeNull();
  });

  it('renders a labeled <g> for every data point', () => {
    const { container } = render(<BarChart title="t" data={data} />);
    expect(container.querySelectorAll('g[data-bar-label]')).toHaveLength(
      data.length,
    );
    expect(
      container.querySelector('g[data-bar-label="Legacy"]'),
    ).not.toBeNull();
    expect(
      container.querySelector('g[data-bar-label="PostGIS"]'),
    ).not.toBeNull();
  });

  it('renders value labels with the unit suffix', () => {
    render(<BarChart title="t" data={data} unit="ms" />);
    // y-axis ticks may also render values with the unit; ensure at least one
    // value label per data point is present.
    expect(screen.getAllByText('400ms').length).toBeGreaterThan(0);
    expect(screen.getAllByText('45ms').length).toBeGreaterThan(0);
  });
});
