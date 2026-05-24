import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@heroicons/react/20/solid', () => ({
  CheckIcon: () => <span data-testid="icon-check" />,
  LinkIcon: () => <span data-testid="icon-link" />,
}));

import ShareButtons from '@/components/ShareButtons';

const ARTICLE_URL =
  'https://coffey.codes/articles/building-location-based-features-using-expo-location';
const ARTICLE_TITLE =
  'Expo Location Guide: Permissions, GPS, and Geofencing';

describe('<ShareButtons />', () => {
  it('renders share links for X, LinkedIn, Hacker News, and Reddit', () => {
    render(<ShareButtons url={ARTICLE_URL} title={ARTICLE_TITLE} />);

    for (const name of ['X', 'LinkedIn', 'Hacker News', 'Reddit']) {
      expect(
        screen.getByRole('link', { name: new RegExp(`Share on ${name}`, 'i') }),
      ).toBeInTheDocument();
    }
  });

  it('encodes the article URL and title into each share intent', () => {
    render(<ShareButtons url={ARTICLE_URL} title={ARTICLE_TITLE} />);

    const x = screen.getByRole('link', { name: /Share on X/i });
    expect(x).toHaveAttribute(
      'href',
      `https://x.com/intent/post?text=${encodeURIComponent(ARTICLE_TITLE)}&url=${encodeURIComponent(ARTICLE_URL)}`,
    );

    const linkedin = screen.getByRole('link', { name: /Share on LinkedIn/i });
    expect(linkedin).toHaveAttribute(
      'href',
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(ARTICLE_URL)}`,
    );

    const hn = screen.getByRole('link', { name: /Share on Hacker News/i });
    expect(hn).toHaveAttribute(
      'href',
      `https://news.ycombinator.com/submitlink?u=${encodeURIComponent(ARTICLE_URL)}&t=${encodeURIComponent(ARTICLE_TITLE)}`,
    );

    const reddit = screen.getByRole('link', { name: /Share on Reddit/i });
    expect(reddit).toHaveAttribute(
      'href',
      `https://www.reddit.com/submit?url=${encodeURIComponent(ARTICLE_URL)}&title=${encodeURIComponent(ARTICLE_TITLE)}`,
    );
  });

  it('opens each share link in a new tab with rel=noopener noreferrer', () => {
    render(<ShareButtons url={ARTICLE_URL} title={ARTICLE_TITLE} />);
    const links = screen.getAllByRole('link');
    for (const link of links) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  it('exposes itself as an accessible share region', () => {
    const { container } = render(
      <ShareButtons url={ARTICLE_URL} title={ARTICLE_TITLE} />,
    );
    // The outer wrapper carries the aria-label so assistive tech treats
    // the cluster as a single share region.
    expect(
      container.querySelector('[aria-label="Share this article"]'),
    ).toBeInTheDocument();
  });

  it('renders the Copy Link button (client component, mounted from the server tree)', () => {
    render(<ShareButtons url={ARTICLE_URL} title={ARTICLE_TITLE} />);
    expect(
      screen.getByRole('button', { name: /Copy link to clipboard/i }),
    ).toBeInTheDocument();
  });
});

describe('<CopyLinkButton /> (covered via the share cluster mount)', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn(async () => undefined) },
    });
  });

  it('writes the URL to the clipboard and swaps the icon when clicked', async () => {
    render(<ShareButtons url={ARTICLE_URL} title={ARTICLE_TITLE} />);

    expect(screen.getByTestId('icon-link')).toBeInTheDocument();
    expect(screen.queryByTestId('icon-check')).not.toBeInTheDocument();

    const button = screen.getByRole('button', {
      name: /Copy link to clipboard/i,
    });
    fireEvent.click(button);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(ARTICLE_URL);
    await waitFor(() => {
      expect(screen.getByTestId('icon-check')).toBeInTheDocument();
    });
    expect(
      screen.getByRole('button', { name: /Link copied to clipboard/i }),
    ).toBeInTheDocument();
  });
});
