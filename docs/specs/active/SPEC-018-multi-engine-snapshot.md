---
id: SPEC-018
title: 'Wire Bing and GA4 into the SEO snapshot script'
status: ready
created: 2026-05-11
author: Anthony Coffey
reviewers: []
affected_repos: [coffey.codes]
---

## Reviewer Notes

<!-- Leave empty until code review. When requesting changes, reviewer adds feedback here: -->

---

# Feature: Wire Bing and GA4 into the SEO snapshot script

## Problem

`scripts/seo-snapshot.mjs` (shipped under SPEC-016) pulls Google Search Console data via a service-account-authed `googleapis` client. The quarterly audits (SPEC-015 Q2, SPEC-016 Q3) draw on three engines: GSC, Bing Webmaster Tools, and GA4. Two-thirds of the audit's data sources have to be assembled by hand from the `search-console-mcp` plugin in a Claude session because the snapshot script doesn't cover them. That works for quarterly cadence; it breaks for weekly snapshots or CI automation.

This spec adds Bing and GA4 to the snapshot script so the JSON file written to `docs/strategy/data/` is a self-contained record of all three engines for the audit window. The next quarterly delta (target 2026-08-10) becomes a diff of two JSON files rather than a fresh manual MCP pull.

A secondary motivation: the audits surfaced two unresolved questions that automated snapshots would help answer over time. (1) Whether `bing_analytics_query` returning empty is an account-side issue or an MCP-side issue; a separate Bing API path in the script tests the account-side directly. (2) Whether GA4's bot-region contamination (China + Singapore) is stable or growing; weekly snapshots would expose the trend.

## Requirements

### Must have

1. WHEN `scripts/seo-snapshot.mjs` runs with valid credentials configured for all three engines, the output JSON SHALL include three top-level keys (`gsc`, `bing`, `ga4`) each containing the engine-specific data described in Design below.
2. WHEN credentials for an engine are missing or invalid, the script SHALL skip that engine, emit a clear warning to stderr, and continue with the other engines (it does not fail-fast on one engine's auth gap).
3. WHEN the script writes the output JSON, the top-level structure (window, pulledAt, siteUrl, totals) SHALL stay backwards-compatible with the existing single-engine snapshot consumers. Bing and GA4 data goes into new nested keys; existing GSC consumers continue reading `topPages`, `topQueries`, etc. as before.
4. WHEN any of the three engines is configured but returns empty data (e.g. Bing's current state), the script SHALL record the empty state explicitly in the output (`"bing": { "topQueries": [], "topPages": [], "_note": "empty response" }`) rather than omit the key.
5. WHEN GA4 data is captured, the script SHALL include both raw totals AND a bot-region-excluded subset, so future analysis can compare "with vs without contamination" without re-pulling. The bot-region exclusion list is hard-coded as `['China', 'Singapore']` per the audit; if the list needs to change, it changes in code (small enough that env-var parameterization is over-engineering).
6. WHEN GA4 data is captured, the date window SHALL be the same 365 days as GSC. Audit doc inconsistency (the Q2 audit used 180 days for GA4 sections) is acceptable because the snapshot's job is the data substrate, not the audit narrative.
7. WHEN `scripts/seo-snapshot-diff.mjs` is invoked with two snapshot file paths, it SHALL print the delta in totals, top pages by clicks, top queries by impressions, and flag new entrants and fallers (>30% impression drop) for each engine.

### Nice to have

- A `--engines` CLI flag (`--engines=gsc,bing` or `--engines=ga4`) to skip engines on demand without unsetting env vars.
- A `--dry-run` flag that prints what would be pulled without actually calling the APIs (useful for debugging the window calculation).

### Non-goals (what this does NOT do)

- This spec does NOT change the audit doc workflow. The `docs/strategy/seo-audit-YYYY-QN.md` files are still hand-written narratives; the snapshot is the data substrate, not the audit.
- This spec does NOT add real-time analytics (GA4 realtime, live keyword tracking). Snapshots are point-in-time historical pulls.
- This spec does NOT set up the GitHub Actions cron for weekly automation. That can be a follow-up spec once the engine wiring lands.
- This spec does NOT replace the `search-console-mcp` plugin. The MCP is still useful for ad-hoc Claude-session queries; the snapshot script is for automated/repeatable pulls.

## Design

### Auth surfaces (three engines, three patterns)

Each engine has its own auth model. The script handles all three with a consistent "configured/not configured → run/skip" pattern.

#### GSC (already done in SPEC-016)

- **Mechanism**: Google Cloud service account with read access to the GSC property.
- **Env vars**: `GSC_SERVICE_ACCOUNT_KEY_PATH` (filesystem path) or `GSC_SERVICE_ACCOUNT_JSON` (inline JSON).
- **No change needed.**

#### GA4

- **Mechanism**: same service account as GSC, with the GA4 Data API enabled in the Cloud project and the service account granted Viewer access in the GA4 property's admin (Property Access Management → Add user → paste the service account email → grant Viewer).
- **New env var**: `GA4_PROPERTY_ID` (numeric ID, currently `416080229` per the audit). If absent, skip GA4.
- **Credentials**: reuse the GSC service account JSON. No second key file needed.
- **API client**: `@google-analytics/data` (new npm dep). Authenticates the same way as `googleapis`.

#### Bing

- **Mechanism**: Bing Webmaster Tools API key, generated via the [Bing Webmaster Tools UI → Settings → API Access → Generate](https://www.bing.com/webmasters/aboutapi). Simple API key auth, not OAuth (despite the user-facing "OAuth" naming the user used; Bing's actual public API surface for Webmaster Tools is API-key-based as of 2026). If Microsoft has migrated to OAuth in the meantime, the script will need an Azure AD app registration with `webmaster.read` scope; the env var pattern is the same.
- **New env var**: `BING_WEBMASTER_API_KEY`. If absent, skip Bing.
- **API client**: direct `fetch` calls to `https://ssl.bing.com/webmaster/api.svc/json/`. No npm dep needed.
- **Site URL**: existing GSC site URL conversion: `sc-domain:coffey.codes` → `https://coffey.codes/` (Bing requires the full URL form).

### Snapshot shape (post-spec)

```jsonc
{
  "window": { "startDate": "...", "endDate": "...", "days": 365 },
  "pulledAt": "...",
  "siteUrl": "sc-domain:coffey.codes",

  // Existing top-level (kept for backwards compat with current consumers)
  "totals": { ... },
  "topPages": [ ... ],
  "topQueries": [ ... ],
  "countries": [ ... ],
  "devices": [ ... ],

  // New: nested by engine
  "gsc": {
    // Duplicates the top-level for explicitness; future versions can
    // drop the duplication when consumers migrate.
    "totals": { ... }, "topPages": [ ... ], ...
  },
  "bing": {
    "topPages": [ ... ],
    "topQueries": [ ... ],
    "totals": { ... },
    "_note": "empty response" | undefined
  },
  "ga4": {
    "trafficSources": [ ... ],
    "organicLandingPages": [ ... ],
    "userBehavior": { "devices": [...], "countries": [...], "engagement": {...} },
    "trafficSourcesExBotRegions": [ ... ],
    "userBehaviorExBotRegions": { ... },
    "keyEvents": { "form_submit": <count>, "file_download": <count> }
  }
}
```

### Skipping engines gracefully

Per must-have #2, the script must not fail when one engine is unconfigured. Pattern:

```js
const engines = [];
if (gscConfigured()) engines.push(['gsc', pullGsc]);
if (gaConfigured())  engines.push(['ga4', pullGa4]);
if (bingConfigured()) engines.push(['bing', pullBing]);

if (engines.length === 0) {
  throw new Error('No engines configured. Set at least one of ...');
}

const results = await Promise.allSettled(
  engines.map(([name, fn]) => fn(window).then((data) => [name, data])),
);
for (const r of results) {
  if (r.status === 'rejected') {
    console.error(`[snapshot] engine pull failed: ${r.reason}`);
    // engine omitted from output
  }
}
```

### GA4 bot-region exclusion

The audit identified China + Singapore as bot-skewed regions. The script captures both raw and filtered views. The list is hard-coded; if it ever needs to change, the constant lives at the top of `pullGa4`:

```js
const BOT_REGIONS = ['China', 'Singapore'];
```

```js
// Raw: all sessions
const trafficSources = await ga4.runReport({ ... });

// Filtered: same query with a dimensionFilter excluding country
const trafficSourcesExBotRegions = await ga4.runReport({
  ...,
  dimensionFilter: {
    notExpression: {
      filter: {
        fieldName: 'country',
        inListFilter: { values: BOT_REGIONS },
      },
    },
  },
});
```

Future analysis compares the two without a second API call.

### CLI flags

Optional but lightweight, only for `seo-snapshot.mjs`:

- `--engines=gsc,bing,ga4` (default: all configured)
- `--window=180` (default: 365)
- `--dry-run` (default: false)

### `seo-snapshot-diff.mjs` companion script

A second script under `scripts/` that takes two snapshot file paths and prints the delta. No auth needed; reads JSON only.

```
node scripts/seo-snapshot-diff.mjs <older.json> <newer.json>
```

Output shape (one section per engine present in both files):

```
GSC delta (window: 365 days, older 2026-05-04 -> newer 2026-05-11)

Totals
  clicks       1,145 -> 1,152    (+7)
  impressions  292,310 -> 294,996  (+2,686)
  ctr          0.39% -> 0.39%    (flat)

Top pages (clicks delta)
  +5  /articles/building-location-based-features-using-expo-location
  +2  /articles/vibe-coding-building-an-app-entirely-with-ai-prompts

Top queries: new entrants
  "react three fiber portfolio"   8 impressions, position 12.3

Top queries: fallers (>30% impression drop)
  (none)
```

Diff logic:
- Match rows across snapshots by the row's `keys[0]` (page URL, query string, country, device).
- "New entrants": rows present in newer, absent in older, with impressions >= 5.
- "Fallers": rows where `newer.impressions / older.impressions < 0.7` AND `older.impressions >= 10` (the threshold filters out single-impression noise).
- If an engine is missing from one of the two snapshots, that section is skipped with a one-line note.

Implementation: pure JSON manipulation, no SDK dependencies. Should be ~80-120 lines.

## Edge cases

- [ ] If the service account doesn't have GA4 Viewer permission, the script logs the error and continues without GA4 data. Don't fail.
- [ ] If `BING_WEBMASTER_API_KEY` is invalid (Bing returns 401), the script logs and continues without Bing. Don't fail.
- [ ] If Bing returns empty (current state per Q3 audit), the script writes `bing.topQueries: []` and `bing._note: "empty response"`. The Q4 audit (2026-08-10+) can compare this snapshot to a future one to see if data started flowing.
- [ ] GA4 has a query quota (10,000 tokens/day). Each `runReport` call is ~5 tokens. The script's calls (~6 reports) are nowhere near the limit, but if the user wires CI to run hourly, that changes; flag in the script header.
- [ ] The bot-region exclusion list (China + Singapore) is hard-coded for now. If the audit identifies new bot regions, the list needs updating. Could be parameterized but feels like over-engineering for a list of two.
- [ ] If `GA4_PROPERTY_ID` doesn't match the property the service account has access to, GA4 returns a 403. Surface that error clearly.

## Acceptance criteria

1. `node scripts/seo-snapshot.mjs` with all three engines configured produces a JSON file at `docs/strategy/data/snapshot-<YYYY-MM-DD>.json` containing `gsc`, `bing`, and `ga4` top-level keys.
2. `node scripts/seo-snapshot.mjs` with ONLY `GSC_SERVICE_ACCOUNT_KEY_PATH` set produces a snapshot identical in shape to the current SPEC-016 output (no `bing` or `ga4` keys), with a stderr warning for each skipped engine.
3. The output's `ga4.trafficSources` and `ga4.trafficSourcesExBotRegions` differ in exactly the China + Singapore rows.
4. If Bing's API returns empty (current state), `bing.topQueries === []` and `bing._note === "empty response"`.
5. Running the script twice within the same 24h window produces two snapshot files with different `pulledAt` timestamps but identical data totals (modulo new fresh data).
6. The script continues to lint clean (`npm run lint`) and pass `node -c` syntax check.
7. Adding `@google-analytics/data` as a dependency does NOT pull in any new peer dependencies that conflict with existing ones (verified via `npm ls` after install).

## Constraints

- One new dependency: `@google-analytics/data`. Bing uses native `fetch` (no SDK needed).
- The script remains a single `.mjs` file under `scripts/`. No build step, no transpile.
- Service account JSON stays gitignored via the existing `.env*` pattern. The new `BING_WEBMASTER_API_KEY` env var also stays in `.env`/`.env.local`.
- The snapshot JSON files in `docs/strategy/data/` continue to be safe-to-commit (no credentials in the output).
- Voice rules apply to any new script comments and the optional `_note` strings.

## Tasks

- [ ] Install `@google-analytics/data` (`npm install --save @google-analytics/data`)
- [ ] In Google Cloud Console, enable the **Google Analytics Data API** for the same project that has the Search Console API.
- [ ] In GA4 property `416080229` → Property Access Management, grant the service account Viewer access.
- [ ] In Bing Webmaster Tools → Settings → API Access, generate an API key. Add to `.env` as `BING_WEBMASTER_API_KEY=<key>`.
- [ ] Refactor `scripts/seo-snapshot.mjs` into three engine modules (`pullGsc`, `pullGa4`, `pullBing`) plus the orchestrator that does `Promise.allSettled` per must-have #2.
- [ ] Implement `pullGa4` using `@google-analytics/data`'s `BetaAnalyticsDataClient`. Reports to capture: traffic sources, organic landing pages, user behavior, plus bot-region-excluded variants.
- [ ] Implement `pullBing` using native `fetch` against `https://ssl.bing.com/webmaster/api.svc/json/GetRankAndTrafficStats` and `GetQueryStats`. Handle empty responses per must-have #4.
- [ ] Extend `loadCredentials()` to handle GA4 (reuse GSC service account) and Bing (separate API key env var).
- [ ] Update the script header comment with all three engines' setup steps.
- [ ] Add `--engines` and `--dry-run` CLI flags (nice-to-have).
- [ ] Test end-to-end against the live property; verify the JSON shape matches the Design section.
- [ ] Write `scripts/seo-snapshot-diff.mjs` per the spec's diff-logic section.
- [ ] Document the auth setup in the agent brief or a small `docs/documentation/guides/seo-snapshot-setup.md` so future contributors don't have to spelunk through the script header.

## Notes

- **Related specs**:
  - SPEC-015 (audit, complete + archived): the data shape and engine list this script mirrors.
  - SPEC-016 (SEO strategy, complete + archived): shipped the GSC half of the snapshot script. This spec extends it.
- **Bing diagnostic context**: as of 2026-05-11, `bing_analytics_query` via the search-console MCP returns empty data despite the property being verified and 114 bing/organic sessions in GA4. This spec's direct Bing API path tests whether the MCP was the issue. If the direct API ALSO returns empty, the diagnosis shifts to Bing Webmaster Tools having genuinely no traffic data for the property. If the direct API returns data, the MCP is broken.
- **Why not pull all engines from the MCP**: the MCP is a Claude-session-only surface. It doesn't run in CI or from cron. The snapshot script is meant to run unattended.
- **Why not OAuth for Bing**: Bing's Webmaster Tools public API uses an API key, not OAuth, as of 2026. If they migrate to OAuth later, switch to an Azure AD app registration; the script's env-var pattern accommodates either.
- **Where Bing OAuth WOULD apply**: the Microsoft Graph API (which covers some Microsoft search products) does use OAuth. If a future spec wants to pull from there, that's a different auth setup; not in scope for this spec.
- **Auth security**: the service account and Bing API key are both long-lived credentials. If either is leaked, rotate immediately via the respective admin UI. The `.env*` gitignore convention is the line of defense.

## Open questions resolved (2026-05-11)

1. **Bot-region list**: hard-coded `['China', 'Singapore']` in `pullGa4`. Git is sufficient version control for a two-item list.
2. **GA4 window**: 365 days (matches GSC). Snapshot is the data substrate; the audit doc can window differently when it writes the narrative.
3. **Diff script**: in scope for this spec. Spec'd in Design > `seo-snapshot-diff.mjs` companion section; added as must-have #7.
