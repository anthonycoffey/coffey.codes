import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CaseStudyStory from '@/app/(site)/case-study/[slug]/CaseStudyStory';
import { CaseStudyData } from '@/app/(site)/case-studies/case-studies';

// next/dynamic with `ssr: false` returns a placeholder during SSR-style
// tests; mock both chart blocks to a marker so we can assert the
// renderer wired them up correctly without dragging visx into jsdom.
vi.mock('@/app/(site)/case-study/[slug]/CaseStudyChartBlock', () => ({
  default: (props: { title: string }) => (
    <div data-testid="bar-chart-block">{props.title}</div>
  ),
}));
vi.mock('@/app/(site)/case-study/[slug]/CaseStudyLineChartBlock', () => ({
  default: (props: { title: string }) => (
    <div data-testid="line-chart-block">{props.title}</div>
  ),
}));

describe('CaseStudyStory', () => {
  const mockStudy: CaseStudyData = {
    slug: 'test-study',
    title: 'Test Study',
    description: 'Test Description',
    icon: () => null,
    tags: [],
    layout: 'styleB',
    story: [
      {
        type: 'text',
        heading: 'Introduction',
        content: 'This is a test introduction.',
      },
      {
        type: 'stats',
        stats: [{ label: 'Performance', value: '100%' }],
      },
      {
        type: 'quote',
        text: 'Great work!',
        author: 'John Doe',
      },
      {
        type: 'chart',
        title: 'Bar chart title',
        data: [{ label: 'A', value: 1 }],
      },
      {
        type: 'lineChart',
        title: 'Line chart title',
        unit: '%',
        series: [
          {
            name: 'series-a',
            data: [{ label: 'p1', value: 1 }],
          },
        ],
      },
    ],
  };

  it('renders different block types correctly', () => {
    render(<CaseStudyStory study={mockStudy} />);

    // Text block
    expect(screen.getByText('Introduction')).toBeInTheDocument();
    expect(screen.getByText('This is a test introduction.')).toBeInTheDocument();

    // Stats block
    expect(screen.getByText('Performance')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();

    // Quote block
    expect(screen.getByText(/"Great work!"/)).toBeInTheDocument();
    expect(screen.getByText('— John Doe')).toBeInTheDocument();

    // Bar chart block
    expect(screen.getByTestId('bar-chart-block')).toHaveTextContent(
      'Bar chart title',
    );

    // Line chart block
    expect(screen.getByTestId('line-chart-block')).toHaveTextContent(
      'Line chart title',
    );
  });

  it('returns null if study.story is missing', () => {
    const { container } = render(<CaseStudyStory study={{ ...mockStudy, story: undefined }} />);
    expect(container).toBeEmptyDOMElement();
  });
});
