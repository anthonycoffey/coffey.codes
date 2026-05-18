---
id: SPEC-024
title: 'Periscope GSC-first audit + Ads quota strategy + enterprise error handling'
status: complete
created: 2026-05-17
completed: 2026-05-18
author: Anthony Coffey
reviewers: []
affected_repos: [periscope, coffey.codes]
shipped_as:
  - 'periscope v1.2.0 (anthonycoffey/periscope#3)'
  - 'coffey.codes @anthonycoffey/periscope devDep bump'
carve_outs:
  - 'Multi-property config (must-have #9) → SPEC-029 (draft)'
---

## Reviewer Notes

<!-- Leave empty until code review. -->

---

# Feature: GSC-first audit, hardened Ads access, multi-property enterprise framing

## Problem

Live testing of `periscope audit articles` against coffey.codes' real Google Ads credentials revealed three structural problems and surfaced a strategic question.

**Structural problems:**

1. **The audit asks Ads the wrong question.** `audit-articles` seeds `KeywordPlanIdeaService` per article and infers a verdict from competition + volume buckets. That's a discovery question. The audit question is "for the queries this article *already ranks for*, is the targeting aligned with what the article is about?" — and that data is in Google Search Console, which we already pull and persist. The current command runs even when GSC data is present and ignores it for the verdict.
2. **Ads error reporting collapses every failure into "env vars not configured."** SPEC-024's predecessor work in 1.1.1 split off precondition errors from API errors, but every API error still surfaces as a flat `error.message` string. The recent live run produced `HTTP 403 (DEVELOPER_TOKEN_NOT_APPROVED)` and `HTTP 429 (RESOURCE_EXHAUSTED)` as opaque per-article failures with no actionable categorization — users see 20+ identical-looking failures and cannot tell whether to apply for access, wait for quota, switch accounts, or fix config.
3. **No quota management.** `audit-articles` fires one `generateKeywordIdeas` call per article in a tight loop (23 articles → 23 calls). `KeywordPlanIdeaService` accepts up to ~20 seeds per call; we are using ~1. There is no retry, no backoff, no respect for `Retry-After`, and no caching of ideas across runs. Even with approved access this will trip rate limits and burn quota.

**Strategic question raised:**

"Is this even worth $100/mo right now, or in the near future? What is missing?"

Honest answer: not yet. The current product is a personal-site SEO assistant. To clear an enterprise / multi-client / paid-private bar, the following are missing — and this SPEC closes most of them:

- Multi-property / multi-client config (currently one `siteUrl` per repo)
- GSC-driven analyses that an SEO consultant actually charges for: striking-distance queries, query cannibalization, title-vs-ranking-query drift, query-cluster gap maps
- Industry-agnostic data sources (the current keyword-discovery story leans on Ads, which is fine; Reddit/HN/LinkedIn were considered and rejected as too dev-niche)
- Enterprise-grade error UX: errors classify themselves and tell the operator what to do
- Polished onboarding — a new client can be wired up in under 15 minutes

## Requirements

### Must have

1. WHEN `periscope audit articles` runs and GSC data is present in the latest snapshot, it SHALL derive each article's verdict from GSC query data (real ranking queries, impressions, position, CTR) rather than from Ads `KeywordPlanIdeaService` ideas. Ads ideas SHALL remain available as an optional *enrichment* for articles with no GSC coverage (GHOST verdict).
2. WHEN an article ranks for queries that do not appear in its title, tags, or H1, the audit SHALL flag this as `TITLE_QUERY_DRIFT` with the specific divergent queries listed.
3. WHEN an article has any query in the "striking distance" band (position 4–15, impressions ≥ a configured threshold, CTR below the percentile for that position), the audit SHALL flag it as `STRIKING_DISTANCE` with the specific queries and their gap to top-3.
4. WHEN multiple articles rank for the same query above a configured impressions threshold, the audit SHALL emit a `CANNIBALIZATION` section listing the query and competing pages, ranked by which page Google currently prefers.
5. WHEN `generateKeywordIdeas` is called with N seeds where N > 1, the engine SHALL batch them into ≤20-seed Ads API calls (one paginated request per batch) instead of issuing one call per seed.
6. WHEN an Ads API call returns HTTP 429 with a `Retry-After` header, the engine SHALL wait the indicated duration and retry up to 3 times with full jitter exponential backoff capped at 60s.
7. WHEN an Ads API call fails, the caller SHALL classify the error using the structured `errorCode` already parsed by `parseAdsError` in [src/engines/ads.ts](D:/repos/periscope/src/engines/ads.ts) and emit a category-specific message. Required categories: `DEVELOPER_TOKEN_NOT_APPROVED`, `DEVELOPER_TOKEN_PROHIBITED`, `CUSTOMER_NOT_ENABLED`, `AUTHENTICATION_ERROR`, `AUTHORIZATION_ERROR`, `QUOTA_ERROR` / `RESOURCE_EXHAUSTED`, `INVALID_CUSTOMER_ID`, plus a generic fallback that still prints the structured `errorCode`.
8. WHEN a single Ads error category is hit ≥3 times in one command run, the command SHALL abort the loop, summarize the failure once, and exit with code 1 — not emit 23 identical failure lines.
9. The package SHALL support a multi-property config. A user SHALL be able to define multiple "properties" (siteUrl + GSC site + Ads customerId + outputDir) in `periscope.config.{ts,mjs}` and select one via `--property <name>`. The current single-property config SHALL continue to work as the default property.
10. Ads ideas SHALL be cached at snapshot time. The cache file (`<outputDir>/keyword-ideas-<asof>.json`) SHALL be written by `snapshot` and read by `audit articles`, `discover topics`, `validate lps`. A cache SHALL be considered fresh for ≤30 days; stale caches SHALL print a warning but still be used, and `--no-cache` SHALL force a re-fetch.
11. WHEN any command is invoked with `--explain`, it SHALL print, before running, exactly which API calls it will make (or read from cache), the property selected, and the expected request count. This is the readiness probe an operator runs before exposing the tool to a new client.
12. Documentation SHALL include a "Google Ads Basic Access application checklist" at `docs/documentation/guides/google-ads-basic-access.md` (in coffey.codes) covering: RMF compliance positioning, the periscope public README requirements, the privacy/ToS template, and the form field-by-field guidance.

### Nice to have

- Query-cluster topic gap map: cluster all GSC queries by token overlap, identify clusters with high aggregate impressions but no dedicated article. Output to `keyword-topic-gaps-<date>.md`.
- HTML report variant for client deliverables (Markdown stays canonical).
- `periscope onboard <property>` interactive setup that walks a new client through service-account add, customer-ID config, GSC property verification, and a smoke test.

### Non-goals (what this does NOT do)

- This spec does NOT add a paid keyword API fallback (DataForSEO, SerpAPI, Keywords Everywhere). User has chosen to commit to Google Ads.
- This spec does NOT add Reddit/HN/LinkedIn/StackOverflow signals (rejected as industry-niche).
- This spec does NOT change the snapshot file format in a breaking way — additions are additive.
- This spec does NOT cover Google Ads Basic Access submission itself (the *checklist* is in scope; pressing "submit" on the application is a human action tracked outside this SPEC).
- This spec does NOT change the package's open-source status. The product-positioning conversation (private/invite vs public/free) is recorded in Notes but no code/license change happens here.

## Design

### Audit pivot: GSC-first

`audit-articles` becomes a two-pass command:

**Pass 1 — GSC-driven verdicts.** For each article in `articles.dir`:

- Look up its slug in the latest snapshot's GSC `topPages` and `topQueries` rows. Today snapshots persist only top-N aggregates ([src/types/snapshot.ts:38-69](D:/repos/periscope/src/types/snapshot.ts)). This is insufficient — we need per-page query rows. **Snapshot change**: extend the GSC engine to also pull the (page, query) dimension combination and persist it as `gsc.pageQueries: Array<{page, query, clicks, impressions, ctr, position}>` capped at a configurable limit (default 5000 rows). Add a top-level `pageQueries` envelope for backwards-compat readers, matching the SPEC-016 duplication pattern in [src/types/snapshot.ts:235-242](D:/repos/periscope/src/types/snapshot.ts).
- For each article, take the queries Google ranks it for, run the three checks: title/H1/tag overlap → `TITLE_QUERY_DRIFT`; striking-distance band → `STRIKING_DISTANCE`; same-query competition across articles → defer to Pass 2's cannibalization analysis.
- Verdict precedence: `CANNIBALIZATION` > `STRIKING_DISTANCE` > `TITLE_QUERY_DRIFT` > `WELL_TARGETED` > `GHOST` (no GSC data — new article, deindexed, or fundamental visibility problem).

**Pass 2 — Cannibalization sweep.** Group `pageQueries` by query, surface any query with ≥2 articles competing above the impressions threshold. Emit a dedicated `## Cannibalization` section in the report.

**Pass 3 — Optional Ads enrichment for GHOSTs only.** For articles with verdict `GHOST`, optionally fetch Ads ideas (cached) for title+tag seeds to give the operator something actionable. This is the only Ads call the audit makes, and it's batched.

### Ads error classification

Existing surface: [src/engines/ads.ts](D:/repos/periscope/src/engines/ads.ts) already exposes `GoogleAdsError` with parsed `code`, `status`, `message`. The gap is that **callers** don't classify it.

Add `src/lib/ads-error-classify.ts`:

```ts
export type AdsErrorCategory =
  | 'developer-token-not-approved'    // 403 DEVELOPER_TOKEN_NOT_APPROVED → apply for Basic
  | 'developer-token-prohibited'      // 403 DEVELOPER_TOKEN_PROHIBITED → token revoked
  | 'customer-not-enabled'            // 403 CUSTOMER_NOT_ENABLED → enable billing
  | 'auth-error'                      // 401 → re-mint, rotate key
  | 'authz-error'                     // 403 PERMISSION_DENIED → not added as user
  | 'quota-error'                     // 429 → wait, backoff already applied
  | 'invalid-customer-id'             // 400 INVALID_CUSTOMER_ID → wrong ID or stripped wrong
  | 'unknown';

export function classifyAdsError(err: GoogleAdsError): AdsErrorCategory;
export function formatAdsApiError(
  category: AdsErrorCategory,
  err: GoogleAdsError,
  commandName: string,
): string;
```

Format example for `developer-token-not-approved`:

```
[audit-articles] Google Ads developer token is approved for TEST ACCOUNTS ONLY (HTTP 403 DEVELOPER_TOKEN_NOT_APPROVED).

  Your current developer token cannot query production customer accounts. Two paths:
    1. Apply for Basic Access at https://ads.google.com/aw/apicenter (form takes ~15 min,
       review takes 1–5 business days). See: docs/documentation/guides/google-ads-basic-access.md
    2. Switch CUSTOMER_ID/LOGIN_CUSTOMER_ID to a Google Ads test account
       (https://developers.google.com/google-ads/api/docs/best-practices/test-accounts).

  Run `periscope doctor` to verify after either change.
```

`audit-articles` (and the four other Ads-using commands) catch `GoogleAdsError`, classify once, abort the loop if the same category fires ≥3× consecutively, and emit a single formatted message.

### Rate limiting + batching

Add `src/lib/ads-batch.ts` with two utilities:

- `batchSeeds(seeds: string[], maxPerCall = 20): string[][]` — chunk inputs.
- `withBackoff<T>(fn: () => Promise<T>, opts: { maxRetries: 3, capMs: 60000 }): Promise<T>` — retry on 429, respect `Retry-After` if present, full-jitter exponential backoff otherwise.

Wrap `adsPost` in `withBackoff` for `generateKeywordIdeas` and `generateIdeasFromUrl`. `generateKeywordIdeas` becomes a batching wrapper that issues one paginated call per seed-batch and concatenates results.

### Snapshot-time caching

`snapshot.ts` already builds the keyword seeds list. Extend it to:

1. Run `generateKeywordIdeas` once on the full deduplicated seed set (batched), with `pageSize` proportional to seed count.
2. Write the result to `<outputDir>/keyword-ideas-<asof>.json` alongside the snapshot.
3. Persist a `keywordIdeasCachePath` field in the snapshot JSON envelope.

`audit-articles`, `discover-topics`, `validate-lps` learn to:

1. Read the cache file from the latest snapshot.
2. If a needed seed isn't in the cache, optionally backfill (cached) — controlled by `--no-cache` (force live) and `--cache-only` (never call Ads, fail if not in cache).

### Multi-property config

Extend `periscope.config.{ts,mjs}` schema (zod, in [src/lib/config.ts](D:/repos/periscope/src/lib/config.ts)) to accept either the current flat shape OR a `properties: Record<string, PropertyConfig>` map plus `defaultProperty: string`. The CLI gains `--property <name>` on every command; without it, the default is used.

`PropertyConfig` per property:
- `siteUrl`, `gscSiteUrl` (often same), `ga4PropertyId`
- `ads.customerId`, `ads.loginCustomerId`, `ads.developerTokenEnv` (default `GOOGLE_ADS_DEVELOPER_TOKEN`, override for clients)
- `outputDir` (per-property output isolates client data)
- `articles.dir`, `landingPages.dir`, `categories[]`

### Critical files

**Periscope ([D:/repos/periscope](D:/repos/periscope)):**

- `src/engines/gsc.ts` — add `(page, query)` dimension pull; new `pullPageQueries()`.
- `src/types/snapshot.ts` — add `gsc.pageQueries` array, top-level duplication for back-compat.
- `src/engines/ads.ts` — wrap `adsPost` in `withBackoff`; convert `generateKeywordIdeas` to batched.
- `src/lib/ads-batch.ts` (new) — `batchSeeds`, `withBackoff`.
- `src/lib/ads-error-classify.ts` (new) — `classifyAdsError`, `formatAdsApiError`.
- `src/commands/audit-articles.ts` — full rewrite to GSC-first three-pass logic; Ads only on GHOST verdicts.
- `src/commands/snapshot.ts` — write keyword-ideas cache file.
- `src/commands/discover-topics.ts`, `validate-lps.ts`, `probe.ts` — read cache, fall through to live Ads with backoff + classification.
- `src/lib/config.ts` — multi-property zod schema.
- `src/cli.ts` — `--property`, `--no-cache`, `--cache-only`, `--explain` flags.
- `tests/unit/ads-batch.test.ts`, `tests/unit/ads-error-classify.test.ts`, `tests/unit/audit-articles-gsc.test.ts` (new).

**coffey.codes:**

- `periscope.config.mjs` — opt into multi-property even though only one property is defined (smoke-test the new shape).
- `docs/documentation/guides/google-ads-basic-access.md` (new) — application checklist.
- `package.json` — bump `@anthonycoffey/periscope` to the resulting version (likely `^1.2.0`).

## Edge cases

- [ ] GSC snapshot present but no `pageQueries` field (older snapshot pre-this-spec): `audit articles` SHALL warn that the snapshot was taken with an older periscope version and either fall back to per-article query lookups via top-N `topQueries` aggregation OR exit with a clear "re-run snapshot" message.
- [ ] An article has GSC queries that overlap title only via stopwords ("the", "and", "a"): tokenizer SHALL strip a stopword list before computing overlap so we don't get false `WELL_TARGETED` verdicts.
- [ ] Cannibalization where one article is intentionally a hub linking to the other (e.g. a category page vs an article): the report SHALL flag it, but call out that the operator may want to suppress via a `cannibalization.allowlist[]` config entry. (No suppression in v1 — list and move on.)
- [ ] Ads call returns 200 but with an empty `results` array on a valid seed: treat as no-ideas, not as an error.
- [ ] Multi-property config selected with `--property foo` but `foo` not defined: exit code 2, list available property names.
- [ ] Cache file present but corrupt: log a clear "cache corrupted, falling back to live" warning, do not crash.
- [ ] `--explain` mode encounters a property whose credentials aren't loadable: print the plan AS IF creds were valid, then trail with "creds missing — see `periscope doctor`".

## Acceptance criteria

1. `periscope audit articles` on coffey.codes' real snapshot produces a report where ≥1 article has a `TITLE_QUERY_DRIFT` or `STRIKING_DISTANCE` verdict derived from GSC, and at least one `CANNIBALIZATION` section is computed (even if empty).
2. `periscope audit articles` makes **zero** Ads API calls when every article has GSC coverage. Verified by stubbing `adsPost` in an integration test and asserting it wasn't called.
3. `periscope audit articles` against an account with an unapproved developer token (manually configurable in test fixture) emits the `developer-token-not-approved` formatted message **once**, then exits with code 1 — not 23 identical lines.
4. `periscope snapshot` writes `<outputDir>/keyword-ideas-<asof>.json` and the file is consumed by a subsequent `periscope audit articles --cache-only` without any Ads API calls.
5. Forcing a synthetic 429 in unit tests, `withBackoff` retries up to 3× with capped exponential backoff and respects `Retry-After`.
6. `periscope --property foo audit articles` with two properties defined uses `foo`'s `outputDir`, `ads.customerId`, `articles.dir`. Verified with a multi-property `periscope.config.mjs` fixture under `tests/fixtures/`.
7. `periscope audit articles --explain` prints the call plan (which queries from GSC, which Ads batches if any, expected request count) without making any API calls.
8. Existing test suite + new tests stay green; `npm test` reports 0 failures.

## Constraints

- Cannot use external paid keyword APIs (user constraint).
- Cannot lean on dev-niche data sources (Reddit/HN/etc.) — must be industry-agnostic.
- Must remain backwards-compatible with the single-property config shape (`periscope.config.mjs` files already in clients' repos must keep working).
- Snapshot file format additions only; no breaking removals.
- Must not require a Google Ads Basic Access approval to deliver value — every Must-have except #3's edge-case test SHALL work with GSC creds only.

## Tasks

- [ ] **Snapshot:** extend GSC engine to pull and persist `pageQueries` rows.
- [ ] **Audit:** rewrite `audit-articles.ts` to the GSC-first three-pass architecture.
- [ ] **Ads infra:** add `ads-batch.ts` (batching + backoff) and `ads-error-classify.ts`.
- [ ] **Caching:** snapshot-time keyword ideas cache, read by Ads-using commands; `--no-cache` and `--cache-only` flags.
- [ ] **Multi-property:** extend zod config schema and CLI `--property` flag.
- [ ] **`--explain`** flag across all commands.
- [ ] **Docs:** `docs/documentation/guides/google-ads-basic-access.md` checklist.
- [ ] **Tests:** unit tests for batching, backoff, classification, GSC audit verdicts; integration test for cache hit path.
- [ ] **coffey.codes wiring:** opt the consumer config into the multi-property shape, bump devDep.
- [ ] **Release:** periscope 1.2.0, coffey.codes consumes it, archive this SPEC.

## Notes

### Is the product worth $100/mo today? Honest answer

Not today. Today it's a single-property personal SEO assistant whose audit verdict is derived from the wrong data source. After this SPEC, it becomes a **multi-property GSC-first SEO toolsuite** that surfaces three analyses an SEO consultant actually charges for (striking distance, cannibalization, title-query drift) and treats Ads quota / approval / classification as a real operational concern. That gets it to *credible*. To get to *worth $100/mo*, future work should address:

- A polished onboarding command (`periscope onboard`) that walks a new client through service-account permission, GSC verification, and a smoke test — currently this is a 30-minute manual job per client.
- Topic-gap clustering from GSC queries (the "what should I write next" question, answered from real impressions rather than from Ads ideas).
- Historical movement reports beyond the existing `diff` — week-over-week query gain/loss per article, surfaced as a leaderboard.
- A client-facing HTML report variant (Markdown is the canonical machine-readable output; HTML is the deliverable).

This SPEC is the bridge between "personal tool" and "enterprise-credible." The $100/mo conversation belongs in the SPEC that lands after these four items.

### Why we are committing to Google Ads instead of a paid alternative

User has chosen to apply for Basic Access. The application is winnable: periscope is a published package on GitHub Packages with a public README, the use case (analyzing a property's own keyword landscape) is RMF-compliant, and the operator authenticates as themselves against their own properties. The classification work in this SPEC also turns rejection into a clear signal rather than a stack of confusing 403s, which de-risks the experiment.

### Why we are NOT adding Reddit/HN/LinkedIn signals

User constraint: tool must work for any industry, not just dev/tech. Reddit and HN are excellent for developer-niche topic discovery but useless for, say, a regional locksmith or a B2B SaaS in a non-technical vertical. LinkedIn has no useful search API. The decision is to lean entirely on GSC (industry-agnostic by construction — it indexes whatever Google indexes) for analysis, and Ads (industry-agnostic) for discovery.

### Related specs

- [SPEC-019](../archive/SPEC-019-keyword-volume-in-snapshot.md) — added Ads volume buckets to GSC top queries; this spec inverts the dependency direction (GSC drives audit, Ads is enrichment).
- [SPEC-020](../archive/SPEC-020-keyword-research-tools.md) — created the four keyword research commands; this spec restructures their data flow around caching.
- [SPEC-023](../archive/SPEC-023-periscope-tool-suite.md) — extracted periscope into a standalone package; this spec is the first major feature SPEC in the standalone repo.
