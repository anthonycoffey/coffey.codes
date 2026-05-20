import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('next/image', () => ({
  default: ({ alt, src, ...rest }: { alt?: string; src?: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} {...rest} />
  ),
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    className,
    style,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
  }) => (
    <a href={href} className={className} style={style}>
      {children}
    </a>
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
  ArrowDownTrayIcon: () => null,
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

vi.mock('@/components/Testimonials', () => ({
  default: () => <div data-testid="testimonials" />,
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

  it('all project cards render as Next.js Links with correct hrefs', () => {
    render(<PortfolioPage />);
    const expectedLinks = [
      { name: /periscope/i, href: '/portfolio/periscope' },
      { name: /personal blog & portfolio/i, href: '/portfolio/coffey-codes' },
      { name: /react drum machine/i, href: '/portfolio/drum-machine' },
      { name: /simply voice/i, href: '/portfolio/simply-voice' },
      {
        name: /piano scale visualizer/i,
        href: '/portfolio/piano-scale-visualizer',
      },
    ];
    for (const { name, href } of expectedLinks) {
      const heading = screen.getByRole('heading', { level: 3, name });
      const link = heading.closest('a') as HTMLAnchorElement;
      expect(link).not.toBeNull();
      expect(link.getAttribute('href')).toBe(href);
    }
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
