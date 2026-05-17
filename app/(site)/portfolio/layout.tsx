import type { Metadata } from 'next';
import '@/styles/portfolio-cards.sass';
// Same MDX prose styling articles + case-studies use. Portfolio items
// at /portfolio/[slug] render MDX content (code blocks, inline code,
// mermaid charts, callouts) and need these rules to match the rest of
// the site's documentation surface.
import '@/styles/article-prose.sass';

export const metadata: Metadata = {
  title: 'Portfolio',
  description:
    'Selected software projects by Anthony Coffey — web apps, mobile apps, AI/ML integrations, and custom development work from an Austin software engineer.',
  alternates: { canonical: '/portfolio' },
};

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 md:pb-16 min-h-[900px]">
      {children}
    </div>
  );
}
