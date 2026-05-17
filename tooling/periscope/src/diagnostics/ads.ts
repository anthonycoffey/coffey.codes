/**
 * Google Ads diagnostic.
 *
 * Mints the same JWT the keywords engine mints, then calls
 * `listAccessibleCustomers` (the cheapest probe -- does not need
 * `login-customer-id`) and reports which customer IDs the service
 * account can see. Compares against `GOOGLE_ADS_CUSTOMER_ID` and
 * `GOOGLE_ADS_LOGIN_CUSTOMER_ID` and names the gap.
 *
 * Never prints the developer token, access token, or private key.
 * Prints `client_email` and customer IDs (not secret).
 */

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { google } from 'googleapis';

import {
  type Check,
  type DiagnosticReport,
  overallStatus,
} from '../lib/diagnostics.js';

const API_VERSION = 'v21';
const ADS_SCOPE = 'https://www.googleapis.com/auth/adwords';

interface ServiceAccountKey {
  client_email: string;
  project_id?: string;
  private_key: string;
}

const stripDashes = (s: string | undefined): string =>
  String(s ?? '').replace(/\D/g, '');

function loadCredentials(repoRoot: string): {
  source: string;
  credentials: ServiceAccountKey;
} {
  const keyPath = process.env.GSC_SERVICE_ACCOUNT_KEY_PATH;
  const inline = process.env.GSC_SERVICE_ACCOUNT_JSON;
  if (keyPath) {
    const resolved = path.isAbsolute(keyPath)
      ? keyPath
      : path.resolve(repoRoot, keyPath);
    if (!existsSync(resolved)) {
      throw new Error(
        `GSC_SERVICE_ACCOUNT_KEY_PATH points to a missing file: ${resolved}`,
      );
    }
    return {
      source: `GSC_SERVICE_ACCOUNT_KEY_PATH=${keyPath}`,
      credentials: JSON.parse(readFileSync(resolved, 'utf-8')) as ServiceAccountKey,
    };
  }
  if (inline) {
    return {
      source: 'GSC_SERVICE_ACCOUNT_JSON (inline)',
      credentials: JSON.parse(inline) as ServiceAccountKey,
    };
  }
  throw new Error(
    'Neither GSC_SERVICE_ACCOUNT_KEY_PATH nor GSC_SERVICE_ACCOUNT_JSON is set.',
  );
}

export async function diagnoseAds(
  repoRoot: string = process.cwd(),
): Promise<DiagnosticReport> {
  const checks: Check[] = [];

  // ── 1. Load credentials ──────────────────────────────────────────────
  let credentials: ServiceAccountKey;
  let credSource: string;
  try {
    const loaded = loadCredentials(repoRoot);
    credentials = loaded.credentials;
    credSource = loaded.source;
    checks.push({
      name: 'Service account loaded',
      status: 'ok',
      detail: `${credentials.client_email} (project: ${credentials.project_id ?? 'unknown'}; via ${credSource})`,
    });
  } catch (err) {
    checks.push({
      name: 'Service account credentials',
      status: 'fail',
      detail: err instanceof Error ? err.message : String(err),
    });
    return { engine: 'keywords', status: 'fail', checks };
  }

  // ── 2. Required env vars ─────────────────────────────────────────────
  const targetId = stripDashes(process.env.GOOGLE_ADS_CUSTOMER_ID);
  const loginId = stripDashes(process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID);
  const devToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? '';

  const missing: string[] = [];
  if (!targetId) missing.push('GOOGLE_ADS_CUSTOMER_ID');
  if (!loginId) missing.push('GOOGLE_ADS_LOGIN_CUSTOMER_ID');
  if (!devToken) missing.push('GOOGLE_ADS_DEVELOPER_TOKEN');
  if (missing.length > 0) {
    checks.push({
      name: 'Required Ads env vars',
      status: 'fail',
      detail: `Missing: ${missing.join(', ')}`,
    });
    return { engine: 'keywords', status: 'fail', checks };
  }
  checks.push({
    name: 'Required Ads env vars',
    status: 'ok',
    detail: `CUSTOMER_ID=${targetId}, LOGIN_CUSTOMER_ID=${loginId}, DEVELOPER_TOKEN=(set, ${devToken.length} chars)`,
  });

  // ── 3. Mint an access token ──────────────────────────────────────────
  let accessToken: string;
  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: [ADS_SCOPE],
    });
    const client = await auth.getClient();
    const tokenResp = await client.getAccessToken();
    if (!tokenResp.token) {
      checks.push({
        name: 'Access token mint',
        status: 'fail',
        detail: 'Service account JWT did not mint an access token.',
      });
      return { engine: 'keywords', status: 'fail', checks };
    }
    accessToken = tokenResp.token;
    checks.push({
      name: 'Access token mint',
      status: 'ok',
      detail: `Token length: ${accessToken.length} chars`,
    });
  } catch (err) {
    checks.push({
      name: 'Access token mint',
      status: 'fail',
      detail: err instanceof Error ? err.message : String(err),
    });
    return { engine: 'keywords', status: 'fail', checks };
  }

  // ── 4. listAccessibleCustomers ───────────────────────────────────────
  let ids: string[] = [];
  try {
    const resp = await fetch(
      `https://googleads.googleapis.com/${API_VERSION}/customers:listAccessibleCustomers`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'developer-token': devToken,
        },
      },
    );
    const text = await resp.text();
    if (!resp.ok) {
      checks.push({
        name: 'listAccessibleCustomers',
        status: 'fail',
        detail: `HTTP ${resp.status} ${resp.statusText}: ${text.slice(0, 300)}`,
      });
      return {
        engine: 'keywords',
        status: 'fail',
        checks,
        notes: [
          '401 - token rejected; service account key may have been rotated.',
          '403 DEVELOPER_TOKEN_NOT_APPROVED - developer token not approved yet.',
          '403 PERMISSION_DENIED - service account not added to ANY Ads account this token can see.',
        ],
      };
    }
    const data = JSON.parse(text) as { resourceNames?: string[] };
    ids = (data.resourceNames ?? []).map((n) =>
      String(n).replace(/^customers\//, ''),
    );
    if (ids.length === 0) {
      checks.push({
        name: 'listAccessibleCustomers',
        status: 'warn',
        detail: `Service account ${credentials.client_email} has access to ZERO Ads customers. Add it as a user in the Ads UI.`,
      });
    } else {
      checks.push({
        name: 'listAccessibleCustomers',
        status: 'ok',
        detail: `Accessible customers: ${ids.join(', ')}`,
      });
    }
  } catch (err) {
    checks.push({
      name: 'listAccessibleCustomers',
      status: 'fail',
      detail: err instanceof Error ? err.message : String(err),
    });
    return { engine: 'keywords', status: 'fail', checks };
  }

  // ── 5. Cross-check the configured IDs ────────────────────────────────
  const targetOk = ids.includes(targetId);
  const loginOk = ids.includes(loginId);
  checks.push({
    name: `GOOGLE_ADS_CUSTOMER_ID=${targetId}`,
    status: targetOk ? 'ok' : 'fail',
    detail: targetOk ? 'in accessible list' : 'NOT in accessible list',
  });
  checks.push({
    name: `GOOGLE_ADS_LOGIN_CUSTOMER_ID=${loginId}`,
    status: loginOk ? 'ok' : 'fail',
    detail: loginOk ? 'in accessible list' : 'NOT in accessible list',
  });

  const notes: string[] = [];
  if (!targetOk || !loginOk) {
    notes.push(
      `Options: (1) update .env to use an accessible ID; (2) add ${credentials.client_email} as a user on the missing customer(s) in the Google Ads UI.`,
    );
  } else if (targetId !== loginId) {
    notes.push(
      'CUSTOMER_ID differs from LOGIN_CUSTOMER_ID. Correct only if LOGIN_CUSTOMER_ID is a Manager account and CUSTOMER_ID is a child it manages.',
    );
  }

  return {
    engine: 'keywords',
    status: overallStatus(checks),
    checks,
    notes: notes.length > 0 ? notes : undefined,
  };
}
