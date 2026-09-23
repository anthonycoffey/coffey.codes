import { render, act, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Loader from '@/components/Loader';

describe('Loader', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 0;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders initially with the loading overlay visible', () => {
    const { container } = render(<Loader />);
    const overlay = container.firstChild as HTMLElement;
    // The component uses the 'loading' class initially and fades out when done.
    expect(overlay).toHaveClass('loading');
    expect(overlay).not.toHaveClass('opacity-0');
  });

  it('types out "LOADING..." character by character', () => {
    const { getByText, queryByText } = render(<Loader />);

    // Initially, text is empty
    expect(queryByText('LOADING...')).not.toBeInTheDocument();

    // Fast-forward 250ms (5 chars at 50ms each) -> should have typed "LOADI"
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(getByText(/LOADI/)).toBeInTheDocument();

    // Fast-forward past the total typing time (10 chars * 50ms = 500ms)
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(getByText(/LOADING\.\.\./)).toBeInTheDocument();
  });

  it('toggles cursor from solid to blinking after typing completes', () => {
    const { container } = render(<Loader />);
    const cursor = container.querySelector('span');

    // Initially solid (no animate-blink class)
    expect(cursor).not.toHaveClass('animate-blink');

    // Fast forward past typing completion (500ms+)
    act(() => {
      vi.advanceTimersByTime(600);
    });

    // Now it should blink
    expect(cursor).toHaveClass('animate-blink');
  });

  it('fades out via the safety cap when no ready signal arrives', () => {
    const { container } = render(<Loader />);
    const overlay = container.firstChild as HTMLElement;

    // Before the safety cap (1500ms)
    act(() => {
      vi.advanceTimersByTime(1400);
    });
    expect(overlay).toHaveClass('loading');

    // After the safety cap fires
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(overlay).toHaveClass('opacity-0');
    expect(overlay).toHaveClass('pointer-events-none');
  });

  it('fades out immediately when the scene reports ready', () => {
    const { container, rerender } = render(<Loader loaded={false} />);
    const overlay = container.firstChild as HTMLElement;

    // Still loading well before the safety cap
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(overlay).toHaveClass('loading');

    // Scene signals first frame — loader dismisses without waiting for the cap
    act(() => {
      rerender(<Loader loaded={true} />);
    });
    expect(overlay).toHaveClass('opacity-0');
    expect(overlay).toHaveClass('pointer-events-none');
  });

  // ── Mobile "tap to enter" gate ─────────────────────────────────────────────

  it('in gate mode, shows the tap prompt after typing and never auto-dismisses', () => {
    const { container } = render(<Loader gate={true} />);
    const overlay = container.firstChild as HTMLElement;

    // The gate only appears after the bar has filled (~1.3s), not right after
    // the intro typing finishes — so it never shows over a half-full bar.
    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(screen.queryByRole('button', { name: /tap to enter/i })).toBeNull();
    expect(screen.queryByText(/SCENE LOADED\./)).toBeNull();

    // Once the bar has filled, the prompt + "SCENE LOADED." appear and the bar
    // is hidden (the blinking cursor stays).
    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(
      screen.getByRole('button', { name: /tap to enter/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/SCENE LOADED\./)).toBeInTheDocument();
    expect(container.querySelector('.bg-zinc-900')).toBeNull();

    // Well past the desktop safety cap, the gate is still showing (no auto-dismiss)
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(overlay).toHaveClass('loading');
  });

  it('gate calls onStart on tap and cross-fades out when the scene reports ready', () => {
    const onStart = vi.fn();
    const { container, rerender } = render(
      <Loader gate={true} onStart={onStart} />,
    );
    const overlay = container.firstChild as HTMLElement;

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    // Tap the gate — the experience starts, but the overlay HOLDS (stays up) so
    // it can cross-fade with the scene rather than snapping away first.
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /tap to enter/i }));
    });
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(overlay).toHaveClass('loading');
    expect(overlay).not.toHaveClass('opacity-0');

    // Parent stops gating once started; scene then reports its first frame —
    // the overlay fades out on the same signal that fades the scene in.
    act(() => {
      rerender(<Loader gate={false} onStart={onStart} loaded={true} />);
    });
    expect(overlay).toHaveClass('opacity-0');
    expect(overlay).toHaveClass('pointer-events-none');
  });

  it('gate still dismisses via a bounded fallback if the scene never reports ready', () => {
    const { container } = render(<Loader gate={true} />);
    const overlay = container.firstChild as HTMLElement;

    // Wait for the bar to fill so the gate button is available, then tap.
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /tap to enter/i }));
    });

    // Immediately after the tap it HOLDS, waiting to cross-fade with the scene.
    expect(overlay).toHaveClass('loading');

    // No `loaded` ever arrives — but the bounded post-tap fallback (2500ms) still
    // dismisses it, so a tap can never leave the overlay hanging.
    act(() => {
      vi.advanceTimersByTime(2500);
    });
    expect(overlay).toHaveClass('opacity-0');
    expect(overlay).toHaveClass('pointer-events-none');
  });
});
