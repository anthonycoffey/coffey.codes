import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock('next/image', () => ({
  default: ({
    alt,
    ...rest
  }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt ?? ''} {...rest} />
  ),
}));

vi.mock('@heroicons/react/20/solid', () => ({
  HomeIcon: () => null,
  DocumentTextIcon: () => null,
  EnvelopeIcon: () => null,
  RssIcon: () => null,
  ArrowUpCircleIcon: () => null,
  ArrowDownTrayIcon: () => null,
  CodeBracketIcon: () => null,
  ChatBubbleOvalLeftIcon: () => null,
  CalendarDaysIcon: () => null,
  BriefcaseIcon: () => null,
  ClipboardDocumentCheckIcon: () => null,
}));

vi.mock('@/components/SocialIcons', () => ({
  default: () => null,
}));

import Footer from '@/components/Footer';

const originalDescriptor = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  'scrollHeight',
);

beforeEach(() => {
  // Replace ResizeObserver with a controllable stub
  // jsdom does not implement ResizeObserver
  (
    globalThis as unknown as { ResizeObserver: typeof ResizeObserver }
  ).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

afterEach(() => {
  if (originalDescriptor) {
    Object.defineProperty(
      HTMLElement.prototype,
      'scrollHeight',
      originalDescriptor,
    );
  }
});

describe('Footer scroll handler reflow guard', () => {
  it('reads document.documentElement.scrollHeight at most once across many scroll events (no per-tick reflow)', () => {
    const getter = vi.fn(() => 5000);
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      get: getter,
    });

    render(<Footer />);

    // Snapshot how many times scrollHeight was read up to and including
    // the initial handleScroll() call in useEffect.
    const initialReads = getter.mock.calls.length;

    // Fire many scroll events. A reflow-prone implementation would call
    // the scrollHeight getter once per event.
    act(() => {
      for (let i = 0; i < 10; i++) {
        window.dispatchEvent(new Event('scroll'));
      }
    });

    const totalReads = getter.mock.calls.length;
    const readsDuringScroll = totalReads - initialReads;

    // Strict: zero scrollHeight reads inside scroll handler. The cached
    // value (set up via ResizeObserver) is what the handler should consume.
    expect(readsDuringScroll).toBe(0);
  });
});
