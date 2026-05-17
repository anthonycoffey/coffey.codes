/**
 * `periscope snapshot` command.
 *
 * Orchestrates GSC, GA4, Bing, and Keywords (Google Ads) engine pulls,
 * composes them into a single SnapshotEnvelope, and writes JSON + Markdown
 * to outputDir/snapshot-<date>.{json,md}.
 *
 * Configuration is loaded from periscope.config.{ts,mjs,js,json} via
 * src/lib/config.ts, with env vars as a fallback for siteUrl,
 * ga4PropertyId, and outputDir.
 */

import { existsSync } from 'node:fs';
import path from 'node:path';

import {
  generateHistoricalMetrics,
  generateKeywordIdeas,
  GoogleAdsError,
  type HistoricalMetricResult,
  type KeywordIdeaResult,
} from '../engines/ads.js';
import { pullBing } from '../engines/bing.js';
import { pullGa4 } from '../engines/ga4.js';
import { pullGsc } from '../engines/gsc.js';
import { getAdsAuth, loadGoogleCredentials } from '../lib/auth.js';
import { loadConfig } from '../lib/config.js';
import { renderSnapshotMarkdown } from '../lib/markdown.js';
import {
  writeSnapshotJson,
  writeSnapshotMarkdown,
} from '../lib/snapshot-store.js';
import type {
  EngineName,
  GscEngineData,
  GscTopQueryRow,
  KeywordMetricRow,
  KeywordsEngineData,
  SnapshotEnvelope,
} from '../types/snapshot.js';

export interface SnapshotCommandOptions {
  engines?: string;
  window?: string;
  asof?: string;
  dryRun?: boolean;
  configPath?: string;
  repoRoot?: string;
}

const SUPPORTED_ENGINES = new Set<EngineName>(['gsc', 'ga4', 'bing', 'keywords']);
const GSC_LAG_DAYS = 3;

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function parseAsof(value: string | undefined): Date | null {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`--asof must be in YYYY-MM-DD form, got: ${value}`);
  }
  const d = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`--asof is not a valid date: ${value}`);
  }
  return d;
}

function parseEngines(value: string | undefined): EngineName[] | null {
  if (!value) return null;
  const requested = value
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean) as EngineName[];
  for (const e of requested) {
    if (!SUPPORTED_ENGINES.has(e)) {
      throw new Error(
        `Unknown engine: ${e}. Supported: ${[...SUPPORTED_ENGINES].join(', ')}`,
      );
    }
  }
  return requested;
}

function shouldRun(engine: EngineName, selected: EngineName[] | null): boolean {
  return selected === null || selected.includes(engine);
}

function loadDotenv(repoRoot: string): void {
  if (typeof process.loadEnvFile !== 'function') return;
  for (const name of ['.env', '.env.local']) {
    const f = path.join(repoRoot, name);
    if (existsSync(f)) {
      try {
        process.loadEnvFile(f);
      } catch {
        // Tolerate malformed env files.
      }
    }
  }
}

// ── Keywords engine: ideas + historical, plus GSC enrichment ───────────

interface PullKeywordsArgs {
  gscTopQueries: GscTopQueryRow[];
  categories: string[];
  language: string;
  geo: string;
  repoRoot: string;
}

async function pullKeywords({
  gscTopQueries,
  categories,
  language,
  geo,
  repoRoot,
}: PullKeywordsArgs): Promise<KeywordsEngineData> {
  const querySeeds = (gscTopQueries ?? [])
    .map((r) => r.keys?.[0])
    .filter((q): q is string => typeof q === 'string' && q.trim().length > 0)
    .slice(0, 25);

  const seeds = [...new Set([...querySeeds, ...categories])];

  const [ideas, historicalMetrics] = await Promise.all([
    generateKeywordIdeas({
      keywords: seeds.slice(0, 20),
      pageSize: 100,
      language,
      geo,
      repoRoot,
    }),
    querySeeds.length > 0
      ? generateHistoricalMetrics(querySeeds, repoRoot)
      : Promise.resolve<HistoricalMetricResult[]>([]),
  ]);

  return {
    geo: 'US',
    language: 'en',
    seedCount: seeds.length,
    historicalMetrics: historicalMetrics as KeywordMetricRow[],
    ideas: ideas as unknown as KeywordsEngineData['ideas'],
  };
}

/**
 * Left-join: decorate each GSC topQueries row with the matching Ads
 * historical metrics, in place. Non-matching rows gain
 * `_keywordsMatch: false` so consumers can see what was joined.
 */
function enrichGscWithKeywords(
  gsc: GscEngineData | undefined,
  keywords: KeywordsEngineData | undefined,
): void {
  if (!gsc?.topQueries || !keywords?.historicalMetrics) return;
  const lookup = new Map<string, KeywordIdeaResult | HistoricalMetricResult>();
  for (const row of keywords.historicalMetrics) {
    if (row.keyword) {
      lookup.set(row.keyword.toLowerCase(), row as unknown as HistoricalMetricResult);
    }
  }
  for (const row of gsc.topQueries) {
    const q = row.keys?.[0]?.toLowerCase();
    const match = q ? lookup.get(q) : null;
    if (match) {
      row.volumeBucket = match.volumeBucket ?? undefined;
      row.volumeAvgMonthly = match.volumeAvgMonthly;
      row.competition = match.competition;
      row.competitionIndex = match.competitionIndex;
      row.cpcRangeMicros = [match.cpcLowMicros, match.cpcHighMicros];
    } else {
      row._keywordsMatch = false;
    }
  }
}

// ── Orchestrator ───────────────────────────────────────────────────────

export async function runSnapshot(
  options: SnapshotCommandOptions,
): Promise<void> {
  const repoRoot = options.repoRoot ?? process.cwd();
  loadDotenv(repoRoot);

  const { config } = await loadConfig({
    repoRoot,
    configPath: options.configPath,
    envFallback: true,
  });

  const selected = parseEngines(options.engines);
  const windowDays = Number(
    options.window ?? process.env.SNAPSHOT_WINDOW ?? 365,
  );
  if (!Number.isFinite(windowDays) || windowDays < 1) {
    throw new Error(`--window must be a positive integer, got: ${options.window}`);
  }

  const asof = parseAsof(options.asof);
  const now = asof ?? new Date();

  const endDate = ymd(new Date(now.getTime() - GSC_LAG_DAYS * 24 * 60 * 60 * 1000));
  const startDate = ymd(
    new Date(now.getTime() - (windowDays + GSC_LAG_DAYS) * 24 * 60 * 60 * 1000),
  );

  const siteUrl = config.siteUrl;
  const outputDir = path.resolve(repoRoot, config.outputDir);
  const ga4PropertyId = config.ga4PropertyId ?? process.env.GA4_PROPERTY_ID;
  const bingApiKey = process.env.BING_WEBMASTER_API_KEY;

  // Bing requires the full URL form, not sc-domain:
  const bingSiteUrl = siteUrl.startsWith('sc-domain:')
    ? `https://${siteUrl.slice('sc-domain:'.length)}/`
    : siteUrl;

  const googleCreds = loadGoogleCredentials(repoRoot);

  // ── Plan ──────────────────────────────────────────────────────────────
  type EnginePlan = { name: EngineName; run: () => Promise<unknown> };
  const planned: EnginePlan[] = [];

  if (shouldRun('gsc', selected)) {
    if (googleCreds) {
      planned.push({
        name: 'gsc',
        run: () =>
          pullGsc({
            siteUrl,
            startDate,
            endDate,
            windowDays,
            credentials: googleCreds,
          }),
      });
    } else {
      process.stderr.write(
        '[snapshot] gsc: skipped (no Google service account credentials configured)\n',
      );
    }
  }

  if (shouldRun('ga4', selected)) {
    if (googleCreds && ga4PropertyId) {
      planned.push({
        name: 'ga4',
        run: () =>
          pullGa4({
            propertyId: ga4PropertyId,
            startDate,
            endDate,
            windowDays,
            credentials: googleCreds,
            botRegions: config.ga4.botRegions,
          }),
      });
    } else if (!googleCreds) {
      process.stderr.write(
        '[snapshot] ga4: skipped (no Google service account credentials configured)\n',
      );
    } else {
      process.stderr.write(
        '[snapshot] ga4: skipped (ga4PropertyId not set in config or GA4_PROPERTY_ID env)\n',
      );
    }
  }

  if (shouldRun('bing', selected)) {
    if (bingApiKey) {
      planned.push({
        name: 'bing',
        run: () =>
          pullBing({
            siteUrl: bingSiteUrl,
            apiKey: bingApiKey,
            startDate,
            endDate,
            windowDays,
          }),
      });
    } else {
      process.stderr.write(
        '[snapshot] bing: skipped (BING_WEBMASTER_API_KEY not set)\n',
      );
    }
  }

  // keywords runs LAST and AFTER gsc, so it can read the resolved
  // GSC topQueries as its seed input.
  let keywordsPlanned = false;
  if (shouldRun('keywords', selected)) {
    const adsAuth = await getAdsAuth(repoRoot).catch(() => null);
    if (adsAuth) {
      keywordsPlanned = true;
    } else {
      process.stderr.write(
        '[snapshot] keywords: skipped (Google Ads env vars not configured)\n',
      );
    }
  }

  if (planned.length === 0 && !keywordsPlanned) {
    throw new Error(
      'No engines configured. Set at least one of GSC_SERVICE_ACCOUNT_*, ga4PropertyId, BING_WEBMASTER_API_KEY, or GOOGLE_ADS_*.',
    );
  }

  if (options.dryRun) {
    const dryList = planned.map((p) => p.name);
    if (keywordsPlanned) dryList.push('keywords');
    process.stdout.write(
      `[dry-run] Would pull from ${dryList.join(', ')} for window ${startDate} to ${endDate}\n`,
    );
    return;
  }

  // ── Pull (non-keywords engines run in parallel) ───────────────────────
  const results = await Promise.allSettled(
    planned.map(async (p) => ({ name: p.name, data: await p.run() })),
  );

  const snapshot: SnapshotEnvelope = {
    window: { startDate, endDate, days: windowDays },
    pulledAt: new Date().toISOString(),
    siteUrl,
  };
  const snapshotIndexed = snapshot as unknown as Record<string, unknown>;

  for (const r of results) {
    if (r.status === 'fulfilled') {
      const { name, data } = r.value;
      snapshotIndexed[name] = data;
    } else {
      const reason = r.reason as Error | undefined;
      process.stderr.write(
        `[snapshot] engine pull failed: ${reason?.message ?? r.reason}\n`,
      );
    }
  }

  // Keywords runs after the others so it can seed from gsc.topQueries.
  // Failure here is non-fatal: the snapshot still writes with the other
  // engines' data. The most common failure is CUSTOMER_NOT_ENABLED
  // (Google Ads account without billing).
  if (keywordsPlanned) {
    try {
      const gscTopQueries = snapshot.gsc?.topQueries ?? [];
      const keywordsData = await pullKeywords({
        gscTopQueries,
        categories: config.categories,
        language: config.ads.languageCode,
        geo: config.ads.geoTargets[0] ?? 'geoTargetConstants/2840',
        repoRoot,
      });
      snapshot.keywords = keywordsData;
      enrichGscWithKeywords(snapshot.gsc, keywordsData);
    } catch (err) {
      const code = err instanceof GoogleAdsError ? err.code : null;
      const message = err instanceof Error ? err.message : String(err);
      const reason =
        code === 'CUSTOMER_NOT_ENABLED'
          ? 'Google Ads CUSTOMER_NOT_ENABLED (billing not enabled on the Ads account; see docs/documentation/guides/seo-snapshot-setup.md)'
          : message;
      process.stderr.write(`[snapshot] keywords: skipped (${reason})\n`);
    }
  }

  // Backwards-compat: surface GSC top-level fields at envelope level so
  // SPEC-016-era consumers (and the diff command, until it's ported) keep
  // working.
  if (snapshot.gsc) {
    snapshot.totals = snapshot.gsc.totals;
    snapshot.topPages = snapshot.gsc.topPages;
    snapshot.topQueries = snapshot.gsc.topQueries;
    snapshot.countries = snapshot.gsc.countries;
    snapshot.devices = snapshot.gsc.devices;
  }

  // Empty-result guard.
  const enginesWithData = (['gsc', 'ga4', 'bing', 'keywords'] as EngineName[]).filter(
    (k) => snapshotIndexed[k],
  );
  if (enginesWithData.length === 0) {
    process.stderr.write(
      '[snapshot] no engines returned data; not overwriting any existing snapshot file\n',
    );
    process.exit(1);
  }

  // ── Write ─────────────────────────────────────────────────────────────
  const jsonPath = await writeSnapshotJson(outputDir, snapshot, now);
  const markdown = renderSnapshotMarkdown(snapshot);
  const mdPath = await writeSnapshotMarkdown(outputDir, markdown, now);

  process.stdout.write(
    `Wrote ${jsonPath}  (engines: ${enginesWithData.join(', ')})\n`,
  );
  process.stdout.write(`Wrote ${mdPath}\n`);

  if (snapshot.gsc) {
    const { clicks, impressions, ctr } = snapshot.gsc.totals;
    process.stdout.write(
      `GSC window: ${startDate} to ${endDate}  Clicks: ${clicks}  Impressions: ${impressions}  CTR: ${(ctr * 100).toFixed(2)}%\n`,
    );
  }
  if (snapshot.ga4) {
    const totalSessions = (snapshot.ga4.trafficSources.rows ?? []).reduce(
      (sum, row) => sum + Number(row.metricValues?.[0]?.value ?? 0),
      0,
    );
    process.stdout.write(`GA4 sessions: ${totalSessions}\n`);
  }
  if (snapshot.bing) {
    const note = snapshot.bing._note ? `  (${snapshot.bing._note})` : '';
    process.stdout.write(
      `Bing clicks: ${snapshot.bing.totals.clicks}  Impressions: ${snapshot.bing.totals.impressions}${note}\n`,
    );
  }
  if (snapshot.keywords) {
    const matchedCount = (snapshot.gsc?.topQueries ?? []).filter(
      (r) => r._keywordsMatch !== false,
    ).length;
    process.stdout.write(
      `Keywords: ${snapshot.keywords.historicalMetrics.length} historical metrics, ${snapshot.keywords.ideas.length} ideas; ${matchedCount} GSC queries enriched\n`,
    );
  }
}
