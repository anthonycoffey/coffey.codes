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
    // The component uses 'loading' class initially and slides up when done
    expect(overlay).toHaveClass('loading');
    expect(overlay).not.toHaveClass('-translate-y-full');
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

  it('slides out via the safety cap when no ready signal arrives', () => {
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
    expect(overlay).toHaveClass('-translate-y-full');
    expect(overlay).toHaveClass('pointer-events-none');
  });

  it('slides out immediately when the scene reports ready', () => {
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
    expect(overlay).toHaveClass('-translate-y-full');
    expect(overlay).toHaveClass('pointer-events-none');
  });

  // ── Mobile "tap to explore" gate ──────────────────────────────────────────

  it('in gate mode, shows the tap prompt after typing and never auto-dismisses', () => {
    const { container } = render(<Loader gate={true} />);
    const overlay = container.firstChild as HTMLElement;

    // After typing completes the prompt appears
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(
      screen.getByRole('button', { name: /tap to explore/i }),
    ).toBeInTheDocument();

    // Well past the desktop safety cap, the gate is still showing (no auto-dismiss)
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(overlay).toHaveClass('loading');
  });

  it('gate calls onStart and dismisses once the scene reports ready', () => {
    const onStart = vi.fn();
    const { container, rerender } = render(
      <Loader gate={true} onStart={onStart} />,
    );
    const overlay = container.firstChild as HTMLElement;

    act(() => {
      vi.advanceTimersByTime(600);
    });

    // Tap the gate — starts the experience but stays visible while the scene boots
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /tap to explore/i }));
    });
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(overlay).toHaveClass('loading');

    // Scene reports its first frame — loader dismisses
    act(() => {
      rerender(<Loader gate={true} onStart={onStart} loaded={true} />);
    });
    expect(overlay).toHaveClass('-translate-y-full');
  });

  it('gate force-dismisses via the post-tap safety cap if the scene never loads', () => {
    const { container } = render(<Loader gate={true} />);
    const overlay = container.firstChild as HTMLElement;

    act(() => {
      vi.advanceTimersByTime(600);
    });
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /tap to explore/i }));
    });

    // Still loading shortly after tap
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(overlay).toHaveClass('loading');

    // Past the post-tap cap (8s), it force-dismisses
    act(() => {
      vi.advanceTimersByTime(7000);
    });
    expect(overlay).toHaveClass('-translate-y-full');
  });
});
