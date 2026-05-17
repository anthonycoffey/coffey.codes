---
service: coffey.codes
updated: 2026-05-15
description: At-a-glance inventory of the SEO tool suite. coffey.codes consumes @anthonycoffey/periscope; the package source lives in this repo at tooling/periscope/.
---

# SEO tooling inventory

All SEO work runs through `@anthonycoffey/periscope`, a TypeScript package on GitHub Packages. The package source lives in this repo at [`tooling/periscope/`](../../../tooling/periscope/); coffey.codes consumes it as a devDependency. Outputs land in `periscope.config.outputDir` (default `docs/strategy/data/`). For setup and run instructions see [seo-snapshot-setup.md](./seo-snapshot-setup.md).

## At a glance

| Layer | What it does | Where it lives |
| --- | --- | --- |
| Data collection | Pulls from four engines into dated JSON + Markdown snapshots | `periscope snapshot` (cmd: `src/commands/snapshot.ts`) |
| Diffing | Reports deltas between any two snapshots | `periscope diff` (cmd: `src/commands/diff.ts`) |
| Keyword research | Four targeted commands that consume snapshots + Google Ads API | `periscope audit/discover/validate/probe` |
| Diagnostics | Credential and access checks per engine | `periscope doctor [engine]` (cmd: `src/commands/doctor.ts`, modules: `src/diagnostics/*.ts`) |
| Engines | One module per upstream API | `src/engines/{gsc,ga4,bing,ads}.ts` |
| Shared library | Auth, bucket math, markdown render, config loader, frontmatter parser, ANSI colors, snapshot store, diagnostics types | `src/lib/*.ts` |
| Config | Project-specific paths + ids | `periscope.config.mjs` at the consumer repo root |
| Output | Snapshots, diffs, and reports | `docs/strategy/data/` (committed to git) |

## Data collection

### `periscope snapshot`

The foundation. Pulls four engines into one dated JSON + Markdown pair in `outputDir`.

| Engine | What it gives us | Auth |
| --- | --- | --- |
| Google Search Console | Top queries, top pages, performance, CTR by position | Service account |
| Google Analytics 4 | Traffic, sources, plus a bot-region-excluded variant (China + Singapore filtered) | Same service account |
| Bing Webmaster Tools | Parallel to GSC. Does not backfill; coffey.codes added 2026-05-10, ~90 days until useful | API key |
| Google Ads Keyword Planner | Enriches GSC rows with volume buckets, competition, CPC ranges | Same service account + dev token |

Flags:

- `--engines=gsc,ga4,keywords,bing` — pick subset
- `--window=180` — days of history (default 365)
- `--asof=2026-05-09` — anchor "today" to a past date for backfill
- `--dry-run` — plan without API calls
- `--config <path>` — override periscope.config location

Two files per run, same date stem:

- `snapshot-<YYYY-MM-DD>.json` — full structured data, source of truth for diff and downstream consumers
- `snapshot-<YYYY-MM-DD>.md` — condensed Markdown summary, what humans and AI tools should read

### `periscope diff`

Diffs two snapshot JSONs. Surfaces:

- Per-engine totals delta
- Top-page click delta
- New entrants (queries with >=5 impressions absent from older snapshot)
- Fallers (>30% impression drop)

TTY-colored when stdout is a terminal, plain text when piped. Reuses `src/lib/colors.ts` for the ANSI helpers shared with `probe`.

## Keyword research

All four commands use Google Ads' `KeywordPlanIdeaService` via `src/engines/ads.ts`. All four reuse the same auth via `src/lib/auth.ts`.

### `periscope audit articles`

Walks every MDX under `periscope.config.articles.dir`, joins the slug to the latest snapshot's GSC data, asks Ads for related keywords using title + tags as seed. Flags each article as `OPPORTUNITY` (higher-volume term available with competition <= MEDIUM) or `WELL_TARGETED`.

Output: `<outputDir>/keyword-audit-articles-<YYYY-MM-DD>.md`

### `periscope discover topics`

Seeds Ads with `periscope.config.categories` plus the top 25 GSC queries from the latest snapshot. Filters out anything already covered by an existing article slug (60% token-overlap heuristic). Returns a ranked editorial backlog grouped by competition bucket, sorted by volume bucket descending.

Output: `<outputDir>/keyword-topics-<YYYY-MM-DD>.md`

### `periscope validate lps`

For each `<landingPages.dir>/<slug>/<pageFile>`, pulls the metadata title + first `<h1>` as seed. Strips the configured `brandSuffix` from titles before seeding. Issues a verdict per LP:

- `UNDER_INVESTED` — top idea bucket is `<100` or `100-1K`
- `WELL_TARGETED` — bucket is `1K-10K` or `10K-100K` with LOW or MEDIUM competition
- `OVER_AMBITIOUS` — bucket is `10K-100K` or `100K+` with HIGH competition

Output: `<outputDir>/keyword-lp-validation-<YYYY-MM-DD>.md`

### `periscope probe <url>`

One-shot competitor URL probe. Single positional arg, top 30 keyword ideas to stdout. No file output. Pre-writing recon for competitive pieces.

```bash
npm run seo:probe -- https://competitor.com/their-post
```

## Diagnostics

### `periscope doctor [engine]`

Runs credential + access checks against the engines periscope talks to. Currently the **Ads** engine is the only one with a diagnostic module (others land as needs surface).

```bash
npm run seo:doctor              # all available checks (currently just ads)
npm run seo:doctor -- ads       # just the Ads check
```

The Ads diagnostic walks the same auth path the `keywords` engine uses (service-account JWT mint), calls Google Ads' `listAccessibleCustomers` (the cheapest probe — does not need `login-customer-id`), and compares the returned customer IDs to `GOOGLE_ADS_CUSTOMER_ID` + `GOOGLE_ADS_LOGIN_CUSTOMER_ID`. Names the gap when one of them is not in the accessible list.

Never prints the developer token, access token, or service-account private key. Prints `client_email` and customer IDs (not secret). Exits 0 on success, 1 on failure, 2 on unknown engine.

Diagnostic modules live in `src/diagnostics/`; each exports a `diagnose<Engine>()` returning a `DiagnosticReport` (`src/lib/diagnostics.ts`). Add a new engine by writing the diagnostic module and registering it in `AVAILABLE_DIAGNOSTICS` in `src/commands/doctor.ts`.

## Engines

### `src/engines/gsc.ts`

`pullGsc({ siteUrl, startDate, endDate, windowDays, credentials })` runs four parallel Search Console queries (page/query/country/device). Totals derive from byDevice rows.

### `src/engines/ga4.ts`

`pullGa4({ propertyId, startDate, endDate, windowDays, credentials, botRegions })` runs seven parallel reports including two bot-region-excluded variants. The `botRegions` list is passed in via config.

### `src/engines/bing.ts`

`pullBing({ siteUrl, apiKey, startDate, endDate, windowDays })` hits two Webmaster API endpoints. Expects `siteUrl` in the full URL form (`https://example.com/`), not GSC's `sc-domain:` form. The orchestrator converts.

### `src/engines/ads.ts`

Direct REST against `https://googleads.googleapis.com/<API_VERSION>/`. Exports `generateKeywordIdeas`, `generateHistoricalMetrics`, `generateIdeasFromUrl`, and `GoogleAdsError`. API version pinned (currently `v21` as of 2026-05-11). Google sunsets versions roughly quarterly; bump the `API_VERSION` constant when the API starts returning 404 HTML pages, then publish a new periscope version.

## Shared library

| File | Exports |
| --- | --- |
| `src/lib/auth.ts` | `loadGoogleCredentials`, `getAdsAuth` (cached service-account JWT), `adsHeaders`, `buildGoogleAuth` |
| `src/lib/bucket.ts` | `BUCKET_ORDER`, `bucketRank`, `bucketLabel` |
| `src/lib/colors.ts` | TTY-aware ANSI helpers used by `diff` and `probe` |
| `src/lib/config.ts` | zod schema + multi-format loader for `periscope.config.{ts,mjs,js,json}` |
| `src/lib/frontmatter.ts` | Minimal YAML frontmatter parser (no gray-matter dep) |
| `src/lib/markdown.ts` | Snapshot Markdown renderer |
| `src/lib/snapshot-store.ts` | `loadLatestSnapshot`, `isSnapshotStale`, `writeSnapshotJson`, `writeSnapshotMarkdown` |

## Config

`periscope.config.mjs` at the consumer repo root, validated by zod at load:

```js
{
  siteUrl: 'sc-domain:coffey.codes',
  ga4PropertyId: '416080229',
  outputDir: 'docs/strategy/data',
  articles: { dir: 'app/(site)/articles/posts' },
  landingPages: {
    dir: 'app/lp',
    pageFile: 'page.tsx',
    brandSuffix: ' | Anthony Coffey',
  },
  ads: {
    languageCode: 'languageConstants/1000',
    geoTargets: ['geoTargetConstants/2840'],
  },
  ga4: { botRegions: ['China', 'Singapore'] },
  categories: ['Web Development', /* ... */ ],
}
```

Env vars still drive credentials (`GSC_SERVICE_ACCOUNT_*`, `GA4_PROPERTY_ID`, `BING_WEBMASTER_API_KEY`, `GOOGLE_ADS_*`). The config file owns project shape; env owns secrets.

## Output conventions

All output goes to `outputDir` and is committed to git.

| Pattern | What it is |
| --- | --- |
| `snapshot-<YYYY-MM-DD>.json` | Full snapshot, machine readable, source of truth |
| `snapshot-<YYYY-MM-DD>.md` | Snapshot summary, human + AI readable |
| `keyword-audit-articles-<YYYY-MM-DD>.md` | Article keyword auditor report |
| `keyword-topics-<YYYY-MM-DD>.md` | New topic backlog |
| `keyword-lp-validation-<YYYY-MM-DD>.md` | LP target verdicts |

Date in filename, not timestamp. Reruns on the same day overwrite; history lives in git.

## Specs that produced this tooling

| Spec | What it added | Status |
| --- | --- | --- |
| SPEC-018 | Multi-engine snapshot foundation (GSC + GA4 + Bing) | Archived |
| SPEC-019 | Google Ads Keyword Planner as the fourth engine | Archived |
| SPEC-020 | The four keyword research scripts | Archived |
| SPEC-022 | Ahrefs as a fifth snapshot engine | Active (proposed) |
| SPEC-023 | Extract everything into the `@anthonycoffey/periscope` package | Active |

## What is intentionally not here

- **No Ahrefs integration yet.** SPEC-022 covers adding it as a fifth engine (`src/engines/ahrefs.ts`). Ahrefs MCP requires the $129/mo plan; lower tiers return "Insufficient plan."
- **No Bing comparison in diffs yet.** Property added recently; ~90 days of data needed before the Bing column means anything.
- **No automated scheduling.** Commit cadence is manual: monthly minimum, after material content changes, quarterly diffs against the same-week snapshot from the prior quarter.
- **No IndexNow or sitemap resubmits.** All tooling here is read-only against the SEO APIs.

## Related docs

- [seo-snapshot-setup.md](./seo-snapshot-setup.md) — setup, env vars, run commands, troubleshooting
- [tooling/periscope/README.md](../../../tooling/periscope/README.md) — package-internal docs (config, install from GH Packages, publishing)
- [onpage-seo-strategy.md](../deep-dives/onpage-seo-strategy.md) — what the audits measure
- [ctr-by-position-baseline.md](../deep-dives/ctr-by-position-baseline.md) — site-specific CTR curve
- [docs/strategy/](../../strategy/) — quarterly narrative reports built from these snapshots
