/**
 * Snapshot JSON contract.
 *
 * Captures the shape that `scripts/seo-snapshot.mjs` produces today. Made
 * explicit here so engine implementations and the markdown renderer agree
 * on the wire format. Byte-level structural parity is a SPEC-023 must-have.
 */

/** Volume bucket labels returned by Google Ads keyword planner. */
export type VolumeBucket = '<100' | '100-1K' | '1K-10K' | '10K-100K' | '100K+';

/** Competition label returned by Google Ads keyword planner. */
export type Competition = 'LOW' | 'MEDIUM' | 'HIGH';

// ---------------------------------------------------------------------------
// GSC
// ---------------------------------------------------------------------------

export interface GscTopQuery {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  /** Filled by the `keywords` engine in the post-pull enrichment pass. */
  volumeBucket?: VolumeBucket;
  competition?: Competition;
  competitionIndex?: number;
  cpcRangeMicros?: { low: number; high: number };
  _keywordsMatch?: boolean;
}

export interface GscTopPage {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscEngineData {
  topQueries: GscTopQuery[];
  topPages: GscTopPage[];
  totals: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };
}

// ---------------------------------------------------------------------------
// GA4
// ---------------------------------------------------------------------------

export interface Ga4TrafficSource {
  source: string;
  medium: string;
  sessions: number;
  engagedSessions: number;
  conversions: number;
}

export interface Ga4EngineData {
  totals: {
    sessions: number;
    users: number;
    engagedSessions: number;
    averageSessionDuration: number;
    screenPageViews: number;
  };
  trafficSources: Ga4TrafficSource[];
  /** Same shape as `trafficSources`, but with bot-region rows excluded. */
  trafficSourcesExBotRegions: Ga4TrafficSource[];
  topCountries: { country: string; sessions: number }[];
  topPages: { page: string; sessions: number; views: number }[];
}

// ---------------------------------------------------------------------------
// Bing Webmaster Tools
// ---------------------------------------------------------------------------

export interface BingEngineData {
  topQueries: { query: string; clicks: number; impressions: number; position: number }[];
  topPages: { page: string; clicks: number; impressions: number }[];
  totals: { clicks: number; impressions: number };
}

// ---------------------------------------------------------------------------
// Keywords (Google Ads Keyword Planner enrichment)
// ---------------------------------------------------------------------------

export interface KeywordHistoricalMetric {
  keyword: string;
  volumeBucket: VolumeBucket | null;
  competition: Competition | null;
  competitionIndex: number | null;
  cpcRangeMicros: { low: number; high: number } | null;
}

export interface KeywordIdea {
  keyword: string;
  volumeBucket: VolumeBucket | null;
  competition: Competition | null;
  competitionIndex: number | null;
  cpcRangeMicros: { low: number; high: number } | null;
}

export interface KeywordsEngineData {
  historicalMetrics: KeywordHistoricalMetric[];
  ideas: KeywordIdea[];
}

// ---------------------------------------------------------------------------
// Ahrefs (SPEC-022, stub for now)
// ---------------------------------------------------------------------------

export interface AhrefsEngineData {
  target: string;
  fetchedAt: string;
  domainRating: { current: number; history: { date: string; value: number }[] };
  refdomains: { total: number; newInWindow: number; lostInWindow: number };
  organicKeywords: {
    keyword: string;
    position: number;
    traffic: number;
    url: string;
  }[];
  topPages: { url: string; organicTraffic: number; topKeyword: string }[];
  backlinksStats: { total: number; doFollow: number; fromUniqueDomains: number };
  topBacklinks: {
    sourceUrl: string;
    targetUrl: string;
    sourceUrlRating: number;
    anchor: string;
  }[];
  _meta: { creditsUsed: number; window: number };
}

// ---------------------------------------------------------------------------
// Snapshot envelope
// ---------------------------------------------------------------------------

export interface SnapshotEnvelope {
  siteUrl: string;
  pulledAt: string;
  window: { startDate: string; endDate: string; days: number };
  gsc?: GscEngineData;
  ga4?: Ga4EngineData;
  bing?: BingEngineData;
  keywords?: KeywordsEngineData;
  ahrefs?: AhrefsEngineData;
}

export type EngineName = 'gsc' | 'ga4' | 'bing' | 'keywords' | 'ahrefs';

export const KNOWN_ENGINES: EngineName[] = ['gsc', 'ga4', 'bing', 'keywords', 'ahrefs'];
