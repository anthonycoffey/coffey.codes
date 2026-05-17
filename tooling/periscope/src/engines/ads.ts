/**
 * Google Ads Keyword Planner engine.
 *
 * Direct REST against https://googleads.googleapis.com/<API_VERSION>/.
 * Avoids the google-ads-api gRPC client because that doesn't ship
 * service-account JWT auth out of the box; the REST surface is stable
 * enough to talk to directly.
 *
 * Exports:
 *   - generateKeywordIdeas       — keyword + url seeded suggestions
 *   - generateHistoricalMetrics  — precise volume/competition for given keywords
 *   - generateIdeasFromUrl       — sugar around generateKeywordIdeas for url-only
 *   - GoogleAdsError             — typed error class for callers
 *
 * The auth + bucket + snapshot-store helpers live in src/lib/.
 */

import { adsHeaders, getAdsAuth } from '../lib/auth.js';
import { bucketLabel } from '../lib/bucket.js';
import type { Competition, VolumeBucket } from '../types/snapshot.js';

const API_VERSION = 'v21';
const API_BASE = `https://googleads.googleapis.com/${API_VERSION}`;

/** Google Ads constant resource names. https://developers.google.com/google-ads/api/data/codes-formats */
export const LANGUAGE_EN = 'languageConstants/1000';
export const GEO_US = 'geoTargetConstants/2840';

// ── Error type ──────────────────────────────────────────────────────────

export interface GoogleAdsErrorPayload {
  endpoint: string;
  status: number;
  statusText: string;
  code: string | null;
  message?: string | null;
}

export class GoogleAdsError extends Error {
  readonly endpoint: string;
  readonly status: number;
  readonly statusText: string;
  readonly code: string | null;

  constructor(payload: GoogleAdsErrorPayload) {
    const codeFragment = payload.code ? ` (${payload.code})` : '';
    const detail = payload.message ? `: ${payload.message}` : '';
    super(
      `Google Ads ${payload.endpoint} failed: HTTP ${payload.status}${codeFragment}${detail}`,
    );
    this.name = 'GoogleAdsError';
    this.endpoint = payload.endpoint;
    this.status = payload.status;
    this.statusText = payload.statusText;
    this.code = payload.code;
  }
}

/**
 * Pull the first concrete error code out of a Google Ads error body so
 * callers can log a one-liner instead of dumping the entire JSON blob.
 * Falls back to whatever's in body.error.message, then to null.
 */
function parseAdsError(text: string): { code: string | null; message: string | null } {
  try {
    const body = JSON.parse(text) as {
      error?: {
        message?: string;
        details?: Array<{
          errors?: Array<{
            errorCode?: Record<string, string>;
            message?: string;
          }>;
        }>;
      };
    };
    const failure = body?.error?.details?.[0];
    const inner = failure?.errors?.[0];
    if (inner) {
      const codeContainer = inner.errorCode ?? {};
      // errorCode is an object with exactly one key like
      //   { authorizationError: 'CUSTOMER_NOT_ENABLED' }
      // or { requestError: 'BAD_RESOURCE_ID' }
      const [codeKey] = Object.keys(codeContainer);
      const codeValue = codeKey ? codeContainer[codeKey] : null;
      const code = codeValue ?? codeKey ?? null;
      const message = inner.message ?? body?.error?.message ?? null;
      return { code, message };
    }
    if (body?.error?.message) {
      return { code: null, message: body.error.message };
    }
  } catch {
    // Not JSON; fall through.
  }
  return { code: null, message: null };
}

// ── REST plumbing ──────────────────────────────────────────────────────

async function adsPost<T>(
  endpoint: string,
  body: unknown,
  repoRoot: string,
): Promise<T> {
  const auth = await getAdsAuth(repoRoot);
  if (!auth) {
    throw new Error('Google Ads not configured (see GOOGLE_ADS_* env vars)');
  }
  const url = `${API_BASE}/customers/${auth.customerId}:${endpoint}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: adsHeaders(auth),
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    const { code, message } = parseAdsError(text);
    throw new GoogleAdsError({
      endpoint,
      status: resp.status,
      statusText: resp.statusText,
      code,
      message: message ?? text.slice(0, 200),
    });
  }
  return (await resp.json()) as T;
}

// ── Normalization ──────────────────────────────────────────────────────

interface KeywordMetricsRaw {
  avgMonthlySearches?: string | number;
  competition?: Competition;
  competitionIndex?: string | number;
  lowTopOfPageBidMicros?: string | number;
  highTopOfPageBidMicros?: string | number;
  monthlySearchVolumes?: unknown[];
}

interface NormalizedMetrics {
  volumeAvgMonthly: number | null;
  volumeBucket: VolumeBucket | null;
  competition: Competition | null;
  competitionIndex: number | null;
  cpcLowMicros: number | null;
  cpcHighMicros: number | null;
  monthlySearchVolumes: unknown[];
}

function normalizeMetrics(metrics: KeywordMetricsRaw | undefined): NormalizedMetrics | null {
  if (!metrics) return null;
  const avg = metrics.avgMonthlySearches != null ? Number(metrics.avgMonthlySearches) : null;
  return {
    volumeAvgMonthly: avg,
    volumeBucket: avg != null ? bucketLabel(avg) : null,
    competition: metrics.competition ?? null,
    competitionIndex:
      metrics.competitionIndex != null ? Number(metrics.competitionIndex) : null,
    cpcLowMicros: metrics.lowTopOfPageBidMicros != null
      ? Number(metrics.lowTopOfPageBidMicros)
      : null,
    cpcHighMicros: metrics.highTopOfPageBidMicros != null
      ? Number(metrics.highTopOfPageBidMicros)
      : null,
    monthlySearchVolumes: Array.isArray(metrics.monthlySearchVolumes)
      ? metrics.monthlySearchVolumes
      : [],
  };
}

// ── Public: ideas + historical ─────────────────────────────────────────

export interface KeywordIdeaResult {
  keyword: string;
  volumeAvgMonthly: number | null;
  volumeBucket: VolumeBucket | null;
  competition: Competition | null;
  competitionIndex: number | null;
  cpcLowMicros: number | null;
  cpcHighMicros: number | null;
  monthlySearchVolumes: unknown[];
}

export interface HistoricalMetricResult extends KeywordIdeaResult {
  closeVariants: string[];
}

export interface GenerateKeywordIdeasOptions {
  keywords?: string[];
  url?: string;
  language?: string;
  geo?: string;
  pageSize?: number;
  /** Repo root for credential resolution. Defaults to process.cwd(). */
  repoRoot?: string;
}

export async function generateKeywordIdeas({
  keywords,
  url,
  language = LANGUAGE_EN,
  geo = GEO_US,
  pageSize = 100,
  repoRoot = process.cwd(),
}: GenerateKeywordIdeasOptions = {}): Promise<KeywordIdeaResult[]> {
  if (!keywords && !url) {
    throw new Error('generateKeywordIdeas: pass at least one of { keywords, url }');
  }
  const body: Record<string, unknown> = {
    language,
    geoTargetConstants: [geo],
    includeAdultKeywords: false,
    pageSize,
  };
  if (keywords && url) {
    body.keywordAndUrlSeed = { keywords, url };
  } else if (keywords) {
    body.keywordSeed = { keywords };
  } else {
    body.urlSeed = { url };
  }
  type Resp = { results?: Array<{ text: string; keywordIdeaMetrics?: KeywordMetricsRaw }> };
  const resp = await adsPost<Resp>('generateKeywordIdeas', body, repoRoot);
  const results = resp.results ?? [];
  return results.map((r) => {
    const m = normalizeMetrics(r.keywordIdeaMetrics);
    return {
      keyword: r.text,
      volumeAvgMonthly: m?.volumeAvgMonthly ?? null,
      volumeBucket: m?.volumeBucket ?? null,
      competition: m?.competition ?? null,
      competitionIndex: m?.competitionIndex ?? null,
      cpcLowMicros: m?.cpcLowMicros ?? null,
      cpcHighMicros: m?.cpcHighMicros ?? null,
      monthlySearchVolumes: m?.monthlySearchVolumes ?? [],
    };
  });
}

export async function generateHistoricalMetrics(
  keywords: string[],
  repoRoot: string = process.cwd(),
): Promise<HistoricalMetricResult[]> {
  if (!keywords?.length) return [];
  const body = {
    keywords,
    language: LANGUAGE_EN,
    geoTargetConstants: [GEO_US],
  };
  type Resp = {
    results?: Array<{
      text: string;
      keywordMetrics?: KeywordMetricsRaw;
      closeVariants?: string[];
    }>;
  };
  const resp = await adsPost<Resp>('generateKeywordHistoricalMetrics', body, repoRoot);
  const results = resp.results ?? [];
  return results.map((r) => {
    const m = normalizeMetrics(r.keywordMetrics);
    return {
      keyword: r.text,
      volumeAvgMonthly: m?.volumeAvgMonthly ?? null,
      volumeBucket: m?.volumeBucket ?? null,
      competition: m?.competition ?? null,
      competitionIndex: m?.competitionIndex ?? null,
      cpcLowMicros: m?.cpcLowMicros ?? null,
      cpcHighMicros: m?.cpcHighMicros ?? null,
      monthlySearchVolumes: m?.monthlySearchVolumes ?? [],
      closeVariants: r.closeVariants ?? [],
    };
  });
}

export async function generateIdeasFromUrl(
  url: string,
  opts: Omit<GenerateKeywordIdeasOptions, 'url' | 'keywords'> = {},
): Promise<KeywordIdeaResult[]> {
  return generateKeywordIdeas({ url, ...opts });
}
