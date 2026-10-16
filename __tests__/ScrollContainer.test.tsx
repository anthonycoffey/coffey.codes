import { render, act, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// GSAP touches the DOM — mock it entirely in jsdom
const mockTrigger = { kill: vi.fn() };
vi.mock('gsap', () => ({
  gsap: {
    registerPlugin: vi.fn(),
    context: vi.fn((fn: () => void) => {
      fn();
      return { revert: vi.fn() };
    }),
  },
  default: {
    registerPlugin: vi.fn(),
    context: vi.fn((fn: () => void) => {
      fn();
      return { revert: vi.fn() };
    }),
  },
}));
vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {
    create: vi.fn(() => mockTrigger),
    kill: vi.fn(),
    getAll: vi.fn(() => []),
    config: vi.fn(),
  },
}));

// `next/dynamic` would resolve the real WebGL canvas asynchronously. Swap it for
// a synchronous stub so tests can assert exactly WHEN the canvas mounts — which
// is the whole point of the entry gate (see BUG-001).
vi.mock('next/dynamic', () => ({
  default: () => function WorldCanvasStub() {
    return <div data-testid="world-canvas" />;
  },
}));

import ScrollContainer from '@/components/ScrollContainer';

const canvas = () => screen.queryByTestId('world-canvas');

describe('ScrollContainer', () => {
  it('renders the scroll container', () => {
    render(<ScrollContainer />);
    expect(document.getElementById('scroll-container')).toBeInTheDocument();
  });

  it('renders the HUD overlay layer', () => {
    const { container } = render(<ScrollContainer />);
    // The overlay div should be present (from HUDOverlay)
    const overlayDivs = container.querySelectorAll('[class*="overlay"]');
    expect(overlayDivs.length).toBeGreaterThan(0);
  });

  it('does not render a scroll track', () => {
    render(<ScrollContainer />);
    expect(document.getElementById('scroll-track')).toBeNull();
  });

  // ── Canvas mount timing (BUG-001) ──────────────────────────────────────────
  //
  // The scene must load WHILE the loading overlay is up, not after the visitor
  // clicks through it. But it must still never mount for a synthetic lab run
  // (Lighthouse/PSI), which is what protects the homepage perf score. The
  // discriminator is real user input: a lab run generates none.

  describe('canvas mount timing', () => {
    it('does not mount the canvas before any user interaction', () => {
      render(<ScrollContainer />);
      expect(canvas()).toBeNull();
    });

    it.each([
      ['pointermove', () => fireEvent.pointerMove(window)],
      ['pointerdown', () => fireEvent.pointerDown(window)],
      ['keydown', () => fireEvent.keyDown(window, { key: 'Tab' })],
      ['wheel', () => fireEvent.wheel(window)],
      ['touchstart', () => fireEvent.touchStart(window)],
    ])('mounts the canvas on %s, before the visitor enters', (_name, fire) => {
      render(<ScrollContainer />);
      expect(canvas()).toBeNull();

      act(() => {
        fire();
      });

      // Canvas is mounting and initializing...
      expect(canvas()).toBeInTheDocument();
      // ...while the loading overlay is still covering it. This is the fix:
      // the "LOADING..." animation now overlaps real scene init.
      expect(screen.getByTestId('loader-overlay')).toHaveClass('loading');
    });

    it('mounts the canvas only once across repeated interaction', () => {
      render(<ScrollContainer />);

      act(() => {
        fireEvent.pointerMove(window);
        fireEvent.wheel(window);
        fireEvent.keyDown(window, { key: 'ArrowDown' });
      });

      expect(screen.getAllByTestId('world-canvas')).toHaveLength(1);
    });
  });

  describe('entry without prior interaction', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it('mounts the canvas on entry as a fallback', () => {
      render(<ScrollContainer />);

      // No interaction event was ever seen, so the gate unlocks on the bar-fill
      // floor alone and the canvas is still unmounted.
      act(() => {
        vi.advanceTimersByTime(1500);
      });
      expect(canvas()).toBeNull();

      act(() => {
        fireEvent.click(screen.getByRole('button', { name: /enter/i }));
      });
      expect(canvas()).toBeInTheDocument();
    });
  });
});
