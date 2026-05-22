import { render, screen, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/app/(site)/portfolio/utils', () => ({
  getAllPortfolioItems: vi.fn(),
}));

vi.mock('next/image', () => ({
  default: ({
    alt,
    priority,
    fill,
    ...rest
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    priority?: boolean;
    fill?: boolean;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt ?? ''}
      data-priority={priority ? 'true' : undefined}
      data-fill={fill ? 'true' : undefined}
      {...rest}
    />
  ),
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
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
  CalendarDaysIcon: () => null,
  ChatBubbleOvalLeftIcon: () => null,
  ChevronRightIcon: () => null,
  ClockIcon: () => null,
  CodeBracketSquareIcon: () => null,
  UserIcon: () => null,
}));

vi.mock('@/components/Testimonials', () => ({
  default: () => <div data-testid="testimonials" />,
}));

import { getAllPortfolioItems } from '@/app/(site)/portfolio/utils';
import PortfolioPage from '@/app/(site)/portfolio/page';

// Sorted publishedAt-descending, as getAllPortfolioItems() returns them.
// Periscope leads (logo, no client/year); coffey.codes anchors the list.
const ITEMS = [
  {
    slug: 'periscope',
    metadata: {
      title: 'Periscope — SEO Data Tooling',
      summary: 'A TypeScript CLI that unifies GSC, GA4, Bing, and Google Ads.',
      publishedAt: '2026-05-17',
      tags: ['TypeScript', 'CLI'],
      mainImage: '/periscope-logo.png',
      repo: 'https://github.com/anthonycoffey/periscope',
      category: 'Open Source / SEO Tooling',
    },
    content: '',
  },
  {
    slug: 'drum-machine',
    metadata: {
      title: 'React Drum Machine',
      summary: 'A retro-inspired browser-based step sequencer.',
      publishedAt: '2025-01-01',
      tags: ['React', 'Vite'],
      mainImage: '/portfolio/drum-machine-2.jpg',
      link: 'https://anthonycoffey.github.io/React-Drum-Kit',
      repo: 'https://github.com/anthonycoffey/React-Drum-Kit',
      client: 'Hobby Project',
      year: '2025',
    },
    content: '',
  },
  {
    slug: 'piano-scale-visualizer',
    metadata: {
      title: 'Piano Scale Visualizer',
      summary: 'An interactive browser-based piano that highlights scales.',
      publishedAt: '2025-01-01',
      tags: ['React', 'Music Theory'],
      mainImage: '/portfolio/piano-scale-visualizer.png',
      link: 'https://anthonycoffey.github.io/piano-scale-visualizer/',
      repo: 'https://github.com/anthonycoffey/piano-scale-visualizer',
      client: 'Hobby Project',
      year: '2025',
    },
    content: '',
  },
  {
    slug: 'simply-voice',
    metadata: {
      title: 'Simply Voice — Text-to-Speech App',
      summary: 'A no-fuss web app that converts text to .wav files.',
      publishedAt: '2025-01-01',
      tags: ['React', 'Supabase'],
      mainImage: '/portfolio/tts-home.jpg',
      link: 'https://simply-voice-452800.web.app/',
      repo: 'https://github.com/anthonycoffey/simply-voice',
      client: 'Hobby Project',
      year: '2025',
    },
    content: '',
  },
  {
    slug: 'coffey-codes',
    metadata: {
      title: 'coffey.codes — Personal Blog & Portfolio',
      summary: 'A performant, SEO-optimized personal site and technical blog.',
      publishedAt: '2023-01-01',
      tags: ['Next.js', 'TypeScript'],
      mainImage: '/portfolio/coffey.codes-portfolio.png',
      link: 'https://coffey.codes',
      repo: 'https://github.com/anthonycoffey/coffey.codes',
      client: 'Personal Project',
      year: '2023',
    },
    content: '',
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(
    getAllPortfolioItems as unknown as () => typeof ITEMS,
  ).mockReturnValue(ITEMS);
});

describe('PortfolioPage', () => {
  it('renders the page heading', () => {
    render(<PortfolioPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: /portfolio/i }),
    ).toBeInTheDocument();
  });

  it('renders every portfolio item title as an h2', () => {
    render(<PortfolioPage />);
    for (const item of ITEMS) {
      expect(
        screen.getByRole('heading', { level: 2, name: item.metadata.title }),
      ).toBeInTheDocument();
    }
  });

  it('renders each project card as a Link to its detail page', () => {
    render(<PortfolioPage />);
    for (const item of ITEMS) {
      const heading = screen.getByRole('heading', {
        level: 2,
        name: item.metadata.title,
      });
      const link = heading.closest('a');
      expect(link).not.toBeNull();
      expect(link!.getAttribute('href')).toBe(`/portfolio/${item.slug}`);
    }
  });

  it('does not render any legacy polaroid markup', () => {
    const { container } = render(<PortfolioPage />);
    expect(container.querySelector('.polaroid-card')).toBeNull();
    expect(container.querySelector('.vhs-card')).toBeNull();
  });

  it('shows client and year metadata for items that declare them', () => {
    render(<PortfolioPage />);
    const heading = screen.getByRole('heading', {
      level: 2,
      name: 'React Drum Machine',
    });
    const card = heading.closest('a') as HTMLElement;
    expect(within(card).getByText('Hobby Project')).toBeInTheDocument();
    expect(within(card).getByText('2025')).toBeInTheDocument();
  });

  describe('CWV image hygiene', () => {
    it('renders exactly one thumbnail per project, each with a sizes hint', () => {
      const { container } = render(<PortfolioPage />);
      const imgs = container.querySelectorAll('img');
      expect(imgs.length).toBe(ITEMS.length);
      imgs.forEach((img) => {
        expect(img.getAttribute('sizes')).toBeTruthy();
      });
    });

    it('marks only the first card image as priority (the LCP candidate)', () => {
      const { container } = render(<PortfolioPage />);
      const imgs = Array.from(container.querySelectorAll('img'));
      expect(imgs[0].getAttribute('data-priority')).toBe('true');
      imgs.slice(1).forEach((img) => {
        expect(img.getAttribute('data-priority')).toBeNull();
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
