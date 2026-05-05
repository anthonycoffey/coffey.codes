import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ContactLayout from '@/app/(site)/contact/layout';

describe('ContactLayout', () => {
  it('renders children inside the layout wrapper', () => {
    const { getByText } = render(<ContactLayout>Hello</ContactLayout>);
    expect(getByText('Hello')).toBeInTheDocument();
  });

  it('renders a wrapper div with the standardized chrome classes', () => {
    const { container } = render(<ContactLayout>content</ContactLayout>);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.tagName).toBe('DIV');
    expect(wrapper.className).toContain('max-w-4xl');
    expect(wrapper.className).toContain('mx-auto');
    expect(wrapper.className).toContain('px-4');
    expect(wrapper.className).toContain('min-h-[900px]');
  });

  it('matches snapshot', () => {
    const { container } = render(<ContactLayout>snap</ContactLayout>);
    expect(container.firstChild).toMatchSnapshot();
  });
});
