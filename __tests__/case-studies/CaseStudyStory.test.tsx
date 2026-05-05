import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CaseStudyStory from '@/app/(site)/case-study/[slug]/CaseStudyStory';
import { CaseStudyData } from '@/app/(site)/case-studies/case-studies';

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
  });

  it('returns null if study.story is missing', () => {
    const { container } = render(<CaseStudyStory study={{ ...mockStudy, story: undefined }} />);
    expect(container).toBeEmptyDOMElement();
  });
});
