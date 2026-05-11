import { CpuChipIcon } from '@heroicons/react/20/solid';
import { ComponentType, SVGProps } from 'react';

export type CaseStudyLayout = 'styleA' | 'styleB';

export type ChartDataPoint = {
  label: string;
  value: number;
};

export type LineChartSeries = {
  name: string;
  data: ChartDataPoint[];
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
  | {
      type: 'lineChart';
      title: string;
      series: LineChartSeries[];
      unit?: string;
    }
  | { type: 'quote'; text: string; author?: string }
  | { type: 'stats'; stats: { label: string; value: string }[] };

export interface CaseStudyData {
  slug: string;
  title: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  tags: string[];
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
    layout: 'styleB',
    story: [
      {
        type: 'text',
        heading: 'The Challenge',
        content:
          "The client's dispatch system had no ability to match technicians to jobs by location. Assignment logic was manual or proximity-blind. Technician latitude and longitude were already being stored on every record, but nothing in the application could query against them — no distance calculations, no spatial indexing, no nearest-neighbor lookups.",
      },
      {
        type: 'text',
        heading: 'The Solution',
        content:
          'Designed and implemented a PostGIS spatial layer from scratch. Selected the GEOGRAPHY data type over GEOMETRY to handle earth-curvature math natively without managing projections. Added GIST indexes on technician and job location columns. Nearest-technician lookups — previously impossible — now resolve in a single indexed spatial query at the database layer, with no application-side coordination.',
      },
      {
        type: 'stats',
        stats: [
          { label: 'Data Type', value: 'GEOGRAPHY' },
          { label: 'Spatial Index', value: 'GIST' },
          { label: 'Projection Mgmt', value: 'None' },
          { label: 'Nearest-Tech Query', value: '1 SQL' },
        ],
      },
      {
        type: 'chart',
        title: 'Capability before PostGIS (self-audit, 0–5)',
        data: [
          { label: 'Spatial queries', value: 0 },
          { label: 'Nearest-tech', value: 0 },
          { label: 'Earth-curve math', value: 0 },
          { label: 'Index support', value: 0 },
          { label: 'Geocoded jobs', value: 1 },
        ],
      },
      {
        type: 'chart',
        title: 'Capability after PostGIS (self-audit, 0–5)',
        data: [
          { label: 'Spatial queries', value: 5 },
          { label: 'Nearest-tech', value: 5 },
          { label: 'Earth-curve math', value: 5 },
          { label: 'Index support', value: 5 },
          { label: 'Geocoded jobs', value: 5 },
        ],
      },
      {
        type: 'text',
        heading: 'The Impact',
        content:
          'Delivered a capability the system never had. Dispatch can now query available technicians by proximity to any geocoded job site in real time. Routing decisions that were previously guessed at by name or assigned by hand now resolve at the database, in milliseconds, with earth-curvature math handled by PostGIS rather than the application layer.',
      },
    ],
  },
];
