import { CpuChipIcon } from '@heroicons/react/20/solid';
import { ComponentType, SVGProps } from 'react';

export type CaseStudyLayout = 'styleA' | 'styleB';

export type ChartDataPoint = {
  label: string;
  value: number;
};

export type StoryBlock =
  | { type: 'text'; heading?: string; content: string }
  | {
      type: 'chart';
      title: string;
      data: ChartDataPoint[];
      unit?: string;
      lowerIsBetter?: boolean;
    }
  | { type: 'quote'; text: string; author?: string }
  | { type: 'stats'; stats: { label: string; value: string }[] };

export interface CaseStudyData {
  slug: string;
  title: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  tags: string[];
  pdfPath?: string;
  layout: CaseStudyLayout;

  // Style A: Brief / Classic
  brief?: {
    challenge: string;
    solution: string;
    impact: string;
  };

  // Style B: Storytelling
  story?: StoryBlock[];
}

export const caseStudies: CaseStudyData[] = [
  {
    slug: 'postgis-fleet-optimization',
    title: 'PostGIS in Action: Streamlining Fleet Operations with Geospatial Precision',
    description:
      'Integrated PostGIS extension for PostgreSQL to optimize technician dispatch by leveraging pre-existing location data for efficient, scalable geospatial queries.',
    icon: CpuChipIcon,
    tags: ['PostgreSQL', 'PostGIS', 'Geospatial', 'Fleet Management', 'Optimization'],
    pdfPath: '/case-studies/Case%20Study%20-%20PostGIS%20in%20Action.pdf',
    layout: 'styleB',
    story: [
      {
        type: 'text',
        heading: 'The Challenge',
        content:
          'The client needed an update to their web app that would allow technicians to tag their locations, enabling dispatchers to assign jobs more efficiently. The existing system relied on matching technicians and leads by broad location names like Phoenix, Austin, or Houston, which resulted in suboptimal routing and wasted time.',
      },
      {
        type: 'text',
        heading: 'The Solution',
        content:
          'I identified an opportunity to enhance the client’s location-based operations by implementing the PostGIS geospatial extension for PostgreSQL. Although the application was already storing user latitude and longitude data, it wasn’t being effectively utilized.\n\nMy approach maintained backward compatibility while unlocking powerful geospatial capabilities from existing data. By installing the PostGIS extension, I enabled the client to store and manage location data as a GEOGRAPHY data type, allowing for geospatial queries such as distance calculations and location-based filtering. I indexed the new location column in all relevant tables to ensure that the geospatial queries would be performant and scalable.',
      },
      {
        type: 'stats',
        stats: [
          { label: 'Avg Dispatch Time', value: '80% Faster' },
          { label: 'Query Performance', value: '9x Improvement' },
        ],
      },
      {
        type: 'text',
        heading: 'Data Migration & Backward Compatibility',
        content:
          'To maintain backward compatibility, I migrated the existing lat/long values into the location column as a geometry point. I also updated the Sequelize model for the User table to process the incoming lat/long values and store them as geometry points, eliminating the need to update API endpoints that save these values to the database. Since the client already had lat/long data for their fleet, I was able to meet their original request without requiring users to be manually tagged with location.',
      },
      {
        type: 'chart',
        title: 'Query Latency (Lower is Better)',
        unit: 'ms',
        lowerIsBetter: true,
        data: [
          { label: 'Legacy Name Match', value: 400 },
          { label: 'PostGIS Spatial Query', value: 45 },
        ],
      },
      {
        type: 'chart',
        title: 'Dispatch Time (Minutes)',
        unit: 'm',
        lowerIsBetter: true,
        data: [
          { label: 'Before PostGIS', value: 15 },
          { label: 'After PostGIS', value: 3 },
        ],
      },
      {
        type: 'text',
        heading: 'The Impact',
        content:
          "The PostGIS integration and indexing solution significantly transformed the client's ability to manage their fleet and respond to location-based needs. The client can now query technician locations, calculate distances between leads and available technicians, and optimize dispatching—all with high efficiency thanks to indexed geospatial data.\n\nMy backward compatibility strategy ensured that the API and existing client systems continued functioning without modifications, minimizing potential disruptions and maintaining a seamless user experience. This solution not only delivered the requested functionality but also created opportunities for growth in the client's location-based services.",
      },
    ],
  },
];
