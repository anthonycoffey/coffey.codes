import { Outfit, Source_Serif_4 } from 'next/font/google';
export { GeistSans } from 'geist/font/sans';
export { GeistMono } from 'geist/font/mono';

export const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

// Editorial serif used for article and taxonomy headings (display only).
// Body remains Outfit. See docs/specs/active/SPEC-008-article-typography-theming.md.
export const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-editorial',
  display: 'swap',
  weight: ['400', '600', '700'],
});
