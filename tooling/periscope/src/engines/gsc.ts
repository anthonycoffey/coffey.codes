/**
 * Google Search Console engine.
 *
 * Pulls four parallel breakdowns from the Search Console API:
 *   - by page (top 25)
 *   - by query (top 50)
 *   - by country (top 15)
 *   - by device (no limit; only ~3 buckets)
 *
 * Returns the raw API rows. The orchestrator does the keyword-engine
 * enrichment join on `topQueries` after this returns.
 */

import { google } from 'googleapis';

import { buildGoogleAuth } from '../lib/auth.js';
import type {
  GscEngineData,
  GscRow,
  GscTopQueryRow,
} from '../types/snapshot.js';
import type { GoogleServiceAccountCredentials } from '../lib/auth.js';

const GSC_SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly'];

export interface PullGscOptions {
  siteUrl: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  windowDays: number;
  credentials: GoogleServiceAccountCredentials;
}

interface GscRequestBody {
  startDate: string;
  endDate: string;
  dimensions: string[];
  rowLimit?: number;
  dataState?: 'final' | 'all';
}

/**
 * Pull a full GSC snapshot section. All four sub-queries run in parallel;
 * totals are derived from the by-device rows (smallest accurate aggregate).
 */
export async function pullGsc({
  siteUrl,
  startDate,
  endDate,
  windowDays,
  credentials,
}: PullGscOptions): Promise<GscEngineData> {
  const auth = buildGoogleAuth(credentials, GSC_SCOPES);
  const client = google.searchconsole({ version: 'v1', auth });

  const query = async (params: GscRequestBody): Promise<GscRow[]> => {
    const { data } = await client.searchanalytics.query({
      siteUrl,
      requestBody: params,
    });
    return (data.rows ?? []) as GscRow[];
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
    window: { startDate, endDate, days: windowDays },
    totals: { ...totals, ctr },
    topPages: byPage,
    topQueries: byQuery as GscTopQueryRow[],
    countries: byCountry,
    devices: byDevice,
  };
}
