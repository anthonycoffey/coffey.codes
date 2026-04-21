import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search Software Engineering Articles',
  description:
    'Search articles by Anthony Coffey on software engineering, AI/ML, cloud architecture, and web development.',
  alternates: { canonical: '/articles/search' },
  robots: { index: false, follow: true },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
