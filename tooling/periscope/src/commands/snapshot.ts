/**
 * `periscope snapshot` command.
 *
 * Orchestrates GSC, GA4, and Bing engine pulls, composes them into a
 * single SnapshotEnvelope, and writes the JSON + Markdown pair to
 * outputDir/snapshot-<date>.{json,md}.
 *
 * The keywords engine (Google Ads Planner enrichment) is wired through
 * but no-ops in this version -- it lands with the rest of the keyword
 * research tooling. When that ships, this orchestrator gets the
 * gsc.topQueries → keywords enrichment step plugged back in.
 *
 * Configuration comes from env vars at this stage (commit 5 introduces
 * a real periscope.config.ts loader that this command will prefer).
 */

import { existsSync } from 'node:fs';
import path from 'node:path';

import { loadGoogleCredentials } from '../lib/auth.js';
import { renderSnapshotMarkdown } from '../lib/markdown.js';
import {
  writeSnapshotJson,
  writeSnapshotMarkdown,
} from '../lib/snapshot-store.js';
import { pullBing } from '../engines/bing.js';
import { pullGa4 } from '../engines/ga4.js';
import { pullGsc } from '../engines/gsc.js';
import type {
  EngineName,
  SnapshotEnvelope,
} from '../types/snapshot.js';

export interface SnapshotCommandOptions {
  engines?: string;
  window?: string;
  asof?: string;
  dryRun?: boolean;
  /** Project root override. Defaults to process.cwd(). */
  repoRoot?: string;
}

/** Engines this command currently knows how to run. */
const SUPPORTED_ENGINES = new Set<EngineName>(['gsc', 'ga4', 'bing', 'keywords']);

/** Default bot-region exclusion list per SPEC-018. */
const DEFAULT_BOT_REGIONS = ['China', 'Singapore'];

/** GSC has a ~3-day lag for `final` data; back off the end date by this many days. */
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

/** Auto-load .env then .env.local. Node 22+ ships process.loadEnvFile. */
function loadDotenv(repoRoot: string): void {
  if (typeof process.loadEnvFile !== 'function') return;
  for (const name of ['.env', '.env.local']) {
    const f = path.join(repoRoot, name);
    if (existsSync(f)) {
      try {
        process.loadEnvFile(f);
      } catch {
        // Tolerate malformed env files -- engine-level checks will surface
        // missing values with their own clear errors.
      }
    }
  }
}

export async function runSnapshot(
  options: SnapshotCommandOptions,
): Promise<void> {
  const repoRoot = options.repoRoot ?? process.cwd();
  loadDotenv(repoRoot);

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

  const siteUrl = process.env.GSC_SITE_URL;
  if (!siteUrl) {
    throw new Error(
      'GSC_SITE_URL is required. Set it in .env (e.g. GSC_SITE_URL=sc-domain:example.com).',
    );
  }
  const outputDir = path.resolve(
    repoRoot,
    process.env.OUTPUT_DIR ?? path.join('docs', 'strategy', 'data'),
  );

  // Bing requires the full URL form, not sc-domain:
  const bingSiteUrl = siteUrl.startsWith('sc-domain:')
    ? `https://${siteUrl.slice('sc-domain:'.length)}/`
    : siteUrl;

  const googleCreds = loadGoogleCredentials(repoRoot);
  const ga4PropertyId = process.env.GA4_PROPERTY_ID;
  const bingApiKey = process.env.BING_WEBMASTER_API_KEY;

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
            botRegions: DEFAULT_BOT_REGIONS,
          }),
      });
    } else if (!googleCreds) {
      process.stderr.write(
        '[snapshot] ga4: skipped (no Google service account credentials configured)\n',
      );
    } else {
      process.stderr.write('[snapshot] ga4: skipped (GA4_PROPERTY_ID not set)\n');
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

  // Keywords engine lands in a follow-up commit. Surface a clear "not yet
  // available" message instead of silently skipping so users running the
  // pre-port script don't mistake parity for completeness.
  if (shouldRun('keywords', selected) && selected?.includes('keywords')) {
    process.stderr.write(
      '[snapshot] keywords: skipped (Google Ads engine not yet ported; see SPEC-023)\n',
    );
  }

  if (planned.length === 0) {
    throw new Error(
      'No engines configured. Set at least one of GSC_SERVICE_ACCOUNT_*, GA4_PROPERTY_ID, BING_WEBMASTER_API_KEY.',
    );
  }

  if (options.dryRun) {
    process.stdout.write(
      `[dry-run] Would pull from ${planned.map((p) => p.name).join(', ')} for window ${startDate} to ${endDate}\n`,
    );
    return;
  }

  // ── Pull ──────────────────────────────────────────────────────────────
  const results = await Promise.allSettled(
    planned.map(async (p) => ({ name: p.name, data: await p.run() })),
  );

  const snapshot: SnapshotEnvelope = {
    window: { startDate, endDate, days: windowDays },
    pulledAt: new Date().toISOString(),
    siteUrl,
  };

  for (const r of results) {
    if (r.status === 'fulfilled') {
      const { name, data } = r.value;
      // The types narrowing on a discriminated union of engine outputs
      // would be heavy here; the wire shape is fully described in the
      // SnapshotEnvelope so a single indexed assignment is fine.
      (snapshot as unknown as Record<string, unknown>)[name] = data;
    } else {
      const reason = r.reason as Error | undefined;
      process.stderr.write(
        `[snapshot] engine pull failed: ${reason?.message ?? r.reason}\n`,
      );
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

  // Empty-result guard: if every engine failed, don't overwrite any
  // existing snapshot file with the bare envelope.
  const snapshotIndexed = snapshot as unknown as Record<string, unknown>;
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
}
