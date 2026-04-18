import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import FinalOverlay from '@/components/overlay/FinalOverlay';

describe('FinalOverlay', () => {
  it('renders the headline text', () => {
    render(<FinalOverlay visible={true} />);
    expect(screen.getByText(/Want to know more/)).toBeInTheDocument();
  });

  it('renders the contact link', () => {
    render(<FinalOverlay visible={true} />);
    expect(
      screen.getByRole('link', { name: /contact me/i }),
    ).toBeInTheDocument();
  });

  it('applies visible CSS class when visible=true', () => {
    const { container } = render(<FinalOverlay visible={true} />);
    expect(container.firstElementChild?.className).toMatch(/visible/);
  });

  it('does not apply visible CSS class when visible=false', () => {
    const { container } = render(<FinalOverlay visible={false} />);
    expect(container.firstElementChild?.className).not.toMatch(/visible/);
  });

  it('unmounts cleanly', () => {
    const { unmount } = render(<FinalOverlay visible={true} />);
    expect(() => unmount()).not.toThrow();
  });
});
