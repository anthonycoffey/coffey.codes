import {
  ClipboardDocumentCheckIcon,
  ArrowDownTrayIcon,
  CpuChipIcon,
} from '@heroicons/react/20/solid';
import Link from 'next/link';

export const metadata = {
  title: 'Case Studies | Anthony Coffey - Solutions Architect, AI/ML',
  description:
    'Explore detailed software development case studies by Anthony Coffey, Solutions Architect & AI/ML Specialist, showcasing problem-solving approaches and results in areas like geospatial tech, optimization, and more.',
};

const CaseStudyCard = ({ icon, title, description, pdfPath, tags }) => {
  const Icon = icon;

  return (
    <div className="mt-6 bg-surface border border-border p-6 rounded-xl hover:bg-surface-hover transition-colors duration-300">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 bg-bg-alt p-3 rounded-lg border border-border">
          <Icon className="w-6 h-6 text-accent1-dark" />
        </div>
        <div className="flex-1">
          <h2 className="font-fraunces font-medium text-lg text-c-heading mb-2">{title}</h2>
          <p className="text-c-text mb-4">{description}</p>

          {tags && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag, index) => (
                <span key={index} className="text-xs bg-bg-alt text-c-muted px-2 py-1 rounded-md border border-border">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-sm text-c-muted">PDF Case Study</span>
            <Link
              href={pdfPath}
              className="flex items-center space-x-2 px-4 py-2 bg-accent1-dark text-surface rounded-full hover:opacity-90 transition-opacity"
              target="_blank"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              <span>Download</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default async function CaseStudiesPage() {
  const caseStudies = [
    {
      icon: CpuChipIcon,
      title:
        'PostGIS in Action: Streamlining Fleet Operations with Geospatial Precision',
      description:
        'Integrated PostGIS extension for PostgreSQL to optimize technician dispatch by leveraging pre-existing location data for efficient, scalable geospatial queries. This solution streamlined operations without disrupting legacy workflows.',
      pdfPath: '/case-studies/Case%20Study%20-%20PostGIS%20in%20Action.pdf',
      tags: [
        'PostgreSQL',
        'PostGIS',
        'Geospatial',
        'Fleet Management',
        'Optimization',
      ],
    },
  ];

  return (
    <section>
      <div className="page-content">
        <div className="border-b border-border pb-4 mb-8">
          <h1 className="font-fraunces font-bold text-3xl lg:text-4xl tracking-tighter mb-2 flex items-center text-c-heading">
            <ClipboardDocumentCheckIcon className="w-8 h-8 inline mr-3 text-accent1-dark" />
            Case Studies
          </h1>
          <p className="text-c-muted max-w-2xl">
            Explore detailed case studies that showcase my expertise and
            approach to solving real-world problems with technology.
          </p>
        </div>

        <div className="space-y-6">
          {caseStudies.map((study, index) => (
            <CaseStudyCard
              key={index}
              icon={study.icon}
              title={study.title}
              description={study.description}
              pdfPath={study.pdfPath}
              tags={study.tags}
            />
          ))}
        </div>

        <div className="mt-12 bg-bg-alt p-6 rounded-xl border border-border">
          <h2 className="font-fraunces text-xl font-medium text-c-heading mb-2">
            Need a custom solution?
          </h2>
          <p className="text-c-text mb-4">
            I specialize in solving problems with tech. Let&apos;s discuss how
            my expertise can help your business.
          </p>
          <Link
            href="/contact"
            className="inline-block px-5 py-2.5 bg-accent1-dark text-surface font-medium rounded-full hover:opacity-90 transition-opacity"
          >
            Get in touch
          </Link>
        </div>
      </div>
    </section>
  );
}
