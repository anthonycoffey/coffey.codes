---
service: coffey.codes
updated: 2026-05-14
description: At-a-glance inventory of every SEO script, library, and data engine in the repo. Companion to seo-snapshot-setup.md (which covers how to run them).
---

# SEO tooling inventory

Everything SEO-related in this repo lives under `scripts/` and writes to `docs/strategy/data/`. This doc is the inventory. For setup, env vars, and run commands see [seo-snapshot-setup.md](./seo-snapshot-setup.md).

## At a glance

| Layer | What it does | Where it lives |
| --- | --- | --- |
| Data collection | Pulls from four engines into dated JSON + Markdown snapshots | `scripts/seo-snapshot.mjs` |
| Diffing | Reports deltas between any two snapshots | `scripts/seo-snapshot-diff.mjs` |
| Keyword research | Four targeted scripts that consume snapshots + Google Ads API | `scripts/keyword-*.mjs` |
| Shared library | Ads client, snapshot loaders, markdown renderer | `scripts/lib/*.mjs` |
| Output | Snapshots, diffs, and reports | `docs/strategy/data/` |

## Data collection

### `scripts/seo-snapshot.mjs`

The foundation. Pulls four engines into one dated JSON + Markdown pair in `docs/strategy/data/`.

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

Two files per run, same date stem:

- `snapshot-<YYYY-MM-DD>.json` — full structured data, source of truth for the diff script
- `snapshot-<YYYY-MM-DD>.md` — condensed Markdown summary, what humans and AI tools should read

### `scripts/seo-snapshot-diff.mjs`

Diffs two snapshot JSONs. Surfaces:

- Per-engine totals delta
- Top-page click delta
- New entrants (queries with >=5 impressions absent from older snapshot)
- Fallers (>30% impression drop)

TTY-colored when stdout is a terminal, plain text when piped.

## Keyword research (SPEC-020)

All four scripts use Google Ads' `KeywordPlanIdeaService`. All four reuse the same auth and rate-limit handling via the shared library.

### `scripts/keyword-audit-articles.mjs`

Walks every MDX in `app/(site)/articles/posts/`, joins the slug to the latest snapshot's GSC data, asks Ads for related keywords using title + tags + summary as seed. Flags each article as `OPPORTUNITY` (higher-volume term available with competition <= MEDIUM) or `WELL_TARGETED`.

Output: `docs/strategy/data/keyword-audit-articles-<YYYY-MM-DD>.md`

### `scripts/keyword-discover-topics.mjs`

Seeds Ads with the site's article categories plus the top 25 GSC queries. Filters out anything already covered by an existing article (token-overlap heuristic). Returns a ranked editorial backlog grouped by competition bucket, sorted by volume bucket descending.

Output: `docs/strategy/data/keyword-topics-<YYYY-MM-DD>.md`

### `scripts/keyword-validate-lps.mjs`

For each `app/lp/<slug>/page.tsx`, pulls the metadata title + first `<h1>` as seed. Issues a verdict per LP:

- `UNDER_INVESTED` — top idea bucket is `<100` or `100-1K`
- `WELL_TARGETED` — bucket is `1K-10K` or `10K-100K` with LOW or MEDIUM competition
- `OVER_AMBITIOUS` — bucket is `10K-100K` or `100K+` with HIGH competition

Output: `docs/strategy/data/keyword-lp-validation-<YYYY-MM-DD>.md`

### `scripts/keyword-probe-url.mjs`

One-shot competitor URL probe. Single positional arg, top 30 keyword ideas to stdout. No file output. Pre-writing recon for competitive pieces.

```bash
node scripts/keyword-probe-url.mjs https://competitor.com/their-post
```

## Shared library

### `scripts/lib/google-ads.mjs`

Ads auth and helpers shared across the snapshot's `keywords` engine and all four research scripts.

Exports:

- `getAdsAuth()` — configured client from `GOOGLE_ADS_*` env vars
- `generateKeywordIdeas(seedConfig)` — seed-based ideas
- `generateIdeasFromUrl(url)` — URL-seeded ideas
- `loadLatestSnapshot()` — reads most recent JSON in `docs/strategy/data/`
- `isSnapshotStale(snap, days = 30)` — staleness guard
- `bucketRank(label)` — fixed ordering of volume buckets

API version pinned (currently `v21` as of 2026-05-11). Google sunsets versions roughly quarterly; bump the `API_VERSION` constant when the API starts returning 404 HTML pages.

### `scripts/lib/snapshot-markdown.mjs`

Renders the human-readable `.md` companion to each snapshot. Runs automatically after the JSON write succeeds.

## Output conventions

All output goes to `docs/strategy/data/` and is committed to git.

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

Recent backfill commits (`87d1fed`, `9dab21b`, `e73b36a`, `78d1190`) used the new `--asof` flag to fill 2026-05-09 through 2026-05-11.

## What is intentionally not here

- **No Ahrefs integration yet.** SPEC-022 covers adding it. Ahrefs MCP requires the $129/mo plan; lower tiers return "Insufficient plan."
- **No Bing comparison in diffs yet.** Property added recently; ~90 days of data needed before the Bing column means anything.
- **No automated scheduling.** Commit cadence is manual: monthly minimum, after material content changes, quarterly diffs against the same-week snapshot from the prior quarter.
- **No IndexNow or sitemap resubmits.** All tooling here is read-only against the SEO APIs.

## Related docs

- [seo-snapshot-setup.md](./seo-snapshot-setup.md) — setup, env vars, run commands, troubleshooting
- [onpage-seo-strategy.md](../deep-dives/onpage-seo-strategy.md) — what the audits measure
- [ctr-by-position-baseline.md](../deep-dives/ctr-by-position-baseline.md) — site-specific CTR curve
- [docs/strategy/](../../strategy/) — quarterly narrative reports built from these snapshots
