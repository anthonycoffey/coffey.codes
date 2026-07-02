import { BoltIcon, ChartBarIcon, CpuChipIcon } from '@heroicons/react/20/solid';
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
          'Dispatch had no way to match technicians to jobs by location. Assignment was manual or done by city name. Every technician record already carried latitude and longitude, but no part of the application queried against them. There was no spatial column, no index, and no proximity search.',
      },
      {
        type: 'text',
        heading: 'The Solution',
        content:
          'Installed PostGIS on the existing PostgreSQL database and added a `location` column typed as `GEOGRAPHY(POINT, 4326)` to the `Users`, `FormSubmissions`, and `Addresses` tables. Put a `GIST` index on the technician column to keep spatial filtering fast. Wrote a Sequelize `beforeSave` hook that converts the legacy `latitude` and `longitude` fields into a `GEOGRAPHY` point on every save, so existing API endpoints kept working without modification. The dispatcher endpoint now geocodes an inbound address, applies `ST_DWithin` against a 50-mile radius, computes `ST_Distance` as a selected column, and orders results nearest-first. One indexed query, no application-side coordination.',
      },
      {
        type: 'stats',
        stats: [
          { label: 'Data Type', value: 'GEOGRAPHY' },
          { label: 'Spatial Index', value: 'GIST' },
          { label: 'Radius Filter', value: 'ST_DWithin' },
          { label: 'Ranking', value: 'ST_Distance' },
        ],
      },
      {
        type: 'chart',
        title: 'Capability before PostGIS (self-audit, 0–5)',
        data: [
          { label: 'Spatial column', value: 0 },
          { label: 'Radius search', value: 0 },
          { label: 'Distance ranking', value: 0 },
          { label: 'GIST index', value: 0 },
          { label: 'Geocoded addresses', value: 1 },
        ],
      },
      {
        type: 'chart',
        title: 'Capability after PostGIS (self-audit, 0–5)',
        data: [
          { label: 'Spatial column', value: 5 },
          { label: 'Radius search', value: 5 },
          { label: 'Distance ranking', value: 5 },
          { label: 'GIST index', value: 5 },
          { label: 'Geocoded addresses', value: 5 },
        ],
      },
      {
        type: 'text',
        heading: 'The Impact',
        content:
          'Two location-aware surfaces shipped on the same spatial layer. Dispatchers got a NearbyTechnicians dashboard that returns ranked, online technicians within a 50-mile radius of a geocoded job site, with distance computed at the database. Technicians got a NearbyJobs view of work in their area. The legacy latitude and longitude columns stayed in place behind the Sequelize hook, which meant upstream callers, mobile clients, and admin tooling kept working without a coordinated release.',
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
          "The audit identified concrete issues: missing `dateModified`, weak Open Graph cards, no pagination noindex, ambiguous entity signals to Google's Knowledge Graph. Two specs worked through them. The result: every page now ships a coherent JSON-LD graph linking the site, the author, and the publisher across stable `@id` URIs. Articles emit `BlogPosting` plus a `BreadcrumbList`; the homepage layout emits `Person` plus `Organization` with `sameAs` links to every owned profile. Pagination pages emit `noindex,follow` so link equity flows through without polluting the index.",
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
          "After the on-page work landed, the audit workflow was still manual: a Claude Code session pulling data through the MCP each quarter. The next spec turned that into a script. `scripts/seo-snapshot.mjs` uses the same service-account credentials but bypasses the MCP entirely, pulling Google Search Console, Google Analytics 4, Bing Webmaster Tools, and Google Ads Keyword Planner directly into a single dated JSON snapshot.\n\nSnapshots are committed to git because Google's data window is only 16 months, and what isn't snapshotted is lost forever. A companion `scripts/seo-snapshot-diff.mjs` prints the delta between any two snapshots with ANSI colors and box-drawing characters in the terminal, falling back to plain ASCII for CI and pipes.",
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
          "The snapshot is the data substrate; the leverage came from four follow-up scripts that turn it into editorial answers. `scripts/keyword-audit-articles.mjs` flags every article where Google Ads suggests a higher-volume keyword the article could target with light editing. `scripts/keyword-discover-topics.mjs` produces a ranked editorial backlog seeded from the site's article categories and top GSC queries, filtering out anything already covered by existing slugs. `scripts/keyword-validate-lps.mjs` verdicts each landing page as `WELL_TARGETED`, `UNDER_INVESTED`, or `OVER_AMBITIOUS`. `scripts/keyword-probe-url.mjs` is a one-shot competitor URL probe.\n\nEach report writes dated markdown into `docs/strategy/data/`. Future Claude Code agents can invoke any of these scripts, ingest the output, and incorporate it into the next quarterly audit doc without human intervention beyond final review. The agent brief in `docs/documentation/agents/` documents the full surface so a fresh agent session can pick up the work without re-discovery.",
      },
      {
        type: 'text',
        heading: 'Where this leaves things',
        content:
          "The site now has a 365-day baseline snapshot in git, a verifiable structured-data graph across every page, and a tool chain that can produce the same data in the same shape every quarter. The Q3 audit ran end-to-end through the new pipeline; the Q4 audit (target August 2026) will be the first full four-engine run with Google Ads keyword volume context enriching the `gsc.topQueries` table inside each snapshot.\n\nDrift detection is now a `seo-snapshot-diff.mjs` call. Editorial decisions can cite specific numbers from the latest snapshot instead of intuition. And because every spec was scoped tightly and the scripts share a single auth module at `scripts/lib/google-ads.mjs`, the whole pipeline can be extended (a fifth engine, a new report shape, a different cadence) without touching the existing surface.",
      },
    ],
  },
  {
    slug: 'wordpress-to-serverless-headless-commerce',
    title:
      'From $15/mo WordPress to Zero-Cost Serverless: A Pixel-Perfect Rebuild with Custom Commerce',
    description:
      'Rebuilt Wake the Nile’s WordPress site as a headless Astro + Sanity + Cloudflare Pages app — a pixel-perfect 1:1 migration that eliminated all recurring platform fees, scored 100s across the board on Google PageSpeed, and shipped a hand-rolled Stripe + Sanity storefront instead of a Shopify subscription. Delivered in 2–3 days with Claude Code (Opus 4.8).',
    icon: BoltIcon,
    tags: [
      'Astro',
      'Sanity',
      'Cloudflare Pages',
      'Stripe',
      'Headless CMS',
      'Serverless',
      'E-commerce',
      'WordPress Migration',
      'Claude Code',
      'MCP',
    ],
    layout: 'styleB',
    story: [
      {
        type: 'text',
        heading: 'The Challenge',
        content:
          "Wake the Nile — a touring music artist on Freeda Records — ran on WordPress hosted on a $15–$20/month virtual machine at Google Cloud. Google PageSpeed graded the live site a C. It worked, but it was slow, and every month it billed regardless of traffic.\n\nThe next ask made the ceiling obvious: the artist wanted to sell merch. The plan on the table was Shopify — another recurring subscription, another checkout to brand around, and a second dashboard to live in alongside the site's own admin. Underneath all of it sat a legacy LAMP-and-plugin stack that was a dead end for modern, AI-assisted iteration: configuration buried in a database and a wp-admin UI, nothing an AI agent could reason about or safely change in a repo.",
      },
      {
        type: 'stats',
        stats: [
          { label: 'Hosting', value: '$15–$20/mo VM' },
          { label: 'PageSpeed grade', value: 'C' },
          { label: 'Platform', value: 'WordPress (LAMP)' },
          { label: 'Commerce', value: 'Shopify (proposed, +fees)' },
          { label: 'AI-agent workflow', value: 'Not viable' },
        ],
      },
      {
        type: 'text',
        heading: 'The Solution',
        content:
          "A pixel-perfect 1:1 rebuild on Astro 5 (static output) + Sanity (headless CMS) + Cloudflare Pages, served from the edge on the free tier — recreating the live site down to the gold-on-black brand. Everything from the old site was ported over, not approximated: the video slider came across as a Swiper coverflow that is faster and smoother than the WordPress original, and the contact page kept its HubSpot form integration.\n\nServer logic — checkout and order webhooks — runs as edge-native Cloudflare Pages Functions calling the Stripe and Sanity HTTP APIs directly, with no Node runtime to provision or scale. The whole rebuild was delivered in 2–3 days using Claude Code (Opus 4.8) on the Max plan, and the entire site lives in a single GitHub repository.",
      },
      {
        type: 'chart',
        title: 'Google PageSpeed after rebuild (0–100, per page)',
        unit: '',
        data: [
          { label: 'Home', value: 100 },
          { label: 'Music', value: 100 },
          { label: 'Videos', value: 99 },
          { label: 'Connect', value: 100 },
          { label: 'Shows', value: 100 },
        ],
      },
      {
        type: 'text',
        heading: 'From a C to straight A’s — even on the heaviest page',
        content:
          "The WordPress site scored a C. The rebuilt site scores 100s and all-green A’s across the board — including `/videos`, the heaviest page on the site, where multiple MP4s power the slider. Static HTML served from Cloudflare's edge, images and video delivered as optimized static assets, and zero server round-trip on page load turned performance from a liability into a feature. The site is now measurably faster than the one it replaced, for a fraction of the cost.",
      },
      {
        type: 'text',
        heading: 'Custom commerce — no Shopify',
        content:
          "Rather than rent Shopify, the storefront was hand-rolled on Stripe + Sanity in about a day. Sanity is the single source of truth for the catalog and inventory; prices are sent to Stripe dynamically at checkout so the CMS stays authoritative. Shoppers get a custom cart (a localStorage island with a slide-out drawer) and an Embedded Stripe Checkout that stays on-brand and on-site, plus a thank-you page that reads a Stripe session token to render real success or error status rather than a blind redirect.\n\nOn payment, a Stripe webhook — also a Cloudflare Pages Function — writes the order into Sanity as an order document and decrements product stock automatically. Stripe carries the parts nobody wants to reinvent: fraud protection, sales tax, and billing/accounting — the whole nine yards — with zero platform subscription on top.",
      },
      {
        type: 'stats',
        stats: [
          { label: 'Payments', value: 'Stripe' },
          { label: 'Fraud / Tax / Billing', value: 'Stripe' },
          { label: 'Catalog + Inventory', value: 'Sanity' },
          { label: 'Orders', value: 'Sanity documents' },
          { label: 'Runtime', value: 'CF Pages Functions (edge)' },
          { label: 'Shopify fees', value: '$0' },
        ],
      },
      {
        type: 'text',
        heading: 'Built to iterate — and AI-agent-ready',
        content:
          "Because the whole site lives in a GitHub repo and every third-party service in the stack (Sanity, Cloudflare, Stripe) ships an MCP server, an AI agent can drive publishing, schema changes, and deploys directly — the same way this rebuild was built. A `siteSettings` collection manages global config like social-button URLs and the nav menu; a toggle marks a product sold out; page templates bind to Sanity custom fields, so new capabilities are a code or content change rather than a migration.\n\nContent and order fulfillment now live under one roof. There is no swapping between a Shopify admin and a separate website dashboard — the artist manages merchandise, fulfills orders, and edits the site from the same place.",
      },
      {
        type: 'stats',
        stats: [
          { label: 'Recurring platform fees', value: '$0' },
          { label: 'Annual cost avoided', value: '~$650/yr' },
          { label: 'PageSpeed', value: 'C → 100 / A' },
          { label: 'Rebuild time', value: '2–3 days' },
          { label: 'Commerce build', value: '~1 day' },
          { label: 'Platforms consolidated', value: '2 → 1' },
        ],
      },
      {
        type: 'quote',
        text: 'One repo, one dashboard, zero recurring platform fees — a faster site than the one it replaced, with a full storefront the client owns outright.',
      },
      {
        type: 'text',
        heading: 'Where this leaves things',
        content:
          "The math is simple: roughly $180–$240/year of WordPress VM hosting and ~$468/year of avoided Shopify Basic fees collapse to $0 on Cloudflare's free tier, which is more than sufficient for this client's traffic. The result is zero recurring platform fees, a site that outperforms its predecessor, and a stack purpose-built for AI-assisted iteration.\n\nThe storefront is fully fleshed out — branded checkout, secure payments, automated inventory and order capture — already built, secured, and deployed. The only work left is the tedious part: entering the product catalog on top of a foundation that is done.",
      },
    ],
  },
];
