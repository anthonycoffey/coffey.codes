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
        title: 'What the pipeline produces today (built from zero)',
        unit: '',
        data: [
          { label: 'Engines', value: 4 },
          { label: 'Scripts', value: 8 },
          { label: 'Reports', value: 6 },
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
