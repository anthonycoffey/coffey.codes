import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portfolio',
  description:
    'Selected software projects by Anthony Coffey — web applications, AI/ML integrations, and custom development work.',
  alternates: { canonical: '/portfolio' },
};

export default function PortfolioLayout({ // Renamed function for clarity
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:pb-16 min-h-[900px]">
      {children}
    </div>
  );
}
