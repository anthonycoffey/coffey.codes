import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portfolio | Anthony Coffey',
  description: 'Explore a selection of software development projects by Anthony Coffey, showcasing expertise in web applications, AI integration, and more.',
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
