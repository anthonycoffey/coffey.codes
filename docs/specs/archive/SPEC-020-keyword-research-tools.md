---
id: SPEC-020
title: 'Keyword research tools (article auditor, topic discovery, LP validator, competitor probe)'
status: complete
created: 2026-05-11
completed: 2026-05-15
author: Anthony Coffey
reviewers: []
affected_repos: [coffey.codes]
---

## Reviewer Notes

<!-- Leave empty until code review. When requesting changes, reviewer adds feedback here: -->

---

# Feature: Keyword research tools backed by Google Ads + GSC snapshots

## Problem

The SEO audits and the snapshot script tell us what *did* happen (GSC clicks/impressions, GA4 sessions). SPEC-019 wires Google Ads' Keyword Planner into the snapshot to also surface what *could* happen (volume buckets, competition).

But the snapshot is a data substrate, not an answer. The actual editorial questions the site needs answered are concrete:

1. **Per-article**: is this article ranking on the right keywords, or is it under-shooting a higher-volume term it could target with light editing?
2. **For new content**: given the categories the site covers, what keyword opportunities exist that aren't currently being targeted at all?
3. **Per landing page**: is this `/lp/*` page targeting keywords with realistic conversion potential, or is the LP fighting for traffic that doesn't exist?
4. **Vs competitors**: when planning a competitive piece, what keywords does Google associate with the competitor's URL?

Each of these is a small, focused script that takes the snapshot + Ads API as inputs and outputs a markdown or JSON report. They share auth, share output conventions, and individually are too small to justify their own SPECs.

## Requirements

### Must have

1. WHEN `scripts/keyword-audit-articles.mjs` runs, it SHALL produce a markdown report at `docs/strategy/data/keyword-audit-articles-<date>.md` listing each article in `app/articles/posts/` with: its current top GSC query, the keyword ideas Google Ads returns for the article's title/tags/summary as seed input (top 10 by volume), and a flag if any idea has volume bucket ≥ the current top query's volume bucket AND competition ≤ `MEDIUM`.
2. WHEN `scripts/keyword-discover-topics.mjs` runs, it SHALL produce a markdown report at `docs/strategy/data/keyword-topics-<date>.md` with a ranked editorial backlog: keyword ideas seeded from the site's category list + top GSC queries, filtered to those the site does NOT currently have an article for, grouped by competition bucket, sorted by volume bucket descending.
3. WHEN `scripts/keyword-validate-lps.mjs` runs, it SHALL produce a markdown report at `docs/strategy/data/keyword-lp-validation-<date>.md` listing each `app/lp/*/page.tsx`, the keywords implied by its metadata title and H1, and a verdict (`UNDER_INVESTED` / `WELL_TARGETED` / `OVER_AMBITIOUS`) based on volume bucket + competition.
4. WHEN `scripts/keyword-probe-url.mjs <url>` runs with a competitor or seed URL as the only positional arg, it SHALL print to stdout the keyword ideas Google Ads returns for that URL as seed, top 30 by volume.
5. All four scripts SHALL load the same Google Ads credentials from `.env`/`.env.local` as SPEC-019 (`GOOGLE_ADS_DEVELOPER_TOKEN`, `GOOGLE_ADS_CUSTOMER_ID`, `GOOGLE_ADS_LOGIN_CUSTOMER_ID`) and reuse the SPEC-019 puller's auth and rate-limit handling. If credentials are missing, the script fails fast with the exact same error message the snapshot script emits, not a half-broken run.
6. WHEN the most recent snapshot in `docs/strategy/data/` is missing OR predates the script run by more than 30 days, scripts #1, #2, and #3 SHALL print a clear warning recommending `node scripts/seo-snapshot.mjs` first, but SHALL still run using a live GSC query as fallback for the GSC data they need (so the tools work even on a fresh checkout).
7. WHEN any of the four scripts runs, output SHALL follow the existing snapshot script conventions: stderr for warnings, stdout for success summary, exit code 0 on success / 1 on hard failure / 2 on CLI misuse.

### Nice to have

- A shared `scripts/lib/google-ads.mjs` module that the four scripts (and `seo-snapshot.mjs`'s `pullKeywords`) all import. Avoids copy-pasting the auth and rate-limit code four times. Lift this from SPEC-019 if it lands as a shared module there.
- ANSI-colored markdown previews when stdout is a TTY (match the styled-diff aesthetic from SPEC-018).
- A `--dry-run` flag on each that prints the API calls it would make without executing them.

### Non-goals (what this does NOT do)

- This spec does NOT change the snapshot script itself. SPEC-019 owns that. This spec consumes its output.
- This spec does NOT migrate to a different keyword data source (Ahrefs, Semrush, etc.). Google Ads free tier is the data source, full stop.
- This spec does NOT auto-edit any article, LP, or frontmatter file. The reports are advisory; the author chooses what to act on.
- This spec does NOT submit anything to search engines (no IndexNow, no resubmit-sitemap calls). Read-only API usage.
- This spec does NOT include a "competitor full audit" pipeline. The URL probe (#5) is single-URL on demand; multi-competitor batch audits are out of scope.

## Design

### Shared library

`scripts/lib/google-ads.mjs` exports:

```js
export async function getCustomer()         // returns a configured client
export async function generateKeywordIdeas(seedConfig)
export async function generateHistoricalMetrics(keywords)
export async function generateIdeasFromUrl(url)
export function loadLatestSnapshot()        // reads docs/strategy/data/, returns most-recent JSON
export function isSnapshotStale(snap, days = 30)
```

If SPEC-019's `pullKeywords` lifts a similar module first, this spec uses it directly. Otherwise this spec creates it during the article-auditor implementation and SPEC-019's puller refactors to use it later.

### Tool 1: Article keyword auditor

```bash
node scripts/keyword-audit-articles.mjs
# writes docs/strategy/data/keyword-audit-articles-<YYYY-MM-DD>.md
```

For each `.mdx` file in `app/articles/posts/`:

1. Parse frontmatter (title, summary, tags, category, slug). Reuse `app/articles/utils.ts`'s `getArticleBySlug` if it can be imported into the script; otherwise read frontmatter directly with `gray-matter` (already a dep).
2. Find this slug in the latest snapshot's `gsc.topPages`. Read its top query, current position, current impressions.
3. Call `generateKeywordIdeas` with seed = `title` + `tags.join(' ')` + first sentence of `summary`. Limit to 10 results sorted by volume bucket descending.
4. For each idea, compare its volume bucket vs. the article's current top query's bucket. Flag `OPPORTUNITY` if volume is higher AND competition ≤ `MEDIUM`. Flag `WELL_TARGETED` if current top query is already the best option in the returned set.

Output rows in markdown:

```markdown
### `slow-android-emulator-flutter-dev.mdx`
- **Title:** Slow Android Emulator? Fix Flutter Dev Performance
- **Current top GSC query:** `expo-location` (5,298 imp, position 6.1)
- **Suggested keyword:** `flutter android emulator slow` — bucket `1K-10K`, competition `LOW` 🟢 **OPPORTUNITY**
- **Other top ideas:** ...
```

### Tool 2: New topic discovery

```bash
node scripts/keyword-discover-topics.mjs
# writes docs/strategy/data/keyword-topics-<YYYY-MM-DD>.md
```

1. Pull article categories: `Web Development`, `Mobile Development`, `Cloud & DevOps`, `Software Engineering`, `Tools & Productivity` (per the SPEC-015 audit; `Development` typo gets folded into Mobile).
2. Pull top 25 queries from the latest snapshot's `gsc.topQueries`.
3. Call `generateKeywordIdeas` with seeds = categories + top queries. Limit 100 ideas.
4. Filter out ideas whose stem already matches an existing article's slug (heuristic: tokenize the idea, tokenize all slugs, intersect; if ≥ 60% of idea tokens are covered by some slug's tokens, drop the idea as "already covered").
5. Group remaining ideas by competition bucket. Within each bucket, sort by volume bucket descending.

Output:

```markdown
## High volume + low competition (write these first)
- `vibe coding flutter app` — bucket `1K-10K`, competition `LOW`, comp index 8
- ...

## High volume + medium competition (defensible, will take time)
- ...

## Medium volume + low competition (quick wins for niche traffic)
- ...
```

### Tool 3: LP target validator

```bash
node scripts/keyword-validate-lps.mjs
# writes docs/strategy/data/keyword-lp-validation-<YYYY-MM-DD>.md
```

1. Read each `app/lp/*/page.tsx`. Extract metadata `title`, page `<h1>` (regex match; LPs are static), and the first 200 chars of body copy.
2. For each LP, the seed = title's keyword stem (strip ` | Anthony Coffey...` suffix) + h1.
3. Call `generateKeywordIdeas` with that seed. Look at the top 5 ideas.
4. Verdict logic:
   - **`UNDER_INVESTED`**: top idea's volume bucket is `100-1K` or smaller, competition irrelevant. Page is targeting genuinely-niche traffic; reconsider whether SEO investment makes sense vs. just relying on direct/referral.
   - **`WELL_TARGETED`**: top idea's volume bucket is `1K-10K` or `10K-100K`, competition is `LOW` or `MEDIUM`. Realistic SEO play; double down on content depth.
   - **`OVER_AMBITIOUS`**: top idea's volume bucket is `10K-100K` or `100K+`, competition is `HIGH`. Page is fighting for traffic that goes to category leaders; consider repositioning to a more defensible long-tail.

Output:

```markdown
### `/lp/practical-ai`
- **Title:** Practical AI Solutions for Business Growth
- **H1:** ...
- **Top keyword idea:** `ai for business` — bucket `100K+`, competition `HIGH`
- **Verdict:** 🟡 **OVER_AMBITIOUS** — consider repositioning to "practical ai for SMBs" or "ai consulting for small business" (defensible long-tails)
```

### Tool 4: Competitor URL probe

```bash
node scripts/keyword-probe-url.mjs https://competitor.com/their-post
# prints to stdout
```

Single URL, single positional arg. Calls `generateIdeasFromUrl(url)`, prints the top 30 ideas in a plain table to stdout. Useful before writing a competitive piece. No file output (this is meant to be one-shot exploratory).

Output:

```
Keyword ideas for https://competitor.com/their-post

  KEYWORD                              VOLUME      COMPETITION
  flutter state management             1K-10K      MEDIUM
  ...
```

### Snapshot dependency (must-have #6)

Tools #1, #2, #3 read GSC data from the latest snapshot. If the snapshot is missing or > 30 days old, they fall back to a live GSC query against the same window the snapshot would have used. Live fallback adds ~3 seconds to the run; not worth caching since these are on-demand tools.

Tool #4 doesn't need GSC at all (URL probe is pure Ads side).

## Edge cases

- [ ] **Article has no GSC presence** (new post, no impressions yet): article auditor falls back to seeding from frontmatter only, with no "current top query" baseline. Flags as `NO_DATA_YET` rather than running broken comparisons.
- [ ] **LP page has no h1** (some `/lp/*` use h2 only or rely on background image): LP validator falls back to title-only seed and logs a warning.
- [ ] **URL probe gets a 404 or robots.txt-blocked URL**: Google Ads still returns ideas if it has indexed the URL historically; if not, returns empty. Surface empty results clearly instead of a confusing pile of zero rows.
- [ ] **Topic discovery's already-covered heuristic is wrong** (false positives: idea labeled "already covered" when it isn't): the heuristic is conservative on purpose. Better to occasionally suggest a topic the site already has than to flood the output with near-duplicates. Document the tradeoff in the script header.
- [ ] **Google Ads returns volume bucket as `null`**: rare but possible for very rare or freshly-introduced terms. Display as `INSUFFICIENT_DATA` in the report; don't crash.
- [ ] **`/lp/*` page is dynamically generated** (e.g. ICP variant from query params): the validator skips it and notes "dynamic, not statically analyzable."

## Acceptance criteria

1. All four scripts produce their documented outputs against the live Google Ads account when credentials are set.
2. Running any of the three file-output scripts twice in the same day overwrites the existing file (no date-time suffix; just date).
3. Output markdown files render correctly in GitHub's MDX viewer and in the project's own MDX renderer (validate by previewing one of each).
4. Each script's first line of output (stdout) is a one-line summary that fits in a terminal width (~80 chars).
5. `npm run lint` passes after the scripts are added. (ESLint config covers `.mjs` files.)
6. Each script's header docblock includes setup instructions equivalent to what's in `docs/documentation/guides/seo-snapshot-setup.md`, and the guide is updated with a "Keyword research tools" section listing all four.
7. A run with `GOOGLE_ADS_DEVELOPER_TOKEN` unset fails fast with the same error message the snapshot script emits (no half-broken state).

## Constraints

- Zero new npm deps beyond what SPEC-019 adds.
- Output files are committed to git like snapshot files are (first-party data, ~10-50 KB each).
- Output filenames use date only (`-2026-05-11.md`), not timestamp. Reruns overwrite, keeping history in git instead of in the filename pattern.
- Voice rules apply to all report output (markdown content): no em-dashes, no marketing tricolons, no closing flourishes. The reports are read by the author; they're internal copy.
- All scripts ship in `scripts/`, not in `app/` or `lib/` (snapshot-script convention).

## Tasks

- [x] Co-developed SPEC-019 + SPEC-020 in the same session; shared `scripts/lib/google-ads.mjs` lives in SPEC-019's first commit.
- [x] Implement `scripts/lib/google-ads.mjs`.
- [x] Implement `scripts/keyword-audit-articles.mjs`.
- [x] Implement `scripts/keyword-discover-topics.mjs`.
- [x] Implement `scripts/keyword-validate-lps.mjs`.
- [x] Implement `scripts/keyword-probe-url.mjs`.
- [x] Update `docs/documentation/guides/seo-snapshot-setup.md` with a "Keyword research tools" section.
- [x] Add a section to `docs/documentation/repos/coffey-codes.md` SEO data pipeline pointing at the four tools.
- [x] Extended the agent brief with a "Run keyword research tools" subsection.
- [x] Lint check, syntax check.
- [ ] First end-to-end run against the live Google Ads account and commit the first reports. *(blocked on the same user-side cloud config as SPEC-019)*

## Notes

- **Why four scripts, not one CLI with subcommands**: each script has a different output shape and different inputs. A single `node scripts/keyword.mjs <subcommand>` would just hide the four scripts behind an extra layer. Direct filenames are clearer.
- **Why markdown output, not JSON**: these reports are read by a human (the author), not parsed by another script. Markdown renders nicely in the GitHub UI and in any editor. The underlying API data goes to the snapshot in JSON; the reports are the human-facing surface.
- **Volume bucket comparison**: comparing bucket labels (`100-1K` vs `1K-10K`) requires a fixed ordering. Define `BUCKET_ORDER = ['<100', '100-1K', '1K-10K', '10K-100K', '100K+']` and `bucketRank(label) => index in array`. Use that everywhere.
- **Related specs**:
  - SPEC-019 (keyword volume in snapshot, planned): the data foundation this spec consumes.
  - SPEC-017 (content strategy, active): the editorial follow-up that the topic-discovery and article-auditor outputs feed into.
  - SPEC-015, SPEC-016 (quarterly audits, complete): the GSC numbers these reports cite.

## Open questions

1. Does the LP validator's verdict logic (`UNDER_INVESTED` / `WELL_TARGETED` / `OVER_AMBITIOUS`) match how the author actually thinks about LP positioning, or is the labeling wrong? Lean toward shipping the labels as-is, then renaming in a follow-up if they read unnaturally in practice.
2. Should the topic-discovery script also seed from RSS subscriber data, GA4 referrals, or other "signal" inputs? Lean toward "no for v1"; keeping the script's input surface small makes the output easier to evaluate.
3. Should the URL probe write to a file when given a `--save` flag, or stay strictly stdout? Lean toward stdout-only; if the user wants to save, they can pipe to a file. Less code, less convention to remember.
