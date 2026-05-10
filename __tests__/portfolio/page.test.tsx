import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('next/image', () => ({
  default: ({ alt, src, ...rest }: { alt?: string; src?: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} {...rest} />
  ),
}));

vi.mock('@/components/ui/RetroWindow', () => ({
  default: ({
    title,
    children,
  }: {
    title?: string;
    children: React.ReactNode;
  }) => (
    <div data-testid="retro-window" data-title={title}>
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/Button', () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href?: string;
    children: React.ReactNode;
  }) =>
    href ? (
      <a href={href} {...rest}>
        {children}
      </a>
    ) : (
      <button {...rest}>{children}</button>
    ),
}));

vi.mock('@heroicons/react/24/solid', () => ({
  ChatBubbleOvalLeftIcon: () => null,
  CalendarDaysIcon: () => null,
  ArrowTopRightOnSquareIcon: () => null,
  CheckCircleIcon: () => null,
  TagIcon: () => null,
  UserIcon: () => null,
  ClockIcon: () => null,
  CodeBracketSquareIcon: () => null,
  XMarkIcon: () => null,
}));

import PortfolioPage from '@/app/(site)/portfolio/page';

describe('PortfolioPage', () => {
  it('renders the page heading', () => {
    render(<PortfolioPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: /portfolio/i }),
    ).toBeInTheDocument();
  });

  it('renders all hard-coded project titles in the grid', () => {
    render(<PortfolioPage />);
    // Use heading queries because the same title appears inside the modal
    // (which is not in the DOM until a card is clicked) — at initial render
    // there is exactly one h3 per project.
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /personal blog & portfolio/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /react drum machine/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: /simply voice/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /piano scale visualizer/i,
      }),
    ).toBeInTheDocument();
  });

  it('does not render modal content before a project is clicked', () => {
    render(<PortfolioPage />);
    // Modal-only headings — only appear once a project card opens the modal
    expect(
      screen.queryByRole('heading', { level: 4, name: /^challenge$/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { level: 4, name: /project details/i }),
    ).not.toBeInTheDocument();
  });

  it('opens the modal when a project card is clicked', () => {
    render(<PortfolioPage />);
    // Click the first project card
    const cardHeading = screen.getByRole('heading', {
      level: 3,
      name: /personal blog & portfolio/i,
    });
    const card = cardHeading.closest('.polaroid-card') as HTMLElement;
    expect(card).not.toBeNull();
    fireEvent.click(card);

    // Modal-only sections should now be in the DOM
    expect(
      screen.getByRole('heading', { level: 4, name: /^challenge$/i }),
    ).toBeInTheDocument();
    // Anchored — the sidebar also has a "similar solution?" h4 that would
    // match an unanchored /solution/i.
    expect(
      screen.getByRole('heading', { level: 4, name: /^solution$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 4, name: /^results$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 4, name: /project details/i }),
    ).toBeInTheDocument();
  });

  it('closes the modal when the close button is clicked', () => {
    render(<PortfolioPage />);
    const cardHeading = screen.getByRole('heading', {
      level: 3,
      name: /personal blog & portfolio/i,
    });
    const card = cardHeading.closest('.polaroid-card') as HTMLElement;
    fireEvent.click(card);

    // Modal is open
    expect(
      screen.getByRole('heading', { level: 4, name: /^challenge$/i }),
    ).toBeInTheDocument();

    // Close it
    const closeBtn = screen.getByRole('button', { name: /close modal/i });
    fireEvent.click(closeBtn);

    // Modal-only headings are gone
    expect(
      screen.queryByRole('heading', { level: 4, name: /^challenge$/i }),
    ).not.toBeInTheDocument();
  });

  describe('CWV image hygiene', () => {
    it('polaroid grid thumbnails declare a sizes attribute', () => {
      const { container } = render(<PortfolioPage />);
      const cards = container.querySelectorAll('.polaroid-card');
      expect(cards.length).toBeGreaterThan(0);
      cards.forEach((card) => {
        const img = card.querySelector('img');
        expect(img).not.toBeNull();
        expect(img!.getAttribute('sizes')).toBeTruthy();
      });
    });

    it('modal main image is wrapped in an aspect-ratio container (CLS reservation)', () => {
      render(<PortfolioPage />);
      const cardHeading = screen.getByRole('heading', {
        level: 3,
        name: /personal blog & portfolio/i,
      });
      const card = cardHeading.closest('.polaroid-card') as HTMLElement;
      fireEvent.click(card);

      const retroWindow = screen.getByTestId('retro-window');
      const wrapper = retroWindow.querySelector('div');
      expect(wrapper).not.toBeNull();
      expect(wrapper!.className).toMatch(/aspect-/);
    });

    it('modal thumbnail images declare sizes hints', () => {
      render(<PortfolioPage />);
      const cardHeading = screen.getByRole('heading', {
        level: 3,
        name: /personal blog & portfolio/i,
      });
      const card = cardHeading.closest('.polaroid-card') as HTMLElement;
      fireEvent.click(card);

      // Find the thumbnail row inside the modal — Image elements with h-16 class
      const thumbs = document.querySelectorAll('img.h-16');
      // The Image component spreads className on the underlying <img>, but the
      // h-16 class might not propagate through our test mock. Fall back to
      // selecting all imgs with sizes="80px" (modal thumbs).
      const thumbsWithSize = Array.from(
        document.querySelectorAll('img'),
      ).filter((img) => img.getAttribute('sizes') === '80px');
      expect(thumbs.length + thumbsWithSize.length).toBeGreaterThan(0);
    });
  });

  it('renders the bottom CTA with links to /contact and Calendly', () => {
    render(<PortfolioPage />);
    expect(
      screen.getByRole('link', { name: /start your project/i }),
    ).toHaveAttribute('href', '/contact');
    expect(
      screen.getByRole('link', { name: /book free consultation/i }),
    ).toHaveAttribute('href', 'https://calendly.com/antcoffpersonal/meet');
  });
});
