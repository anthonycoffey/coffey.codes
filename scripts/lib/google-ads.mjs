/**
 * Google Ads API helper — SPEC-019 + SPEC-020.
 *
 * Direct REST against https://googleads.googleapis.com/v17/. Avoids
 * adding google-ads-api as a dep; the gRPC client doesn't ship
 * service-account JWT auth out of the box, and the REST surface is
 * stable enough to talk to directly.
 *
 * Exports:
 *   - getAdsAuth()                — returns { accessToken, customerId, loginCustomerId, devToken } or null
 *   - generateKeywordIdeas(seed)  — { keywords?, url?, language?, geo?, pageSize? } -> normalized rows
 *   - generateHistoricalMetrics(keywords) -> normalized rows
 *   - generateIdeasFromUrl(url)   — convenience wrapper around generateKeywordIdeas
 *   - loadLatestSnapshot()        — reads docs/strategy/data/, returns most-recent snapshot JSON (or null)
 *   - isSnapshotStale(snap, days) — boolean
 *   - bucketLabel(metrics)        — derives "<100" / "100-1K" / "1K-10K" / "10K-100K" / "100K+"
 *   - BUCKET_ORDER, bucketRank    — for sorting/comparing buckets
 *
 * Env vars (all required for live calls):
 *   GOOGLE_ADS_DEVELOPER_TOKEN
 *   GOOGLE_ADS_CUSTOMER_ID         (10-digit, no dashes)
 *   GOOGLE_ADS_LOGIN_CUSTOMER_ID   (10-digit, same as CUSTOMER_ID for direct access)
 *   GSC_SERVICE_ACCOUNT_KEY_PATH or GSC_SERVICE_ACCOUNT_JSON
 *     (reuses the same Google service account that auths GSC + GA4;
 *      the service account email must be added as a user inside the
 *      Google Ads account before any of this works)
 */

import { google } from 'googleapis';
import { promises as fs } from 'fs';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(__filename), '..', '..');

// Auto-load .env then .env.local (Node 22+ ships process.loadEnvFile)
for (const name of ['.env', '.env.local']) {
  const f = path.join(REPO_ROOT, name);
  if (existsSync(f) && typeof process.loadEnvFile === 'function') {
    process.loadEnvFile(f);
  }
}

const API_VERSION = 'v21';
const API_BASE = `https://googleads.googleapis.com/${API_VERSION}`;
const ADS_SCOPE = 'https://www.googleapis.com/auth/adwords';

// Google Ads language and geo constants.
// https://developers.google.com/google-ads/api/data/codes-formats
const LANGUAGE_EN = 'languageConstants/1000';
const GEO_US = 'geoTargetConstants/2840';

export const BUCKET_ORDER = ['<100', '100-1K', '1K-10K', '10K-100K', '100K+'];
export function bucketRank(label) {
  const i = BUCKET_ORDER.indexOf(label);
  return i === -1 ? -1 : i;
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

function adsConfigured() {
  return !!(
    process.env.GOOGLE_ADS_DEVELOPER_TOKEN &&
    process.env.GOOGLE_ADS_CUSTOMER_ID &&
    process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID &&
    loadGoogleCredentials()
  );
}

let cachedAuth = null;

export async function getAdsAuth() {
  if (!adsConfigured()) return null;
  if (cachedAuth && cachedAuth.expiresAt > Date.now() + 60_000) {
    return cachedAuth;
  }
  const credentials = loadGoogleCredentials();
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [ADS_SCOPE],
  });
  const client = await auth.getClient();
  const tokenResp = await client.getAccessToken();
  if (!tokenResp.token) {
    throw new Error('Google Ads auth: failed to mint an access token');
  }
  // Customer IDs come in either '123-456-7890' or '1234567890' shape
  // from the Ads UI. Normalize to digits-only so the API accepts them
  // without forcing users to re-edit .env.
  const stripDashes = (s) => String(s ?? '').replace(/\D/g, '');
  cachedAuth = {
    accessToken: tokenResp.token,
    expiresAt: Date.now() + 50 * 60_000, // service-account tokens last 1h; refresh 10m early
    customerId: stripDashes(process.env.GOOGLE_ADS_CUSTOMER_ID),
    loginCustomerId: stripDashes(process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID),
    devToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
  };
  return cachedAuth;
}

function adsHeaders(auth) {
  return {
    Authorization: `Bearer ${auth.accessToken}`,
    'developer-token': auth.devToken,
    'login-customer-id': auth.loginCustomerId,
    'Content-Type': 'application/json',
  };
}

async function adsPost(endpoint, body) {
  const auth = await getAdsAuth();
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
    throw new Error(
      `Google Ads ${endpoint} failed: HTTP ${resp.status} ${resp.statusText} — ${text.slice(0, 400)}`,
    );
  }
  return await resp.json();
}

// ── Normalization ────────────────────────────────────────────────────

// Derive a bucket label from avgMonthlySearches (when present).
// Pure-bucket APIs (no spend) leave avgMonthlySearches null; in that
// case fall through and rely on the caller to provide _no_ bucket.
export function bucketLabel(avgMonthly) {
  const n = Number(avgMonthly ?? 0);
  if (!n || n < 100) return '<100';
  if (n < 1000) return '100-1K';
  if (n < 10000) return '1K-10K';
  if (n < 100000) return '10K-100K';
  return '100K+';
}

function normalizeMetrics(metrics) {
  if (!metrics) return null;
  const avg = metrics.avgMonthlySearches
    ? Number(metrics.avgMonthlySearches)
    : null;
  return {
    volumeAvgMonthly: avg,
    volumeBucket: avg != null ? bucketLabel(avg) : null,
    competition: metrics.competition ?? null, // 'LOW' | 'MEDIUM' | 'HIGH' | 'UNSPECIFIED'
    competitionIndex:
      metrics.competitionIndex != null
        ? Number(metrics.competitionIndex)
        : null,
    cpcLowMicros: metrics.lowTopOfPageBidMicros
      ? Number(metrics.lowTopOfPageBidMicros)
      : null,
    cpcHighMicros: metrics.highTopOfPageBidMicros
      ? Number(metrics.highTopOfPageBidMicros)
      : null,
    monthlySearchVolumes: Array.isArray(metrics.monthlySearchVolumes)
      ? metrics.monthlySearchVolumes
      : [],
  };
}

// ── Public API: ideas ────────────────────────────────────────────────

export async function generateKeywordIdeas({
  keywords,
  url,
  language = LANGUAGE_EN,
  geo = GEO_US,
  pageSize = 100,
} = {}) {
  if (!keywords && !url) {
    throw new Error('generateKeywordIdeas: pass at least one of { keywords, url }');
  }
  const body = {
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
  const resp = await adsPost('generateKeywordIdeas', body);
  const results = resp.results ?? [];
  return results.map((r) => ({
    keyword: r.text,
    ...normalizeMetrics(r.keywordIdeaMetrics),
  }));
}

export async function generateHistoricalMetrics(keywords) {
  if (!keywords?.length) return [];
  // The API caps each call at ~10k keywords; we'll never come close,
  // but keep the limit explicit so a future caller doesn't surprise itself.
  const body = {
    keywords,
    language: LANGUAGE_EN,
    geoTargetConstants: [GEO_US],
  };
  const resp = await adsPost('generateKeywordHistoricalMetrics', body);
  const results = resp.results ?? [];
  return results.map((r) => ({
    keyword: r.text,
    ...normalizeMetrics(r.keywordMetrics),
    closeVariants: r.closeVariants ?? [],
  }));
}

export async function generateIdeasFromUrl(url, opts = {}) {
  return generateKeywordIdeas({ url, ...opts });
}

// ── Snapshot helpers ─────────────────────────────────────────────────

export async function loadLatestSnapshot() {
  const dir = path.resolve(REPO_ROOT, 'docs', 'strategy', 'data');
  if (!existsSync(dir)) return null;
  const files = (await fs.readdir(dir))
    .filter((f) => /^snapshot-\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .sort();
  if (files.length === 0) return null;
  const latest = files[files.length - 1];
  const raw = await fs.readFile(path.join(dir, latest), 'utf-8');
  const data = JSON.parse(raw);
  data._sourceFile = latest;
  return data;
}

export function isSnapshotStale(snapshot, days = 30) {
  if (!snapshot?.pulledAt) return true;
  const pulledAt = new Date(snapshot.pulledAt).getTime();
  if (Number.isNaN(pulledAt)) return true;
  const ageMs = Date.now() - pulledAt;
  return ageMs > days * 24 * 60 * 60 * 1000;
}

// ── Repo helpers (used by SPEC-020 tools) ────────────────────────────

export function repoRoot() {
  return REPO_ROOT;
}
