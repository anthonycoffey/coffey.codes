import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CaseStudyBrief from '@/app/(site)/case-study/[slug]/CaseStudyBrief';
import { CaseStudyData } from '@/app/(site)/case-studies/case-studies';

describe('CaseStudyBrief', () => {
  const mockStudy: CaseStudyData = {
    slug: 'test-study',
    title: 'Test Study',
    description: 'Test Description',
    icon: () => null,
    tags: [],
    layout: 'styleA',
    brief: {
      challenge: 'Test Challenge',
      solution: 'Test Solution',
      impact: 'Test Impact',
    },
  };

  it('renders challenge, solution, and impact sections', () => {
    render(<CaseStudyBrief study={mockStudy} />);
    
    expect(screen.getByText('The Challenge')).toBeInTheDocument();
    expect(screen.getByText('Test Challenge')).toBeInTheDocument();
    
    expect(screen.getByText('The Solution')).toBeInTheDocument();
    expect(screen.getByText('Test Solution')).toBeInTheDocument();
    
    expect(screen.getByText('The Impact')).toBeInTheDocument();
    expect(screen.getByText('Test Impact')).toBeInTheDocument();
  });

  it('returns null if study.brief is missing', () => {
    const { container } = render(<CaseStudyBrief study={{ ...mockStudy, brief: undefined }} />);
    expect(container).toBeEmptyDOMElement();
  });
});
