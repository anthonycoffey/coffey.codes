#!/usr/bin/env node
/**
 * SEO snapshot script — SPEC-016 + SPEC-018.
 *
 * Pulls SEO metrics from Google Search Console, Google Analytics 4,
 * and Bing Webmaster Tools, writes a dated JSON snapshot to
 * docs/strategy/data/. Designed for manual quarterly runs or wired
 * into CI for weekly cadence.
 *
 * Engines fail gracefully: missing credentials for one engine logs a
 * warning to stderr and continues with the rest. At least one engine
 * must be configured or the script errors out.
 *
 * ── Setup ────────────────────────────────────────────────────────────
 *
 * 1) Google Search Console (GSC)
 *    - In Google Cloud Console: create a service account, enable the
 *      Search Console API for the project, download the JSON key.
 *    - In Search Console → Settings → Users and permissions: add the
 *      service account's client_email with Restricted access on the
 *      sc-domain:coffey.codes property.
 *    - Set in .env (or .env.local):
 *        GSC_SERVICE_ACCOUNT_KEY_PATH=C:/path/to/key.json
 *        # or, for CI:
 *        GSC_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
 *
 * 2) GA4 Data API
 *    - Reuses the GSC service account.
 *    - In Google Cloud Console: enable the "Google Analytics Data API"
 *      for the same project as GSC.
 *    - In GA4 → Admin → Property Access Management: add the service
 *      account's client_email as a Viewer.
 *    - Set in .env:
 *        GA4_PROPERTY_ID=416080229
 *
 * 3) Bing Webmaster Tools
 *    - Sign in to https://www.bing.com/webmasters.
 *    - Settings → API Access → Generate an API key.
 *    - Set in .env:
 *        BING_WEBMASTER_API_KEY=<key>
 *
 * ── Usage ────────────────────────────────────────────────────────────
 *
 *   node scripts/seo-snapshot.mjs
 *
 * Optional CLI flags:
 *   --engines=gsc,bing,ga4    Default: all configured engines
 *   --window=180              Default: 365 (days)
 *   --dry-run                 Print what would be pulled; don't call APIs
 *
 * Optional env vars (also read from .env.local / .env):
 *   GSC_SITE_URL              Default: sc-domain:coffey.codes
 *   SNAPSHOT_WINDOW           Default: 365
 *   OUTPUT_DIR                Default: docs/strategy/data
 *
 * Output: docs/strategy/data/snapshot-<YYYY-MM-DD>.json
 */

import { google } from 'googleapis';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { promises as fs } from 'fs';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ── Constants ────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(__filename), '..');

// Auto-load .env then .env.local (Node 22+ ships process.loadEnvFile).
for (const name of ['.env', '.env.local']) {
  const f = path.join(REPO_ROOT, name);
  if (existsSync(f) && typeof process.loadEnvFile === 'function') {
    process.loadEnvFile(f);
  }
}

const SITE_URL = process.env.GSC_SITE_URL ?? 'sc-domain:coffey.codes';
const OUTPUT_DIR =
  process.env.OUTPUT_DIR ?? path.join('docs', 'strategy', 'data');

// Hard-coded per SPEC-018 must-have #5. Update here if the audit ever
// identifies new bot regions.
const BOT_REGIONS = ['China', 'Singapore'];

// Bing requires the full URL form, not the sc-domain: form.
const BING_SITE_URL = SITE_URL.startsWith('sc-domain:')
  ? `https://${SITE_URL.slice('sc-domain:'.length)}/`
  : SITE_URL;

// ── CLI args ─────────────────────────────────────────────────────────

function parseArgs(argv) {
  const out = { engines: null, window: null, dryRun: false };
  for (const arg of argv) {
    if (arg.startsWith('--engines=')) {
      out.engines = arg
        .slice('--engines='.length)
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
    } else if (arg.startsWith('--window=')) {
      out.window = Number(arg.slice('--window='.length));
    } else if (arg === '--dry-run') {
      out.dryRun = true;
    }
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
const WINDOW_DAYS = args.window ?? Number(process.env.SNAPSHOT_WINDOW ?? 365);

function shouldRun(engine) {
  return args.engines === null || args.engines.includes(engine);
}

function ymd(d) {
  return d.toISOString().slice(0, 10);
}

// ── Credentials ──────────────────────────────────────────────────────

function loadGoogleCredentials() {
  const keyPath = process.env.GSC_SERVICE_ACCOUNT_KEY_PATH;
  const inlineJson = process.env.GSC_SERVICE_ACCOUNT_JSON;

  if (keyPath) {
    const resolved = path.isAbsolute(keyPath)
      ? keyPath
      : path.resolve(REPO_ROOT, keyPath);
    if (!existsSync(resolved)) {
      throw new Error(
        `GSC_SERVICE_ACCOUNT_KEY_PATH points to a file that does not exist: ${resolved}`,
      );
    }
    return JSON.parse(readFileSync(resolved, 'utf-8'));
  }

  if (inlineJson) {
    return JSON.parse(inlineJson);
  }

  return null;
}

// ── GSC puller ───────────────────────────────────────────────────────

async function pullGsc({ startDate, endDate, credentials }) {
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });
  const client = google.searchconsole({ version: 'v1', auth });

  const query = async (params) => {
    const { data } = await client.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: params,
    });
    return data.rows ?? [];
  };

  const [byPage, byQuery, byCountry, byDevice] = await Promise.all([
    query({
      startDate,
      endDate,
      dimensions: ['page'],
      rowLimit: 25,
      dataState: 'final',
    }),
    query({
      startDate,
      endDate,
      dimensions: ['query'],
      rowLimit: 50,
      dataState: 'final',
    }),
    query({
      startDate,
      endDate,
      dimensions: ['country'],
      rowLimit: 15,
      dataState: 'final',
    }),
    query({
      startDate,
      endDate,
      dimensions: ['device'],
      dataState: 'final',
    }),
  ]);

  const totals = byDevice.reduce(
    (acc, row) => ({
      clicks: acc.clicks + (row.clicks ?? 0),
      impressions: acc.impressions + (row.impressions ?? 0),
    }),
    { clicks: 0, impressions: 0 },
  );
  const ctr = totals.impressions > 0 ? totals.clicks / totals.impressions : 0;

  return {
    window: { startDate, endDate, days: WINDOW_DAYS },
    totals: { ...totals, ctr },
    topPages: byPage,
    topQueries: byQuery,
    countries: byCountry,
    devices: byDevice,
  };
}

// ── GA4 puller ───────────────────────────────────────────────────────

async function pullGa4({ startDate, endDate, credentials }) {
  const propertyId = process.env.GA4_PROPERTY_ID;
  if (!propertyId) {
    throw new Error('GA4_PROPERTY_ID is required for GA4 puller');
  }
  const property = `properties/${propertyId}`;

  const ga4 = new BetaAnalyticsDataClient({ credentials });

  // Filter that excludes BOT_REGIONS from any report.
  const excludeBotRegions = {
    notExpression: {
      filter: {
        fieldName: 'country',
        inListFilter: { values: BOT_REGIONS },
      },
    },
  };

  const runReport = async (params) => {
    const [resp] = await ga4.runReport({
      property,
      dateRanges: [{ startDate, endDate }],
      ...params,
    });
    // Normalize: rows is the only field consumers need; keep
    // dimensionHeaders / metricHeaders too for debuggability.
    return {
      dimensionHeaders: resp.dimensionHeaders ?? [],
      metricHeaders: resp.metricHeaders ?? [],
      rows: resp.rows ?? [],
    };
  };

  const trafficSourcesSpec = {
    dimensions: [
      { name: 'sessionDefaultChannelGroup' },
      { name: 'sessionSource' },
      { name: 'sessionMedium' },
    ],
    metrics: [{ name: 'sessions' }, { name: 'conversions' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 15,
  };

  const organicLandingPagesSpec = {
    dimensions: [{ name: 'landingPagePlusQueryString' }],
    metrics: [
      { name: 'sessions' },
      { name: 'bounceRate' },
      { name: 'conversions' },
      { name: 'engagementRate' },
      { name: 'averageSessionDuration' },
    ],
    dimensionFilter: {
      filter: {
        fieldName: 'sessionDefaultChannelGroup',
        stringFilter: { matchType: 'EXACT', value: 'Organic Search' },
      },
    },
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 15,
  };

  const userBehaviorByDeviceSpec = {
    dimensions: [{ name: 'deviceCategory' }],
    metrics: [
      { name: 'activeUsers' },
      { name: 'sessions' },
      { name: 'engagementRate' },
    ],
  };

  const userBehaviorByCountrySpec = {
    dimensions: [{ name: 'country' }],
    metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
    orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
    limit: 10,
  };

  const engagementSpec = {
    metrics: [
      { name: 'averageSessionDuration' },
      { name: 'engagementRate' },
    ],
  };

  // Compose a bot-region-excluded variant of any spec.
  const withBotFilter = (spec) => {
    if (spec.dimensionFilter) {
      return {
        ...spec,
        dimensionFilter: {
          andGroup: {
            expressions: [spec.dimensionFilter, excludeBotRegions],
          },
        },
      };
    }
    return { ...spec, dimensionFilter: excludeBotRegions };
  };

  const [
    trafficSources,
    organicLandingPages,
    userBehaviorByDevice,
    userBehaviorByCountry,
    engagement,
    trafficSourcesExBotRegions,
    userBehaviorByCountryExBotRegions,
  ] = await Promise.all([
    runReport(trafficSourcesSpec),
    runReport(organicLandingPagesSpec),
    runReport(userBehaviorByDeviceSpec),
    runReport(userBehaviorByCountrySpec),
    runReport(engagementSpec),
    runReport(withBotFilter(trafficSourcesSpec)),
    runReport(withBotFilter(userBehaviorByCountrySpec)),
  ]);

  return {
    window: { startDate, endDate, days: WINDOW_DAYS },
    propertyId,
    botRegionsExcluded: BOT_REGIONS,
    trafficSources,
    organicLandingPages,
    userBehavior: {
      devices: userBehaviorByDevice,
      countries: userBehaviorByCountry,
      engagement,
    },
    trafficSourcesExBotRegions,
    userBehaviorExBotRegions: {
      countries: userBehaviorByCountryExBotRegions,
    },
  };
}

// ── Bing puller ──────────────────────────────────────────────────────

async function pullBing({ startDate, endDate }) {
  const apiKey = process.env.BING_WEBMASTER_API_KEY;
  if (!apiKey) {
    throw new Error('BING_WEBMASTER_API_KEY is required for Bing puller');
  }

  const callApi = async (endpoint, extraParams = {}) => {
    const url = new URL(`https://ssl.bing.com/webmaster/api.svc/json/${endpoint}`);
    url.searchParams.set('apikey', apiKey);
    url.searchParams.set('siteUrl', BING_SITE_URL);
    for (const [k, v] of Object.entries(extraParams)) {
      url.searchParams.set(k, v);
    }
    const resp = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!resp.ok) {
      const body = await resp.text().catch(() => '');
      throw new Error(
        `Bing API ${endpoint} failed: HTTP ${resp.status} ${resp.statusText}, body: ${body.slice(0, 200)}`,
      );
    }
    const json = await resp.json();
    return json.d ?? [];
  };

  // GetRankAndTrafficStats returns daily impressions/clicks/position.
  // GetQueryStats returns top queries with avg position.
  const [trafficStats, queryStats] = await Promise.all([
    callApi('GetRankAndTrafficStats'),
    callApi('GetQueryStats'),
  ]);

  // Aggregate daily totals for a quick summary alongside the raw daily
  // array. The /Date(...)/ format from Bing's API stays in the raw
  // array; consumers can parse it if they want a time-series.
  const aggregated = (trafficStats ?? []).reduce(
    (acc, row) => ({
      clicks: acc.clicks + (row.Clicks ?? 0),
      impressions: acc.impressions + (row.Impressions ?? 0),
    }),
    { clicks: 0, impressions: 0 },
  );
  const ctr =
    aggregated.impressions > 0 ? aggregated.clicks / aggregated.impressions : 0;

  const isEmpty =
    (trafficStats ?? []).length === 0 && (queryStats ?? []).length === 0;

  return {
    window: { startDate, endDate, days: WINDOW_DAYS },
    siteUrl: BING_SITE_URL,
    totals: { ...aggregated, ctr },
    trafficStats: trafficStats ?? [],
    topQueries: queryStats ?? [],
    ...(isEmpty && { _note: 'empty response' }),
  };
}

// ── Orchestrator ─────────────────────────────────────────────────────

async function main() {
  const now = new Date();
  // GSC has a ~3-day lag for `final` data; back off the end date.
  const endDate = ymd(new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000));
  const startDate = ymd(
    new Date(now.getTime() - (WINDOW_DAYS + 3) * 24 * 60 * 60 * 1000),
  );

  const googleCreds = loadGoogleCredentials();
  const ga4PropertyId = process.env.GA4_PROPERTY_ID;
  const bingApiKey = process.env.BING_WEBMASTER_API_KEY;

  const planned = [];
  if (shouldRun('gsc')) {
    if (googleCreds) {
      planned.push([
        'gsc',
        () => pullGsc({ startDate, endDate, credentials: googleCreds }),
      ]);
    } else {
      console.warn(
        '[snapshot] gsc: skipped (no Google service account credentials configured)',
      );
    }
  }
  if (shouldRun('ga4')) {
    if (googleCreds && ga4PropertyId) {
      planned.push([
        'ga4',
        () => pullGa4({ startDate, endDate, credentials: googleCreds }),
      ]);
    } else if (!googleCreds) {
      console.warn(
        '[snapshot] ga4: skipped (no Google service account credentials configured)',
      );
    } else {
      console.warn('[snapshot] ga4: skipped (GA4_PROPERTY_ID not set)');
    }
  }
  if (shouldRun('bing')) {
    if (bingApiKey) {
      planned.push(['bing', () => pullBing({ startDate, endDate })]);
    } else {
      console.warn(
        '[snapshot] bing: skipped (BING_WEBMASTER_API_KEY not set)',
      );
    }
  }

  if (planned.length === 0) {
    throw new Error(
      'No engines configured. Set at least one of GSC_SERVICE_ACCOUNT_*, GA4_PROPERTY_ID, or BING_WEBMASTER_API_KEY.',
    );
  }

  if (args.dryRun) {
    console.log(
      `[dry-run] Would pull from ${planned.map(([n]) => n).join(', ')} for window ${startDate} to ${endDate}`,
    );
    return;
  }

  const results = await Promise.allSettled(
    planned.map(async ([name, fn]) => [name, await fn()]),
  );

  const snapshot = {
    window: { startDate, endDate, days: WINDOW_DAYS },
    pulledAt: new Date().toISOString(),
    siteUrl: SITE_URL,
  };

  for (const r of results) {
    if (r.status === 'fulfilled') {
      const [name, data] = r.value;
      snapshot[name] = data;
    } else {
      console.error(
        `[snapshot] engine pull failed: ${r.reason?.message ?? r.reason}`,
      );
    }
  }

  // Backwards-compat: surface GSC totals + top arrays at the top level
  // so SPEC-016-era consumers keep working.
  if (snapshot.gsc) {
    snapshot.totals = snapshot.gsc.totals;
    snapshot.topPages = snapshot.gsc.topPages;
    snapshot.topQueries = snapshot.gsc.topQueries;
    snapshot.countries = snapshot.gsc.countries;
    snapshot.devices = snapshot.gsc.devices;
  }

  const outDir = path.resolve(REPO_ROOT, OUTPUT_DIR);
  await fs.mkdir(outDir, { recursive: true });
  const outFile = path.join(outDir, `snapshot-${ymd(now)}.json`);
  await fs.writeFile(outFile, JSON.stringify(snapshot, null, 2) + '\n');

  console.log(`Wrote ${outFile}`);
  if (snapshot.gsc) {
    console.log(
      `GSC window: ${startDate} to ${endDate}  Clicks: ${snapshot.gsc.totals.clicks}  Impressions: ${snapshot.gsc.totals.impressions}  CTR: ${(snapshot.gsc.totals.ctr * 100).toFixed(2)}%`,
    );
  }
  if (snapshot.ga4) {
    const totalSessions = (snapshot.ga4.trafficSources.rows ?? []).reduce(
      (sum, row) => sum + Number(row.metricValues?.[0]?.value ?? 0),
      0,
    );
    console.log(`GA4 sessions: ${totalSessions}`);
  }
  if (snapshot.bing) {
    console.log(
      `Bing clicks: ${snapshot.bing.totals.clicks}  Impressions: ${snapshot.bing.totals.impressions}${snapshot.bing._note ? '  (' + snapshot.bing._note + ')' : ''}`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
