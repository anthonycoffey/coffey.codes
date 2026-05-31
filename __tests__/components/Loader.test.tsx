import { render, act } from '@testing-library/react';
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
});
