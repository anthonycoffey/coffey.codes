import {
  ClipboardDocumentCheckIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/20/solid';
import Link from 'next/link';

export const metadata = {
  title: 'Case Studies',
  description:
    'Explore detailed case studies that showcase my expertise and approach to solving complex challenges.',
};

export default async function Page({ searchParams }) {
  return (
    <section>
      <div className="page-content">
        <h1 className="font-semibold text-2xl lg:text-3xl tracking-tighter">
          <ClipboardDocumentCheckIcon className="w-6 h-6 inline mr-2" /> Case
          Studies
        </h1>
        <span className="prose lg:prose-xl text-neutral-200">
          Explore detailed case studies that showcase my expertise and approach
          to solving complex challenges.
        </span>
        <div className="mt-4 bg-gray-800 p-2 rounded-xl flex items-start space-x-4">
          <div className="flex-shrink-0">
            <ArrowDownTrayIcon className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <a
              href="/case-studies/Case%20Study%20-%20PostGIS%20in%20Action.pdf"
              target="_blank"
              className="text-blue-400 hover:underline"
            >
              PostGIS in Action: Streamlining Fleet Operations with Geospatial
              Precision
            </a>
            <p className="text-neutral-200 text-sm mt-1">
              I integrated PostGIS to optimize the client's technician dispatch
              by leveraging existing location data for efficient, scalable
              geospatial queries. This solution streamlined operations without
              disrupting current workflows.
            </p>

            <Link
              href="/case-studies/Case%20Study%20-%20PostGIS%20in%20Action.pdf"
              className="btn"
              target="_blank"
            >
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                View Case Study
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
