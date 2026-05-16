/**
 * Bing Webmaster Tools engine.
 *
 * Calls the JSON REST surface at https://ssl.bing.com/webmaster/api.svc/json/
 * with the API key as a query parameter. Two calls, parallel:
 *   - GetRankAndTrafficStats — daily clicks/impressions/position
 *   - GetQueryStats          — top queries with avg position
 *
 * Bing requires the full URL form (https://example.com/), not GSC's
 * sc-domain: form. The caller converts.
 */

import type {
  BingEngineData,
  BingQueryRow,
  BingTrafficRow,
  SnapshotWindow,
} from '../types/snapshot.js';

export interface PullBingOptions {
  /** Full URL form: `https://example.com/`. */
  siteUrl: string;
  apiKey: string;
  startDate: string;
  endDate: string;
  windowDays: number;
}

async function callBing<T>(
  endpoint: string,
  params: Record<string, string>,
): Promise<T[]> {
  const url = new URL(`https://ssl.bing.com/webmaster/api.svc/json/${endpoint}`);
  for (const [k, v] of Object.entries(params)) {
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
  const json = (await resp.json()) as { d?: T[] };
  return json.d ?? [];
}

export async function pullBing({
  siteUrl,
  apiKey,
  startDate,
  endDate,
  windowDays,
}: PullBingOptions): Promise<BingEngineData> {
  const baseParams = { apikey: apiKey, siteUrl };

  const [trafficStats, queryStats] = await Promise.all([
    callBing<BingTrafficRow>('GetRankAndTrafficStats', baseParams),
    callBing<BingQueryRow>('GetQueryStats', baseParams),
  ]);

  const aggregated = trafficStats.reduce<{ clicks: number; impressions: number }>(
    (acc, row) => ({
      clicks: acc.clicks + Number(row.Clicks ?? 0),
      impressions: acc.impressions + Number(row.Impressions ?? 0),
    }),
    { clicks: 0, impressions: 0 },
  );
  const ctr =
    aggregated.impressions > 0
      ? aggregated.clicks / aggregated.impressions
      : 0;

  const isEmpty = trafficStats.length === 0 && queryStats.length === 0;
  const window: SnapshotWindow = { startDate, endDate, days: windowDays };

  return {
    window,
    siteUrl,
    totals: { ...aggregated, ctr },
    trafficStats,
    topQueries: queryStats,
    ...(isEmpty && { _note: 'empty response' }),
  };
}
