import { act, render } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('next/dynamic', () => ({
  default: () => () => <div data-testid="comments-stub" />,
}));

import CommentsLazy from '@/components/CommentsLazy';

describe('CommentsLazy', () => {
  let observers: Array<{
    callback: IntersectionObserverCallback;
    observe: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
  }>;

  beforeEach(() => {
    observers = [];
    class MockIntersectionObserver {
      callback: IntersectionObserverCallback;
      observe = vi.fn();
      disconnect = vi.fn();
      unobserve = vi.fn();
      takeRecords = vi.fn(() => []);
      root = null;
      rootMargin = '';
      thresholds: ReadonlyArray<number> = [];

      constructor(cb: IntersectionObserverCallback) {
        this.callback = cb;
        observers.push({
          callback: cb,
          observe: this.observe,
          disconnect: this.disconnect,
        });
      }
    }
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('wraps content in an aria-labelled Comments section', () => {
    const { container } = render(<CommentsLazy />);
    const section = container.querySelector('section[aria-label="Comments"]');
    expect(section).not.toBeNull();
  });

  it('does not mount Comments until the sentinel intersects', () => {
    const { queryByTestId } = render(<CommentsLazy />);
    expect(queryByTestId('comments-stub')).toBeNull();
  });

  it('mounts Comments after the sentinel intersects', () => {
    const { queryByTestId, container } = render(<CommentsLazy />);
    expect(observers.length).toBe(1);
    act(() => {
      observers[0].callback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        observers[0] as unknown as IntersectionObserver,
      );
    });
    expect(queryByTestId('comments-stub')).not.toBeNull();
    expect(
      container.querySelector('section[aria-label="Comments"]'),
    ).not.toBeNull();
  });
});
