/**
 * Google service-account JWT auth.
 *
 * One service account fronts Google Search Console, GA4, and the Google
 * Ads API. Each consumer picks its scopes; this module mints and caches
 * the access token plus the Ads-specific identifiers.
 *
 * Credentials come from one of two env vars (in priority order):
 *   - GSC_SERVICE_ACCOUNT_KEY_PATH: absolute or repo-relative path to a JSON key
 *   - GSC_SERVICE_ACCOUNT_JSON: the JSON key inline (for CI)
 *
 * Returns null when not configured. Callers should treat that as a
 * normal "skip this engine" signal, not an error.
 */

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { google } from 'googleapis';

const ADS_SCOPE = 'https://www.googleapis.com/auth/adwords';

export interface GoogleServiceAccountCredentials {
  type: 'service_account';
  client_email: string;
  private_key: string;
  // ...other fields present in the JSON key file but unused here
  [key: string]: unknown;
}

export interface GoogleAdsAuth {
  accessToken: string;
  expiresAt: number;
  customerId: string;
  loginCustomerId: string;
  devToken: string;
}

/**
 * Load the Google service-account credentials from env. Returns null
 * when neither env var is set or the key file is missing.
 */
export function loadGoogleCredentials(
  repoRoot: string,
): GoogleServiceAccountCredentials | null {
  const keyPath = process.env.GSC_SERVICE_ACCOUNT_KEY_PATH;
  const inlineJson = process.env.GSC_SERVICE_ACCOUNT_JSON;

  if (keyPath) {
    const resolved = path.isAbsolute(keyPath)
      ? keyPath
      : path.resolve(repoRoot, keyPath);
    if (!existsSync(resolved)) {
      throw new Error(
        `GSC_SERVICE_ACCOUNT_KEY_PATH points to a file that does not exist: ${resolved}`,
      );
    }
    return JSON.parse(
      readFileSync(resolved, 'utf-8'),
    ) as GoogleServiceAccountCredentials;
  }

  if (inlineJson) {
    return JSON.parse(inlineJson) as GoogleServiceAccountCredentials;
  }

  return null;
}

/**
 * Returns true when all four Ads env vars + service-account credentials
 * are present. Used as a precondition before any Ads API call.
 */
export function adsConfigured(repoRoot: string): boolean {
  return !!(
    process.env.GOOGLE_ADS_DEVELOPER_TOKEN &&
    process.env.GOOGLE_ADS_CUSTOMER_ID &&
    process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID &&
    loadGoogleCredentials(repoRoot)
  );
}

// Module-level cache: service-account tokens are good for 1h; refresh
// 10m early. Sharing across calls in a single CLI run avoids the
// re-mint roundtrip per request.
let cachedAuth: GoogleAdsAuth | null = null;

/**
 * Mint (or return cached) Google Ads auth. Customer IDs are normalized
 * to digits-only so users can paste them with or without dashes.
 */
export async function getAdsAuth(repoRoot: string): Promise<GoogleAdsAuth | null> {
  if (!adsConfigured(repoRoot)) return null;
  if (cachedAuth && cachedAuth.expiresAt > Date.now() + 60_000) {
    return cachedAuth;
  }

  const credentials = loadGoogleCredentials(repoRoot);
  if (!credentials) return null;

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [ADS_SCOPE],
  });
  const client = await auth.getClient();
  const tokenResp = await client.getAccessToken();
  if (!tokenResp.token) {
    throw new Error('Google Ads auth: failed to mint an access token');
  }

  const stripDashes = (s: string | undefined): string =>
    String(s ?? '').replace(/\D/g, '');

  cachedAuth = {
    accessToken: tokenResp.token,
    expiresAt: Date.now() + 50 * 60_000,
    customerId: stripDashes(process.env.GOOGLE_ADS_CUSTOMER_ID),
    loginCustomerId: stripDashes(process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID),
    devToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? '',
  };
  return cachedAuth;
}

/**
 * Headers Google Ads expects on every REST call. Pulled out so engine
 * implementations don't need to know the wire format.
 */
export function adsHeaders(auth: GoogleAdsAuth): Record<string, string> {
  return {
    Authorization: `Bearer ${auth.accessToken}`,
    'developer-token': auth.devToken,
    'login-customer-id': auth.loginCustomerId,
    'Content-Type': 'application/json',
  };
}

/**
 * Build a GoogleAuth instance for non-Ads APIs (GSC, GA4). Each caller
 * passes its own scope list.
 */
export function buildGoogleAuth(
  credentials: GoogleServiceAccountCredentials,
  scopes: string[],
): InstanceType<typeof google.auth.GoogleAuth> {
  return new google.auth.GoogleAuth({ credentials, scopes });
}

/** Reset the cached token. Used by tests; not exported via the public API. */
export function _resetAdsAuthCache(): void {
  cachedAuth = null;
}
