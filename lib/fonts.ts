import { Outfit } from 'next/font/google';
export { GeistSans } from 'geist/font/sans';
export { GeistMono } from 'geist/font/mono';

export const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});
