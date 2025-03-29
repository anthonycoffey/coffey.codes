import {
  ClipboardDocumentCheckIcon,
  ArrowDownTrayIcon,
  CpuChipIcon,
} from '@heroicons/react/20/solid';
import Link from 'next/link';

export const metadata = {
  title: 'Case Studies | Professional Portfolio',
  description:
    'Explore detailed case studies that showcase my expertise and approach to solving real-world problems with technology.',
};

const CaseStudyCard = ({ icon, title, description, pdfPath, tags }) => {
  const Icon = icon;

  return (
    <div className="mt-6 bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 bg-blue-50 p-3 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h2 className="font-medium text-lg text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600 mb-4">{description}</p>

          {tags && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">PDF Case Study</span>
            <Link
              href={pdfPath}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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
        <div className="border-b pb-4 mb-8">
          <h1 className="font-bold text-3xl lg:text-4xl tracking-tighter mb-2 flex items-center">
            <ClipboardDocumentCheckIcon className="w-8 h-8 inline mr-3 text-blue-600" />
            Case Studies
          </h1>
          <p className="text-gray-600 max-w-2xl">
          Explore detailed case studies that showcase my expertise and approach to solving real-world problems with technology.</p>
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

        <div className="mt-12 bg-blue-50 p-6 rounded-xl border border-blue-100">
          <h2 className="text-xl font-medium text-blue-900 mb-2">
            Need a custom solution?
          </h2>
          <p className="text-blue-800 mb-4">
            I specialize in solving problems with tech. Let&apos;s discuss
            how my expertise can help your business.
          </p>
          <Link
            href="/contact"
            className="inline-block px-5 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            Get in touch
          </Link>
        </div>
      </div>
    </section>
  );
}
