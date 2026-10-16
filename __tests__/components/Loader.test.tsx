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
    // The component uses 'loading' class initially and fades out when done
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

  it('gate calls onStart and fades out synchronously on tap', () => {
    const onStart = vi.fn();
    const { container } = render(<Loader gate={true} onStart={onStart} />);
    const overlay = container.firstChild as HTMLElement;

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    // Tap the gate — the overlay fades away immediately, WITHOUT waiting on any
    // `loaded` signal. This is the guarantee: a tap can never leave the overlay
    // hanging on a WebGL-ready signal that may be slow or never arrive.
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /tap to enter/i }));
    });
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(overlay).toHaveClass('opacity-0');
    expect(overlay).toHaveClass('pointer-events-none');
  });

  it('gate dismisses on tap even if the scene never reports ready', () => {
    const { container } = render(<Loader gate={true} />);
    const overlay = container.firstChild as HTMLElement;

    // Wait for the bar to fill so the gate button is available, then tap.
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /tap to enter/i }));
    });

    // No `loaded` prop is ever passed and no further timers are advanced: the
    // dismissal comes purely from the tap, not from any post-tap timeout.
    expect(overlay).toHaveClass('opacity-0');

    // ...and advancing well past the old 8s cap changes nothing (it's gone).
    act(() => {
      vi.advanceTimersByTime(9000);
    });
    expect(overlay).toHaveClass('opacity-0');
  });

  // ── Gate waits on a REAL ready signal (BUG-001) ────────────────────────────

  it('withholds the gate until a mounted scene reports ready', () => {
    const { container } = render(<Loader gate={true} sceneMounted={true} />);
    const overlay = container.firstChild as HTMLElement;

    // Bar has filled, but the scene (already mounting behind the overlay) has
    // not reported a rendered frame — so "SCENE LOADED." would be a lie and the
    // gate stays hidden.
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(screen.queryByRole('button', { name: /enter/i })).toBeNull();
    expect(screen.queryByText(/SCENE LOADED\./)).toBeNull();
    expect(overlay).toHaveClass('loading');
  });

  it('reveals the gate once a mounted scene reports ready', () => {
    const { rerender } = render(<Loader gate={true} sceneMounted={true} />);

    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(screen.queryByRole('button', { name: /enter/i })).toBeNull();

    // The scene paints its first frame — now the claim is true.
    act(() => {
      rerender(<Loader gate={true} sceneMounted={true} loaded={true} />);
    });
    expect(screen.getByRole('button', { name: /enter/i })).toBeInTheDocument();
    expect(screen.getByText(/SCENE LOADED\./)).toBeInTheDocument();
  });

  it('still respects the bar-fill floor when the scene is ready early', () => {
    render(<Loader gate={true} sceneMounted={true} loaded={true} />);

    // Ready from the first render, but the bar has not visibly filled yet — the
    // gate must not pop in over a half-full bar.
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(screen.queryByRole('button', { name: /enter/i })).toBeNull();

    act(() => {
      vi.advanceTimersByTime(1100);
    });
    expect(screen.getByRole('button', { name: /enter/i })).toBeInTheDocument();
  });

  it('reveals the gate at the safety cap if a mounted scene never reports ready', () => {
    render(<Loader gate={true} sceneMounted={true} />);

    // WebGL failed to init, or the tab was backgrounded so no frame ever ran.
    // The visitor must never be trapped behind a gate that cannot unlock.
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(screen.queryByRole('button', { name: /enter/i })).toBeNull();

    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(screen.getByRole('button', { name: /enter/i })).toBeInTheDocument();
  });

  it('reveals the gate at bar-fill when no scene is mounted yet', () => {
    // No interaction has occurred, so the canvas is not mounting and there is
    // nothing to wait for — the visitor should not be made to wait for a signal
    // that cannot arrive until they click.
    render(<Loader gate={true} sceneMounted={false} />);

    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(screen.getByRole('button', { name: /enter/i })).toBeInTheDocument();
  });

  it('does not re-hide a revealed gate when the scene mounts late', () => {
    const { rerender } = render(<Loader gate={true} sceneMounted={false} />);

    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(screen.getByRole('button', { name: /enter/i })).toBeInTheDocument();

    // A pointer move lands just after the gate appeared: the canvas starts
    // mounting. The button must not flicker away under the cursor.
    act(() => {
      rerender(<Loader gate={true} sceneMounted={true} />);
    });
    expect(screen.getByRole('button', { name: /enter/i })).toBeInTheDocument();
  });

  it('in gate mode, never auto-dismisses just because the scene is ready', () => {
    const { container, rerender } = render(
      <Loader gate={true} sceneMounted={true} />,
    );
    const overlay = container.firstChild as HTMLElement;

    act(() => {
      vi.advanceTimersByTime(1500);
    });
    act(() => {
      rerender(<Loader gate={true} sceneMounted={true} loaded={true} />);
    });

    // Readiness unlocks the gate; it must not tear the splash away unprompted.
    // Only the visitor's click dismisses a gated loader.
    expect(overlay).toHaveClass('loading');
    expect(overlay).not.toHaveClass('opacity-0');
    expect(screen.getByRole('button', { name: /enter/i })).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(overlay).toHaveClass('loading');
  });
});
