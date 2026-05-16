/**
 * Snapshot JSON contract.
 *
 * These types describe the exact wire format that lives on disk in
 * `outputDir/snapshot-<YYYY-MM-DD>.json`. SPEC-023 requires byte-level
 * structural parity with the snapshots `scripts/seo-snapshot.mjs`
 * produced before the port, so the shapes here mirror raw API
 * responses rather than imposing a normalized layer on top.
 *
 * A normalized read API can sit on top of these in `src/lib/` later,
 * but the JSON file itself stays raw.
 */

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

export interface SnapshotWindow {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  days: number;
}

/** Google Ads bucket label produced by lib/bucket.ts:bucketLabel. */
export type VolumeBucket = '<100' | '100-1K' | '1K-10K' | '10K-100K' | '100K+';

/** Google Ads competition tier. */
export type Competition = 'LOW' | 'MEDIUM' | 'HIGH' | 'UNSPECIFIED';

// ---------------------------------------------------------------------------
// GSC (Google Search Console)
//
// The Search Console API returns rows like { keys, clicks, impressions, ctr,
// position }. `topQueries` rows are joined in-place with Google Ads keyword
// metrics by the orchestrator, so they carry optional enrichment fields.
// ---------------------------------------------------------------------------

export interface GscRow {
  keys?: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscTopQueryRow extends GscRow {
  /** Set when Ads keyword metrics found a match for the query. */
  volumeBucket?: VolumeBucket;
  volumeAvgMonthly?: number | null;
  competition?: Competition | null;
  competitionIndex?: number | null;
  /** [low, high] micros from Google Ads, or null when unavailable. */
  cpcRangeMicros?: [number | null, number | null];
  /** Set ONLY when the lookup did NOT find a match. */
  _keywordsMatch?: false;
}

export interface GscEngineData {
  window: SnapshotWindow;
  totals: {
    clicks: number;
    impressions: number;
    ctr: number;
  };
  topPages: GscRow[];
  topQueries: GscTopQueryRow[];
  countries: GscRow[];
  devices: GscRow[];
}

// ---------------------------------------------------------------------------
// GA4 (Google Analytics Data API)
//
// The Data API returns sections with parallel arrays: dimensionHeaders,
// metricHeaders, and rows where each row has dimensionValues + metricValues
// in the same order as the headers. We store the raw shape; the markdown
// renderer and any audit consumers zip the arrays.
// ---------------------------------------------------------------------------

export interface Ga4HeaderName {
  name: string;
  type?: string;
}

export interface Ga4DimensionValue {
  value?: string;
}

export interface Ga4MetricValue {
  value?: string;
}

export interface Ga4Row {
  dimensionValues?: Ga4DimensionValue[];
  metricValues?: Ga4MetricValue[];
}

export interface Ga4Section {
  dimensionHeaders: Ga4HeaderName[];
  metricHeaders: Ga4HeaderName[];
  rows: Ga4Row[];
}

export interface Ga4EngineData {
  window: SnapshotWindow;
  propertyId: string;
  botRegionsExcluded: string[];
  trafficSources: Ga4Section;
  organicLandingPages: Ga4Section;
  userBehavior: {
    devices: Ga4Section;
    countries: Ga4Section;
    engagement: Ga4Section;
  };
  trafficSourcesExBotRegions: Ga4Section;
  userBehaviorExBotRegions: {
    countries: Ga4Section;
  };
}

// ---------------------------------------------------------------------------
// Bing Webmaster Tools
//
// The Bing API returns daily rank/traffic stats and query stats as the `.d`
// array. We store those raw. Dates come as the literal `/Date(...)/` string
// format -- consumers parse them on demand.
// ---------------------------------------------------------------------------

export interface BingTrafficRow {
  Date?: string;
  Clicks?: number;
  Impressions?: number;
  AvgClickPosition?: number;
  AvgImpressionPosition?: number;
  [key: string]: unknown;
}

export interface BingQueryRow {
  Query?: string;
  Clicks?: number;
  Impressions?: number;
  AvgClickPosition?: number;
  AvgImpressionPosition?: number;
  [key: string]: unknown;
}

export interface BingEngineData {
  window: SnapshotWindow;
  siteUrl: string;
  totals: {
    clicks: number;
    impressions: number;
    ctr: number;
  };
  trafficStats: BingTrafficRow[];
  topQueries: BingQueryRow[];
  /** Set to "empty response" when Bing returned no data (new property warm-up). */
  _note?: string;
}

// ---------------------------------------------------------------------------
// Keywords (Google Ads Keyword Planner)
//
// Normalized rows produced by lib/google-ads helpers. These ARE shaped by us
// since the raw Ads REST surface is awkward; the normalization is stable and
// already part of the parity contract.
// ---------------------------------------------------------------------------

export interface KeywordMetricRow {
  keyword: string;
  volumeAvgMonthly: number | null;
  volumeBucket: VolumeBucket | null;
  competition: Competition | null;
  competitionIndex: number | null;
  cpcLowMicros: number | null;
  cpcHighMicros: number | null;
  monthlySearchVolumes: unknown[];
}

export interface KeywordIdeaRow extends KeywordMetricRow {
  closeVariants?: string[];
}

export interface KeywordsEngineData {
  geo: 'US' | string;
  language: 'en' | string;
  seedCount: number;
  historicalMetrics: KeywordMetricRow[];
  ideas: KeywordIdeaRow[];
}

// ---------------------------------------------------------------------------
// Ahrefs (SPEC-022 stub, kept for the future engine slot)
// ---------------------------------------------------------------------------

export interface AhrefsEngineData {
  target: string;
  fetchedAt: string;
  domainRating?: { current: number; history: { date: string; value: number }[] };
  refdomains?: { total: number; newInWindow: number; lostInWindow: number };
  organicKeywords?: {
    keyword: string;
    position: number;
    traffic: number;
    url: string;
  }[];
  topPages?: { url: string; organicTraffic: number; topKeyword: string }[];
  backlinksStats?: { total: number; doFollow: number; fromUniqueDomains: number };
  topBacklinks?: {
    sourceUrl: string;
    targetUrl: string;
    sourceUrlRating: number;
    anchor: string;
  }[];
  _meta?: { creditsUsed: number; window: number };
}

// ---------------------------------------------------------------------------
// Snapshot envelope
//
// The top-level shape on disk. `gsc` data is duplicated at the envelope
// level (`totals`, `topPages`, etc.) for SPEC-016-era backwards compat;
// new readers should prefer the `gsc.*` nested fields.
// ---------------------------------------------------------------------------

export interface SnapshotEnvelope {
  window: SnapshotWindow;
  pulledAt: string; // ISO 8601
  siteUrl: string;
  gsc?: GscEngineData;
  ga4?: Ga4EngineData;
  bing?: BingEngineData;
  keywords?: KeywordsEngineData;
  ahrefs?: AhrefsEngineData;
  // ── Backwards-compat: duplicates of `gsc.*` at the envelope level.
  // Old SPEC-016 consumers read these directly. Engines do NOT populate
  // these -- the orchestrator copies them after the GSC pull lands.
  totals?: GscEngineData['totals'];
  topPages?: GscEngineData['topPages'];
  topQueries?: GscEngineData['topQueries'];
  countries?: GscEngineData['countries'];
  devices?: GscEngineData['devices'];
}

export type EngineName = 'gsc' | 'ga4' | 'bing' | 'keywords' | 'ahrefs';

export const KNOWN_ENGINES: EngineName[] = ['gsc', 'ga4', 'bing', 'keywords', 'ahrefs'];
