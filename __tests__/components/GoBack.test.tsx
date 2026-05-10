import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock('@heroicons/react/20/solid', () => ({
  ArrowLongLeftIcon: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="back-icon" {...props} />
  ),
}));

import GoBack from '@/components/GoBack';

beforeEach(() => {
  pushMock.mockClear();
});

describe('GoBack', () => {
  it('renders a <button type="button"> (not an anchor — anchor without href is uncrawlable)', () => {
    const { container } = render(<GoBack />);
    const anchors = container.querySelectorAll('a');
    const buttons = container.querySelectorAll('button');
    expect(anchors.length).toBe(0);
    expect(buttons.length).toBe(1);
    expect(buttons[0].getAttribute('type')).toBe('button');
  });

  it('marks the icon aria-hidden so screen readers only read the visible label', () => {
    const { getByTestId } = render(<GoBack />);
    const icon = getByTestId('back-icon');
    expect(icon.getAttribute('aria-hidden')).toBe('true');
  });

  it('calls history.back() when clicked and history has prior entries', () => {
    const backSpy = vi.spyOn(window.history, 'back').mockImplementation(() => {});
    Object.defineProperty(window.history, 'length', {
      value: 5,
      configurable: true,
    });

    const { getByRole } = render(<GoBack />);
    fireEvent.click(getByRole('button'));

    expect(backSpy).toHaveBeenCalledOnce();
    expect(pushMock).not.toHaveBeenCalled();

    backSpy.mockRestore();
  });

  it('falls back to /articles when there is no history (direct entry)', () => {
    const backSpy = vi.spyOn(window.history, 'back').mockImplementation(() => {});
    Object.defineProperty(window.history, 'length', {
      value: 1,
      configurable: true,
    });

    const { getByRole } = render(<GoBack />);
    fireEvent.click(getByRole('button'));

    expect(backSpy).not.toHaveBeenCalled();
    expect(pushMock).toHaveBeenCalledWith('/articles');

    backSpy.mockRestore();
  });
});
