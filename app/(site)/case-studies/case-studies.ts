import { ChartBarIcon, CpuChipIcon } from '@heroicons/react/20/solid';
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
  {
    slug: 'data-driven-seo-pipeline',
    title:
      'Data-Driven SEO: From Quarterly Audit to Custom Tooling and AI Agent Workflows',
    description:
      'Built coffey.codes a repeatable SEO operation from scratch: quantitative audits via Search Console MCP, structured-data hardening across every page, a four-engine custom snapshot pipeline (GSC, GA4, Bing, Google Ads), and AI agent workflows that produce editorial reports on demand.',
    icon: ChartBarIcon,
    tags: [
      'SEO',
      'Google Search Console',
      'GA4',
      'Bing Webmaster Tools',
      'Google Ads API',
      'MCP',
      'Claude Code',
      'Structured Data',
      'JSON-LD',
      'Node.js',
    ],
    layout: 'styleB',
    story: [
      {
        type: 'text',
        heading: 'The Challenge',
        content:
          "Even a personal site needs to be findable, and coffey.codes had no quantitative picture of how it was actually performing in search. The site was indexed and ranking on something, but the harder questions had never been asked: which queries were earning impressions, where clicks were falling off, whether any pages were regressing. SEO posture was a feeling, not a number.\n\nThe goal was to turn it into a repeatable, data-driven operation. Every quarter should be able to rerun the same analysis, compare to the previous quarter, and surface drift without anyone having to remember which screenshots were taken when.",
      },
      {
        type: 'text',
        heading: 'Phase 1: Quantitative audit',
        content:
          "The Q2 audit was a 365-day pull driven entirely through the Google Search Console MCP from inside Claude Code. Every datapoint came from the API, not from the GSC UI's exports. That constraint mattered: it meant the next quarter could rerun the same calls and produce a directly comparable report instead of one human's screenshot pile. Bing Webmaster Tools and GA4 were added alongside for the three-engine picture.",
      },
      {
        type: 'stats',
        stats: [
          { label: '365-day window', value: 'Audited' },
          { label: 'Impressions', value: '294,996' },
          { label: 'Clicks', value: '1,152' },
          { label: 'Avg position', value: '6.95' },
          { label: 'Site-wide CTR', value: '0.39%' },
          { label: 'Top pages reviewed', value: '50' },
        ],
      },
      {
        type: 'lineChart',
        title: 'CTR by SERP position: this site vs industry baseline',
        unit: '%',
        series: [
          {
            name: 'coffey.codes (measured)',
            data: [
              { label: 'Pos 4-5', value: 1.25 },
              { label: 'Pos 6', value: 0.41 },
              { label: 'Pos 7', value: 0.6 },
              { label: 'Pos 8', value: 3.28 },
              { label: 'Pos 9-10', value: 0.78 },
            ],
          },
          {
            name: 'Industry baseline',
            data: [
              { label: 'Pos 4-5', value: 6 },
              { label: 'Pos 6', value: 2.5 },
              { label: 'Pos 7', value: 2 },
              { label: 'Pos 8', value: 1.5 },
              { label: 'Pos 9-10', value: 1 },
            ],
          },
        ],
      },
      {
        type: 'text',
        heading: 'What position alone does not tell you',
        content:
          "The audit surfaced a counterintuitive finding: ranking #1 on coffey.codes earned essentially zero clicks. Some queries reach the top of the SERP but the searcher's intent is a competitor. People searching 'android emulator' want software downloads, not a Flutter article.\n\nMeanwhile, the vibe-coding article cluster at position 8 outperformed positions 4-7 on this site at 3-7% CTR, far above the industry baseline. Query intent matters more than position. That finding informed the next phase: not just chasing rank improvements, but pruning effort on pages whose ranking was demonstrably misaligned with what searchers wanted.",
      },
      {
        type: 'text',
        heading: 'Phase 2: On-page and structured-data work',
        content:
          "The audit identified concrete issues: missing dateModified, weak Open Graph cards, no pagination noindex, ambiguous entity signals to Google's Knowledge Graph. Two specs worked through them. The result: every page now ships a coherent JSON-LD graph linking the site, the author, and the publisher across stable @id URIs. Articles emit BlogPosting plus a BreadcrumbList; the homepage layout emits Person plus Organization with sameAs links to every owned profile. Pagination pages noindex but keep follow so link equity flows through.",
      },
      {
        type: 'stats',
        stats: [
          { label: 'Schema entities (site-wide)', value: '2' },
          { label: 'Schema entities (per article)', value: '3+' },
          { label: 'Owned-profile sameAs links', value: '4' },
          { label: 'Pagination handling', value: 'noindex,follow' },
        ],
      },
      {
        type: 'text',
        heading: 'Phase 3: Custom SEO tooling',
        content:
          "After the on-page work landed, the audit workflow was still manual: a Claude Code session pulling data through the MCP each quarter. The next spec turned that into a script. scripts/seo-snapshot.mjs uses the same service-account credentials but bypasses the MCP entirely, pulling Google Search Console, Google Analytics 4, Bing Webmaster Tools, and Google Ads Keyword Planner directly into a single dated JSON snapshot.\n\nSnapshots are committed to git because Google's data window is only 16 months, and what isn't snapshotted is lost forever. A companion scripts/seo-snapshot-diff.mjs prints the delta between any two snapshots with ANSI colors and box-drawing characters in the terminal, falling back to plain ASCII for CI and pipes.",
      },
      {
        type: 'chart',
        title: 'Pipeline scope: before vs after',
        unit: '',
        data: [
          { label: 'Engines integrated (before)', value: 1 },
          { label: 'Engines integrated (after)', value: 4 },
          { label: 'Auto-generated reports (before)', value: 0 },
          { label: 'Auto-generated reports (after)', value: 6 },
        ],
      },
      {
        type: 'text',
        heading: 'Phase 4: AI agent workflows for editorial decisions',
        content:
          "The snapshot is the data substrate; the leverage came from four follow-up scripts that turn it into editorial answers. scripts/keyword-audit-articles.mjs flags every article where Google Ads suggests a higher-volume keyword the article could target with light editing. scripts/keyword-discover-topics.mjs produces a ranked editorial backlog seeded from the site's article categories and top GSC queries, filtering out anything already covered by existing slugs. scripts/keyword-validate-lps.mjs verdicts each landing page as WELL_TARGETED, UNDER_INVESTED, or OVER_AMBITIOUS. scripts/keyword-probe-url.mjs is a one-shot competitor URL probe.\n\nEach report writes dated markdown into docs/strategy/data/. Future Claude Code agents can invoke any of these scripts, ingest the output, and incorporate it into the next quarterly audit doc without human intervention beyond final review. The agent brief in docs/documentation/agents/ documents the full surface so a fresh agent session can pick up the work without re-discovery.",
      },
      {
        type: 'text',
        heading: 'Where this leaves things',
        content:
          "The site now has a 365-day baseline snapshot in git, a verifiable structured-data graph across every page, and a tool chain that can produce the same data in the same shape every quarter. The Q3 audit ran end-to-end through the new pipeline; the Q4 audit (target August 2026) will be the first full four-engine run with Google Ads keyword volume context enriching the GSC top-queries table.\n\nDrift detection is now a diff command. Editorial decisions can cite specific numbers from the latest snapshot instead of intuition. And because every spec was scoped tightly and the scripts share a single auth module, the whole pipeline can be extended (a fifth engine, a new report shape, a different cadence) without touching the existing surface.",
      },
    ],
  },
];
