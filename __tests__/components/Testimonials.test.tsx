import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      ...rest
    }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...rest}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock('@heroicons/react/24/solid', () => ({
  StarIcon: () => null,
  ChevronLeftIcon: () => null,
  ChevronRightIcon: () => null,
  PauseIcon: () => null,
  PlayIcon: () => null,
}));

import Testimonials from '@/components/Testimonials';

describe('Testimonials', () => {
  it('reserves min-height on the slide wrapper to prevent CLS during autoplay', () => {
    const { container } = render(<Testimonials />);
    const wrapper = container.querySelector('[class*="min-h-["]');
    expect(wrapper).not.toBeNull();
    const cls = wrapper!.className;
    // Mobile (default): generous min-height for longest testimonial
    expect(cls).toMatch(/min-h-\[\d+px\]/);
    // Desktop (md+): also has a defined min-height
    expect(cls).toMatch(/md:min-h-\[\d+px\]/);
  });

  it('mobile min-height is at least 400px (longest testimonial worst case)', () => {
    const { container } = render(<Testimonials />);
    const wrapper = container.querySelector('[class*="min-h-["]');
    const match = wrapper!.className.match(/(?:^|\s)min-h-\[(\d+)px\]/);
    expect(match).not.toBeNull();
    const px = Number(match![1]);
    expect(px).toBeGreaterThanOrEqual(400);
  });
});
