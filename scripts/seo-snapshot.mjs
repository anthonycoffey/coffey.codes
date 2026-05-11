#!/usr/bin/env node
/**
 * SEO snapshot script (SPEC-016 nice-to-have).
 *
 * Pulls a focused set of Google Search Console metrics and writes a
 * dated JSON snapshot to docs/strategy/data/. Designed to be run
 * weekly or quarterly (cron, GitHub Actions, or manually).
 *
 * Auth: uses a Google Cloud service account with read access to the
 * GSC property. Two ways to provide the credentials:
 *
 *   A) GSC_SERVICE_ACCOUNT_KEY_PATH: filesystem path to the service
 *      account JSON key file (recommended for local use).
 *   B) GSC_SERVICE_ACCOUNT_JSON: the entire JSON contents as a string
 *      (recommended for CI where filesystem secrets aren't safe).
 *
 * The script reads .env.local automatically (if present) so you can
 * keep credentials out of your shell history. Set up:
 *
 *   1. In Google Cloud Console, create a service account.
 *   2. Enable the Search Console API for the project.
 *   3. Download the service account's JSON key.
 *   4. In Search Console, add the service account's email as a User
 *      (Restricted permission is enough) on the sc-domain:coffey.codes
 *      property.
 *   5. Add ONE of these to .env.local at the repo root:
 *        GSC_SERVICE_ACCOUNT_KEY_PATH=C:/path/to/key.json
 *        # or:
 *        GSC_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
 *
 * Usage:
 *   node scripts/seo-snapshot.mjs
 *
 * Optional env vars (also read from .env.local):
 *   GSC_SITE_URL     default: sc-domain:coffey.codes
 *   SNAPSHOT_WINDOW  default: 365 (days)
 *   OUTPUT_DIR       default: docs/strategy/data
 *
 * Output: docs/strategy/data/snapshot-<YYYY-MM-DD>.json
 *
 * What's in each snapshot:
 *   - Window metadata (startDate, endDate, pulledAt)
 *   - Top-level totals (clicks, impressions, ctr, position)
 *   - Top 25 pages by clicks
 *   - Top 50 queries by clicks
 *   - Country breakdown (top 15)
 *   - Device breakdown (3 rows)
 *
 * What's NOT in each snapshot (deliberately):
 *   - Bing or GA4 data (separate auth surfaces, separate scripts if
 *     wanted)
 *   - The full long tail of queries (500 rows blows up snapshot size
 *     and the audit can pull on demand)
 */

import { google } from 'googleapis';
import { promises as fs } from 'fs';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve repo root early so .env.local lookup works regardless of cwd.
const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(__filename), '..');

// Auto-load .env.local (Next.js convention) if present. Node 22 ships
// process.loadEnvFile; the project requires Node >= 22, so it's safe.
const envFile = path.join(REPO_ROOT, '.env');
if (existsSync(envFile) && typeof process.loadEnvFile === 'function') {
  process.loadEnvFile(envFile);
}

const SITE_URL = process.env.GSC_SITE_URL ?? 'sc-domain:coffey.codes';
const WINDOW_DAYS = Number(process.env.SNAPSHOT_WINDOW ?? 365);
const OUTPUT_DIR =
  process.env.OUTPUT_DIR ?? path.join('docs', 'strategy', 'data');

function ymd(d) {
  return d.toISOString().slice(0, 10);
}

function loadCredentials() {
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
    try {
      return JSON.parse(readFileSync(resolved, 'utf-8'));
    } catch (err) {
      throw new Error(
        `Failed to parse service account JSON at ${resolved}: ${err.message}`,
      );
    }
  }

  if (inlineJson) {
    try {
      return JSON.parse(inlineJson);
    } catch (err) {
      throw new Error(
        `GSC_SERVICE_ACCOUNT_JSON is not valid JSON: ${err.message}`,
      );
    }
  }

  throw new Error(
    'No service account credentials found. Set GSC_SERVICE_ACCOUNT_KEY_PATH ' +
      '(filesystem path) or GSC_SERVICE_ACCOUNT_JSON (inline JSON) in ' +
      '.env.local or as a shell env var. See script header for setup.',
  );
}

async function getAuthedClient() {
  const creds = loadCredentials();
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });
  return google.searchconsole({ version: 'v1', auth });
}

async function queryGsc(client, params) {
  const { data } = await client.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: params,
  });
  return data.rows ?? [];
}

async function pull(client, startDate, endDate) {
  // GSC API rejects [date,page,query] in one call for some properties;
  // pull each dimension set separately and combine in the snapshot.
  const [byPage, byQuery, byCountry, byDevice] = await Promise.all([
    queryGsc(client, {
      startDate,
      endDate,
      dimensions: ['page'],
      rowLimit: 25,
      dataState: 'final',
    }),
    queryGsc(client, {
      startDate,
      endDate,
      dimensions: ['query'],
      rowLimit: 50,
      dataState: 'final',
    }),
    queryGsc(client, {
      startDate,
      endDate,
      dimensions: ['country'],
      rowLimit: 15,
      dataState: 'final',
    }),
    queryGsc(client, {
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
    pulledAt: new Date().toISOString(),
    siteUrl: SITE_URL,
    totals: { ...totals, ctr },
    topPages: byPage,
    topQueries: byQuery,
    countries: byCountry,
    devices: byDevice,
  };
}

async function main() {
  const now = new Date();
  // GSC has a ~3-day lag for `final` data; back off the end date.
  const endDate = ymd(new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000));
  const startDate = ymd(
    new Date(now.getTime() - (WINDOW_DAYS + 3) * 24 * 60 * 60 * 1000),
  );

  const client = await getAuthedClient();
  const snapshot = await pull(client, startDate, endDate);

  const outDir = path.resolve(REPO_ROOT, OUTPUT_DIR);
  await fs.mkdir(outDir, { recursive: true });

  const outFile = path.join(outDir, `snapshot-${ymd(now)}.json`);
  await fs.writeFile(outFile, JSON.stringify(snapshot, null, 2) + '\n');

  console.log(`Wrote ${outFile}`);
  console.log(
    `Window: ${startDate} to ${endDate}  Clicks: ${snapshot.totals.clicks}  Impressions: ${snapshot.totals.impressions}  CTR: ${(snapshot.totals.ctr * 100).toFixed(2)}%`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
