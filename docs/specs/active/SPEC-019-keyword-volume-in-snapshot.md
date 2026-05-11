---
id: SPEC-019
title: 'Add Google Ads keyword volume context to the SEO snapshot'
status: review-pending
created: 2026-05-11
author: Anthony Coffey
reviewers: []
affected_repos: [coffey.codes]
---

## Reviewer Notes

<!-- Leave empty until code review. When requesting changes, reviewer adds feedback here: -->

---

# Feature: Add Google Ads keyword volume context to the SEO snapshot

## Problem

`scripts/seo-snapshot.mjs` (SPEC-018) pulls Google Search Console, Google Analytics 4, and Bing Webmaster Tools. Each engine answers "what *did* happen": queries the site got impressions for, sessions GA4 recorded, the (currently empty) Bing performance picture.

None of these tell you what *could* happen. "We rank #7 for a term" is impossible to evaluate without knowing whether that term has 10 searches a month or 10,000 in the US, and whether competing for the top three spots looks affordable or impossible.

Google Ads' `KeywordPlanIdeaService` and `KeywordPlanHistoricalMetrics` return exactly that context: monthly volume (in buckets for accounts without spend history, precise integers once spend is meaningful) and competition (`LOW` / `MEDIUM` / `HIGH` plus a 0-100 index). The data is free at the basic API access tier. The service account that already authenticates GSC and GA4 was added as a user to the Google Ads account on 2026-05-11, so the auth surface is in place.

This spec adds a fourth engine to the snapshot orchestrator that decorates every GSC top-query row with its Ads-side volume + competition. The diff script picks it up automatically as additional row fields.

## Requirements

### Must have

1. WHEN `scripts/seo-snapshot.mjs` runs with valid Google Ads credentials configured, the output JSON SHALL contain a top-level `keywords` key with `historicalMetrics: [...]` and `ideas: [...]`, each row carrying at minimum the keyword text, monthly volume (bucket *or* integer), competition enum, competition index, and top-of-page CPC range.
2. WHEN GSC data is present in the same snapshot, each row in `gsc.topQueries` SHALL be enriched in-place with `volumeBucket`, `competition`, `competitionIndex`, and `cpcRangeMicros` fields keyed by the query text (using a left join; queries with no Ads-side data keep their existing shape and gain a `_keywordsMatch: false` flag).
3. WHEN Google Ads credentials are missing or invalid, the script SHALL skip the keywords engine, emit a clear warning to stderr, and continue with the other engines (the existing `Promise.allSettled` pattern from SPEC-018).
4. WHEN the keywords engine runs, it SHALL be controllable via the same `--engines=...` flag as the other three engines (e.g. `--engines=gsc,keywords` to pull only those two).
5. WHEN the snapshot is written, the keyword-augmented GSC rows SHALL stay backwards-compatible with `seo-snapshot-diff.mjs` (extra fields are non-breaking; the diff script's match-by-key logic still works).
6. WHEN the Google Ads developer-token rate limit is hit (15,000 ops/day at basic access), the script SHALL surface the API's error message in stderr and continue with whatever data it managed to fetch (partial success is preferable to zero data).

### Nice to have

- A `--keyword-seeds=...` CLI flag that lets the user pass extra seed terms (the default seeds are derived from GSC top queries + article categories).
- Output a separate `keywordIdeas` array of keyword *suggestions* (queries the site does NOT currently rank for, but Ads suggests as related). This is the input the SPEC-020 tools will work from.
- `--geo` flag for non-US geo targeting (default: US). Geo target constants come from `GeoTargetConstantService`.

### Non-goals (what this does NOT do)

- This spec does NOT change the audit doc workflow. The `docs/strategy/seo-audit-YYYY-QN.md` files are still hand-written narratives; the snapshot is the data substrate.
- This spec does NOT build the article keyword auditor, LP target validator, competitor URL probe, or topic discovery tools. Those are scoped to SPEC-020 and depend on this puller.
- This spec does NOT migrate to Google Ads' production-access developer token tier (which would unlock higher rate limits but takes a ~1-2 week application approval). Basic access is sufficient for the 15K ops/day this workflow needs.
- This spec does NOT capture audience or demographic data. Keyword Planner is the entire scope.

## Design

### Auth (4th engine)

Google Ads' API has three layered auth requirements; the existing snapshot script can absorb all three with one new env var plus a header.

1. **Developer token**: a string obtained from the Google Ads account at **Tools → API Center → Developer token**. Free to generate, starts at basic access (15K ops/day). Set as `GOOGLE_ADS_DEVELOPER_TOKEN`.
2. **OAuth 2.0**: the service account already in the snapshot script works. Google Ads requires the service account email to be added as a user inside the Google Ads account (done 2026-05-11) AND requires the request to specify `login-customer-id` if the account is under a manager account (MCC).
3. **Login customer ID**: the 10-digit account ID that the request is "logging in as." Set as `GOOGLE_ADS_LOGIN_CUSTOMER_ID` (string of digits, no dashes). For direct-user access (not MCC), this matches the customer ID being queried.
4. **Customer ID**: the 10-digit ID of the actual ad account to query. Set as `GOOGLE_ADS_CUSTOMER_ID`. May equal `GOOGLE_ADS_LOGIN_CUSTOMER_ID` for non-MCC setups.

If any of these three env vars is missing, the keywords engine is skipped per must-have #3.

### Library choice

Use the `google-ads-api` npm package (community-maintained, well-typed, MIT). Official alternative `google-ads-api-node` is significantly heavier and brings transitive deps that conflict with `@google-analytics/data`. The community client wraps the gRPC API and supports service-account auth via the existing JSON key file.

```js
import { GoogleAdsApi } from 'google-ads-api';

const client = new GoogleAdsApi({
  client_id: 'unused-with-service-account',
  client_secret: 'unused',
  developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
});
const customer = client.Customer({
  customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID,
  login_customer_id: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID,
  // Service account auth via JWT:
  refresh_token: 'unused-with-service-account',
});
```

The service-account JWT flow specifically may need a custom auth subclass; if `google-ads-api` doesn't ship one natively, fall back to direct REST calls against `https://googleads.googleapis.com/v17/customers/{customer_id}:generateKeywordIdeas` with a bearer token minted from the service account JWT. The script header will document whichever path lands.

### Data shape (snapshot output)

```jsonc
{
  // ... existing gsc, ga4, bing keys ...

  "keywords": {
    "window": { "startDate": "...", "endDate": "...", "days": 365 },
    "geo": "US",
    "language": "en",
    "historicalMetrics": [
      {
        "keyword": "vibe coding flutter",
        "volumeBucket": "1K-10K",       // or precise integer in spend accounts
        "volumeAvgMonthly": null,       // populated in spend accounts
        "competition": "LOW",
        "competitionIndex": 12,
        "cpcLowMicros": 320000,
        "cpcHighMicros": 1850000,
        "monthlySearchVolumes": [/* 12 months trailing */]
      }
    ],
    "ideas": [
      {
        "keyword": "vibe coding tutorial",
        "volumeBucket": "100-1K",
        "competition": "LOW",
        "competitionIndex": 8,
        "_source": "expanded-from-seed"
      }
    ]
  },

  // Enrichment of GSC rows happens IN PLACE:
  "gsc": {
    "topQueries": [
      {
        "keys": ["vibe coding flutter"],
        "clicks": 49,
        "impressions": 1088,
        "ctr": 0.045,
        "position": 7.8,
        // Added by the keywords engine left-join:
        "volumeBucket": "1K-10K",
        "competition": "LOW",
        "competitionIndex": 12,
        "cpcRangeMicros": [320000, 1850000]
      },
      {
        "keys": ["expo-location"],
        // GSC fields...
        "_keywordsMatch": false   // Ads had no row for this query
      }
    ]
  }
}
```

### Seed strategy

Keyword Planner takes either **seed keywords** or a **seed URL** (one or the other per request). For the snapshot:

1. Pull GSC top 50 queries (already in `snapshot.gsc.topQueries`).
2. Pull article categories from `app/articles/posts/*.mdx` frontmatter (covered by `getAllCategories()` in `app/articles/utils.ts`).
3. Use seeds = top 25 GSC queries + the 6 article categories.
4. Single batch request via `KeywordPlanIdeaService.generateKeywordIdeas`.
5. Then enrich the GSC topQueries with `KeywordPlanHistoricalMetrics` for the queries themselves (a second call so the volumes attach to the queries the site already cares about, not just adjacent ideas).

Two requests per snapshot keeps the op count well under the 15K/day budget.

### Volume bucket vs integer

For accounts without spend history, `GenerateKeywordIdeasResponse` returns `KeywordPlanHistoricalMetrics.avg_monthly_searches = null` and instead `monthly_search_volumes` is bucketed. The puller normalizes: if the integer is null, derive a bucket label (`"100-1K"`, `"1K-10K"`, etc.) from the response's range fields and store as `volumeBucket`. If the integer is present, store it as `volumeAvgMonthly` AND derive the bucket for consistency.

### Skip behavior (must-have #3)

```js
if (shouldRun('keywords')) {
  if (googleAdsConfigured()) {
    planned.push(['keywords', () => pullKeywords({ ... })]);
  } else {
    console.warn('[snapshot] keywords: skipped (Google Ads env vars not set)');
  }
}
```

Matches the existing pattern in `scripts/seo-snapshot.mjs`.

## Edge cases

- [ ] **Service-account JWT auth not supported by `google-ads-api`**: fall back to direct REST against the v17 endpoint. The library swap is local to `pullKeywords`; the rest of the snapshot orchestrator doesn't notice.
- [ ] **GSC query has no Ads match**: enrich with `_keywordsMatch: false`; do NOT delete the row.
- [ ] **Ads call exceeds rate limit mid-batch**: catch the partial response, write what we got, log the error. Better than fail-closed.
- [ ] **Special characters in query strings** (quotes, unicode): URL-encode at the boundary; the existing snapshot data already handles unicode in GSC rows.
- [ ] **Same query appears multiple times in GSC** (with different positions over the year): GSC's `dimensions: [query]` already deduplicates. The Ads enrichment joins on the deduplicated key.
- [ ] **Account moved to manager/MCC after this spec ships**: if the snapshot starts failing with "missing login-customer-id," update env var and document in the guide.

## Acceptance criteria

1. `node scripts/seo-snapshot.mjs --dry-run` prints `keywords` in the list of planned engines when all three env vars are set.
2. A real snapshot run produces a JSON file at `docs/strategy/data/snapshot-<date>.json` with a top-level `keywords` key AND enriched GSC `topQueries` rows.
3. The snapshot's GSC topQueries that have Ads matches gain `volumeBucket` and `competition` fields; non-matching rows gain `_keywordsMatch: false`.
4. `node scripts/seo-snapshot-diff.mjs <older> <newer>` still works against the new snapshots without modification.
5. The script continues to lint clean (`npm run lint`) and pass `node -c` syntax check.
6. Setting only `GOOGLE_ADS_DEVELOPER_TOKEN` (the other two missing) produces a clean stderr warning and continues with the other engines.
7. Setting all three env vars but pointing at a customer ID the service account doesn't have access to produces a clear error message naming the customer ID and continues with the other engines.

## Constraints

- One new npm dep: `google-ads-api` (or if it doesn't work for service-account auth, zero new deps and direct `fetch`).
- The script stays a single `.mjs` file under `scripts/`. No build step.
- The four new env vars stay in `.env`/`.env.local` and out of git.
- Voice rules apply to script comments and any user-facing error strings.
- The Google Ads developer token, like every other long-lived credential, is rotatable through the Ads UI if leaked.

## Tasks

- [ ] In the Google Ads UI, generate a developer token at Tools → API Center. Confirm basic access (free tier) is sufficient. *(user-side cloud config)*
- [x] Confirm the service account email is listed as a user on the Google Ads account.
- [ ] Note the 10-digit customer ID (and login-customer-id if applicable; same value for direct-access accounts). *(user-side cloud config)*
- [ ] Add to `.env`: `GOOGLE_ADS_DEVELOPER_TOKEN`, `GOOGLE_ADS_CUSTOMER_ID`, `GOOGLE_ADS_LOGIN_CUSTOMER_ID`. *(user-side)*
- [x] ~~Install `google-ads-api`~~ — decided against the dep. Direct REST against `googleads.googleapis.com/v17/` is simpler, removes a transitive-dep surface, and bypasses the gRPC client's service-account-auth limitations.
- [x] Implement `pullKeywords` in `scripts/seo-snapshot.mjs` per the Design section.
- [x] Add `keywords` to the orchestrator's `planned` array with the standard skip-on-missing pattern.
- [x] Implement the left-join enrichment of `snapshot.gsc.topQueries` after both engines complete.
- [x] Update the script header docs with the three new env vars and the developer-token URL.
- [x] Update `docs/documentation/guides/seo-snapshot-setup.md` with a Google Ads setup section.
- [ ] Run end-to-end against the live account; commit the resulting snapshot. *(blocked on user-side cloud config above)*
- [ ] Run `scripts/seo-snapshot-diff.mjs` against the previous (SPEC-018-only) snapshot and the new (SPEC-019) snapshot to confirm the diff script handles the new fields without breaking. *(blocked on above)*

## Notes

- **Why basic access is enough**: ~30 ops per snapshot × weekly cadence = ~120 ops/month. Far below the 15K/day cap.
- **Volume bucket precision**: even without spend, the buckets are useful for triage ("is this query 100s, 1000s, or 10000s a month?"). Precise integers would be nice but aren't a blocker.
- **Why not Ahrefs**: Ahrefs MCP requires the $129/mo plan and returns `Insufficient plan` on lower tiers. Google Ads at free tier gives 80% of what Ahrefs would give, for 0% of the cost.
- **Related specs**:
  - SPEC-018 (multi-engine snapshot, complete): the orchestrator this spec extends.
  - SPEC-020 (keyword research tools, planned): the four user-facing tools that consume this puller's output.
- **Service-account-vs-OAuth note**: Google's docs heavily push OAuth user-impersonation for Ads API access. Service account JWT works but is less documented. If we hit a wall, fall back to a one-time OAuth flow that emits a long-lived refresh token, and store that in `.env`. Less clean but pragmatic.

## Open questions

1. Does `google-ads-api` support service-account JWT auth out of the box, or does it need a custom auth subclass? (Verify in the implementation step; fall back to REST if not.)
2. Should `keywords.ideas` (the suggestions array, separate from enriched `gsc.topQueries`) be capped at top N by volume, or unfiltered? Lean toward top 100 by volume bucket descending; the SPEC-020 tools will re-filter for their own purposes anyway.
3. Should we record raw API responses to `docs/strategy/data/raw/` for debugging, or is the cleaned JSON enough? Lean toward "cleaned only" for now; add raw debug logging behind a `--debug` flag if needed.

## Live-test attempt (2026-05-11)

First end-to-end attempt with real credentials surfaced three issues that are now fixed in code:

1. **HTTP 404 / HTML response.** The initial `API_VERSION = 'v17'` was sunset; current is `v21`. Google deprecates Ads API versions roughly every 3 months. Bumped the constant.
2. **`INVALID_CUSTOMER_ID`.** The Ads UI displays customer IDs as `123-456-7890`; users were expected to strip the dashes when adding to `.env`. Now the script strips non-digit characters automatically on read so either form works.
3. **Snapshot overwrite on failure.** When `--engines=keywords` was the only engine and it failed, the orchestrator still wrote a scaffold-only snapshot file, clobbering the previously-committed three-engine snapshot. Now the orchestrator counts engines-with-data and exits nonzero without writing if zero. The committed snapshot is preserved.

After fixes, the call gets through auth + endpoint + ID validation and hits an Ads-side state issue: `CUSTOMER_NOT_ENABLED`. The Google Ads account has not completed billing setup (no payment method on file), so the API refuses to serve any data, including read-only Keyword Planner. This is a one-time UI action by the account owner (Tools → Billing → Summary; no actual charge incurred from Keyword Planner use). Documented in the setup guide's troubleshooting table.

There is also one user-side env-var correction outstanding: the developer token was generated inside a Google Ads Manager (MCC) account, but `.env` currently has `GOOGLE_ADS_LOGIN_CUSTOMER_ID` set to the same value as `GOOGLE_ADS_CUSTOMER_ID` (the child account). For MCC-issued tokens the `LOGIN_CUSTOMER_ID` should be the MCC's 10-digit ID instead. Setup guide updated to call this out.

**Code state:** ready. Once the Ads child account is billing-enabled AND `LOGIN_CUSTOMER_ID` in `.env` is corrected to the MCC's ID, the keywords engine should run without further changes. The Q4 audit will be the first to consume the data.
