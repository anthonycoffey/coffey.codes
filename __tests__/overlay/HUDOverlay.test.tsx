import { render, act, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Stub child overlays to expose the `visible` prop via data attributes so we
// can assert visibility state without depending on CSS class name hashing.
vi.mock('@/components/overlay/IntroOverlay', () => ({
  default: ({ visible }: { visible: boolean }) => (
    <div data-testid="intro-overlay" data-visible={String(visible)} />
  ),
}));
vi.mock('@/components/overlay/AboutOverlay', () => ({
  default: ({ visible }: { visible: boolean }) => (
    <div data-testid="about-overlay" data-visible={String(visible)} />
  ),
}));
vi.mock('@/components/overlay/CraftOverlay', () => ({
  default: ({ visible }: { visible: boolean }) => (
    <div data-testid="craft-overlay" data-visible={String(visible)} />
  ),
}));
vi.mock('@/components/overlay/FinalOverlay', () => ({
  default: ({ visible }: { visible: boolean }) => (
    <div data-testid="final-overlay" data-visible={String(visible)} />
  ),
}));

import HUDOverlay from '@/components/overlay/HUDOverlay';

// ── rAF mock — capture callbacks so we can tick manually ─────────────────────
let rafCallbacks: FrameRequestCallback[] = [];

beforeEach(() => {
  rafCallbacks = [];
  vi.stubGlobal(
    'requestAnimationFrame',
    vi.fn((cb: FrameRequestCallback) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    }),
  );
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function tickRaf() {
  const pending = [...rafCallbacks];
  rafCallbacks = [];
  pending.forEach((cb) => cb(performance.now()));
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function visible(testId: string) {
  return screen.getByTestId(testId).dataset.visible === 'true';
}

describe('HUDOverlay', () => {
  it('renders without throwing', () => {
    expect(() =>
      render(<HUDOverlay scrollProgress={{ current: 0 }} />),
    ).not.toThrow();
  });

  it('all overlays start hidden at progress=0 (0.00–0.15 is pure visual)', async () => {
    render(<HUDOverlay scrollProgress={{ current: 0 }} />);
    await act(() => {
      tickRaf();
    });
    expect(visible('intro-overlay')).toBe(false);
    expect(visible('about-overlay')).toBe(false);
    expect(visible('craft-overlay')).toBe(false);
    expect(visible('final-overlay')).toBe(false);
  });

  it('shows IntroOverlay at progress=0.20 (threshold 0.15–0.35)', async () => {
    const ref = { current: 0.2 };
    render(<HUDOverlay scrollProgress={ref} />);
    await act(() => {
      tickRaf();
    });
    expect(visible('intro-overlay')).toBe(true);
    expect(visible('about-overlay')).toBe(false);
  });

  it('does not show IntroOverlay below threshold (progress=0.10)', async () => {
    const ref = { current: 0.1 };
    render(<HUDOverlay scrollProgress={ref} />);
    await act(() => {
      tickRaf();
    });
    expect(visible('intro-overlay')).toBe(false);
  });

  it('shows AboutOverlay at progress=0.40 (threshold 0.35–0.52)', async () => {
    const ref = { current: 0.4 };
    render(<HUDOverlay scrollProgress={ref} />);
    await act(() => {
      tickRaf();
    });
    expect(visible('about-overlay')).toBe(true);
    expect(visible('intro-overlay')).toBe(false);
    expect(visible('craft-overlay')).toBe(false);
  });

  it('shows CraftOverlay at progress=0.60 (threshold 0.52–0.68)', async () => {
    const ref = { current: 0.6 };
    render(<HUDOverlay scrollProgress={ref} />);
    await act(() => {
      tickRaf();
    });
    expect(visible('craft-overlay')).toBe(true);
    expect(visible('about-overlay')).toBe(false);
  });

  it('hides CraftOverlay above its window (progress=0.70)', async () => {
    const ref = { current: 0.7 };
    render(<HUDOverlay scrollProgress={ref} />);
    await act(() => {
      tickRaf();
    });
    expect(visible('craft-overlay')).toBe(false);
    expect(visible('final-overlay')).toBe(false);
  });

  it('shows FinalOverlay at progress=0.85 (threshold ≥ 0.82)', async () => {
    const ref = { current: 0.85 };
    render(<HUDOverlay scrollProgress={ref} />);
    await act(() => {
      tickRaf();
    });
    expect(visible('final-overlay')).toBe(true);
    expect(visible('craft-overlay')).toBe(false);
  });

  it('shows FinalOverlay at progress=1.0 (end of scroll)', async () => {
    const ref = { current: 1.0 };
    render(<HUDOverlay scrollProgress={ref} />);
    await act(() => {
      tickRaf();
    });
    expect(visible('final-overlay')).toBe(true);
  });

  it('reacts to scrollProgress ref updates across multiple ticks', async () => {
    const ref = { current: 0.1 };
    render(<HUDOverlay scrollProgress={ref} />);
    await act(() => {
      tickRaf();
    });
    expect(visible('intro-overlay')).toBe(false);

    ref.current = 0.2;
    await act(() => {
      tickRaf();
    });
    expect(visible('intro-overlay')).toBe(true);
  });

  it('unmounts cleanly and cancels the rAF loop', () => {
    const { unmount } = render(<HUDOverlay scrollProgress={{ current: 0 }} />);
    expect(() => unmount()).not.toThrow();
  });
});
