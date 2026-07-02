import {
  ClipboardDocumentCheckIcon,
  ChevronRightIcon,
} from '@heroicons/react/20/solid';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import { caseStudies } from './case-studies';
import { baseUrl } from '@/app/sitemap';

import type { Metadata } from 'next';

const CASE_STUDIES_DESCRIPTION =
  'Software engineering case studies by Anthony Coffey, geospatial tech, fleet optimization, and real-world problem solving.';
const CASE_STUDIES_OG_IMAGE = `${baseUrl}/og?title=${encodeURIComponent('Case Studies')}&category=${encodeURIComponent('Anthony Coffey')}`;

export const metadata: Metadata = {
  title: 'Case Studies',
  description: CASE_STUDIES_DESCRIPTION,
  alternates: { canonical: '/case-studies' },
  openGraph: {
    type: 'website',
    url: '/case-studies',
    title: 'Case Studies by Anthony Coffey',
    description: CASE_STUDIES_DESCRIPTION,
    images: [{ url: CASE_STUDIES_OG_IMAGE }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Case Studies by Anthony Coffey',
    description: CASE_STUDIES_DESCRIPTION,
    images: [CASE_STUDIES_OG_IMAGE],
  },
};

const CaseStudyCard = ({ icon, title, description, slug, tags }) => {
  const Icon = icon;

  return (
    <div className="mt-6 bg-surface border border-border p-6 rounded-xl hover:bg-surface-hover transition-colors duration-300">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 bg-bg-alt p-3 rounded-lg border border-border">
          <Icon className="w-6 h-6 text-accent1-dark" />
        </div>
        <div className="flex-1">
          <h2 className="font-outfit font-medium text-lg text-c-heading mb-2">
            <Link
              href={`/case-study/${slug}`}
              className="hover:text-accent1-dark transition-colors"
            >
              {title}
            </Link>
          </h2>
          <p className="text-c-text mb-4">{description}</p>

          {tags && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-xs bg-bg-alt text-c-muted px-2 py-1 rounded-md border border-border"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-sm text-c-muted">Case Study</span>
            <Link
              href={`/case-study/${slug}`}
              className="flex items-center space-x-2 px-4 py-2 bg-accent1-dark text-surface rounded-full hover:opacity-90 transition-opacity"
            >
              <span>Read Case Study</span>
              <ChevronRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default async function CaseStudiesPage() {

  return (
    <>
      <PageHeader
        title="Case Studies"
        icon={ClipboardDocumentCheckIcon}
        description="Explore detailed case studies that showcase my expertise and approach to solving real-world problems with technology."
      />

      {/* Newest first: the caseStudies array is maintained in chronological
          (oldest -> newest) append order, so render it reversed to surface the
          most recent case study at the top. */}
      <div className="space-y-6">
        {[...caseStudies].reverse().map((study) => (
          <CaseStudyCard
            key={study.slug}
            icon={study.icon}
            title={study.title}
            description={study.description}
            slug={study.slug}
            tags={study.tags}
          />
        ))}
      </div>

    </>
  );
}
