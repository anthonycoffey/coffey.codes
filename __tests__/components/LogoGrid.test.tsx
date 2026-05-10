import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      ...rest
    }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...rest}>{children}</div>
    ),
  },
  useInView: () => true,
}));

vi.mock('next/image', () => ({
  default: ({
    alt,
    ...rest
  }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt ?? ''} {...rest} />
  ),
}));

import LogoGrid from '@/components/LogoGrid';

describe('LogoGrid', () => {
  it('renders an Image for each logo with a sizes attribute (responsive image hint)', () => {
    const { container } = render(
      <LogoGrid logos={['react.svg', 'typescript.svg']} />,
    );
    const imgs = container.querySelectorAll('img');
    expect(imgs.length).toBe(2);
    imgs.forEach((img) => {
      expect(img.getAttribute('sizes')).toBeTruthy();
    });
  });

  it('declares explicit width and height for CLS reservation', () => {
    const { container } = render(<LogoGrid logos={['react.svg']} />);
    const img = container.querySelector('img');
    expect(img?.getAttribute('width')).toBe('200');
    expect(img?.getAttribute('height')).toBe('200');
  });

  it('strips .svg from alt text for cleaner accessibility names', () => {
    const { container } = render(<LogoGrid logos={['react.svg']} />);
    const img = container.querySelector('img');
    expect(img?.getAttribute('alt')).toBe('react');
  });
});
