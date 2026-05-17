---
service: coffey.codes
updated: 2026-05-11
description: How to wire and run the three-engine SEO snapshot script (GSC + GA4 + Bing). Setup, env vars, common runs, commit cadence.
---

# SEO snapshot setup

The `@anthonycoffey/periscope` package owns the SEO tool suite: `periscope snapshot` pulls Google Search Console, GA4, Bing Webmaster Tools, and Google Ads Keyword Planner into a paired JSON + Markdown file in `outputDir` (default `docs/strategy/data/`). `periscope diff` reports the delta between two snapshots. The four keyword research commands (`audit articles`, `discover topics`, `validate lps`, `probe <url>`) consume the snapshot to answer concrete editorial questions.

This guide is the consolidated walk-through for getting credentials in place and running the commands. The package source lives at https://github.com/anthonycoffey/periscope (extracted from this repo 2026-05) and ships to GitHub Packages.

## Why snapshot

Google Search Console only retains 16 months of data. Anything you don't snapshot is irrecoverable. Snapshots are committed to git so historical periods stay diffable forever (a year of weekly pulls is roughly 4 MB).

## Engines and auth model

| Engine | Mechanism | Required env var(s) |
| --- | --- | --- |
| Google Search Console | Service account with read access on the GSC property | `GSC_SERVICE_ACCOUNT_KEY_PATH` *or* `GSC_SERVICE_ACCOUNT_JSON` |
| GA4 | Same service account, granted Viewer in the GA4 property | `GA4_PROPERTY_ID` |
| Bing Webmaster Tools | API key generated in the Webmaster Tools UI | `BING_WEBMASTER_API_KEY` |

Engines without env vars are skipped with a one-line stderr warning. At least one engine must be configured.

## One-time setup

### 1. GSC service account

This is the foundation; GA4 reuses it.

1. Open [Google Cloud Console](https://console.cloud.google.com/), pick or create a project.
2. **IAM & Admin → Service Accounts → Create service account**. Name it something like `coffey-codes-readonly`.
3. After creating, open the account → **Keys → Add Key → Create new key → JSON**. Save the file.
4. **APIs & Services → Library → Search Console API → Enable**.
5. In [Google Search Console](https://search.google.com/search-console) → **Settings → Users and permissions → Add user**. Paste the service account's `client_email` (found inside the JSON key file). Permission: **Restricted** is enough.

Then set one of these in `.env` or `.env.local`:

```bash
GSC_SERVICE_ACCOUNT_KEY_PATH=C:/path/to/key.json
# OR for CI/inline:
GSC_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
```

### 2. GA4 (reuses the GSC service account)

No new credentials file. Two clicks:

1. In Google Cloud Console (same project as step 1) → **APIs & Services → Library → Google Analytics Data API → Enable**.
2. In [Google Analytics](https://analytics.google.com/) → **Admin** gear → on the property column for the property you want to pull (currently `coffey.codes`, ID `416080229`) → **Property access management → +→ Add users**.
   - Email: the service account's `client_email`.
   - Roles: **Viewer**.
   - Uncheck "Notify new users by email" (it's a robot).

Add to `.env`:

```bash
GA4_PROPERTY_ID=416080229
```

To find the `client_email` of an inline JSON:

```powershell
node -e "console.log(JSON.parse(process.env.GSC_SERVICE_ACCOUNT_JSON).client_email)"
```

### 3. Bing Webmaster Tools

1. Sign in to [Bing Webmaster Tools](https://www.bing.com/webmasters/) with the Microsoft account that owns the verified `coffey.codes` property.
2. Top-right gear → **Settings → API Access → API Key → Generate**.
3. Copy the key.

Add to `.env`:

```bash
BING_WEBMASTER_API_KEY=<paste-the-key-here>
```

> **Heads up:** Bing Webmaster Tools does not backfill. If the property was added recently, every endpoint will return empty until enough days have accumulated post-verification. This is expected, not a bug. The Q3 SEO audit covers a real instance of this.

### 4. Google Ads Keyword Planner (SPEC-019)

Reuses the GSC service account. One extra UI step in Google Ads, one developer token, two customer IDs.

1. In the [Google Ads UI](https://ads.google.com/) → **Tools** (top-right wrench icon) → **Access and security** → **Add** user → paste the service account email (same one used for GSC and GA4). Permissions: Standard or Read-only.
2. **Tools → API Center** → click **Apply for token** if you don't have one. The basic-access tier is free; auto-approved within minutes for most accounts.
   - Developer tokens are usually issued through a Google Ads Manager (MCC) account. If API Center isn't showing for your standalone account, create a free MCC at https://ads.google.com/home/tools/manager-accounts/, link your existing account to it, then access API Center from the manager.
   - Copy the developer token string.
3. Find the 10-digit customer ID(s) at the top right of the Ads UI. Each account shows its own ID as `123-456-7890`. The scripts strip the dashes automatically, so paste either form into `.env`.
4. The two customer IDs serve different roles:
   - `GOOGLE_ADS_CUSTOMER_ID` = the account you want to query data ABOUT (the **child** account that runs ads, even if no campaigns are active — for coffey.codes this is the `coffey.codes` Ads account).
   - `GOOGLE_ADS_LOGIN_CUSTOMER_ID` = the account that issued the developer token. If the token came from an MCC, this is the **MCC's** 10-digit ID. If the token was issued directly on a standalone account, this is the same value as `GOOGLE_ADS_CUSTOMER_ID`.
   - **The service account email must also be added as a user inside whichever account is `LOGIN_CUSTOMER_ID`.** If `LOGIN_CUSTOMER_ID` is the MCC, add the service account at the MCC level, not just the child.

Add to `.env`:

```bash
GOOGLE_ADS_DEVELOPER_TOKEN=<your-token>
GOOGLE_ADS_CUSTOMER_ID=<10-digits-with-or-without-dashes>
GOOGLE_ADS_LOGIN_CUSTOMER_ID=<10-digits-with-or-without-dashes>
```

> **Account must be enabled before the API will serve data.** New Google Ads accounts sit in a pending / unfinished state until billing is set up (country + payment method on file). The API responds with `CUSTOMER_NOT_ENABLED` until that's done, even for read-only Keyword Planner calls. You will NOT be charged for using Keyword Planner; the card just has to be on file. Fix: **Tools → Billing → Summary** in the Ads UI, complete the setup form.

> **Volume bucket vs precise integer:** accounts without spend history get bucketed volumes (`100-1K`, `1K-10K`, `10K-100K`, `100K+`). Competition (`LOW/MEDIUM/HIGH`) and competition index (0-100) are always precise. Spend history unlocks integer volumes; not a blocker for any of the tooling described below.

## Periscope (the package)

All commands ship via `@anthonycoffey/periscope`, a TypeScript package on GitHub Packages. coffey.codes consumes it as a devDependency; the root `npm run seo:*` scripts call `periscope` directly. One-time setup (PAT + `.npmrc` + `npm install`) is documented in `CLAUDE.md`.

Project-specific paths and ids come from `periscope.config.mjs` at the repo root. The config schema is validated by zod at load. Env vars stay supported for credentials and as fallbacks.

## Verifying the wiring

```powershell
npm run seo:snapshot -- --dry-run
```

Should print:

```
[dry-run] Would pull from gsc, ga4, bing, keywords for window <start> to <end>
```

Or list which engines were skipped and why. If a step is wrong, the error message will name the env var or service that's missing.

## Running snapshots

```powershell
# Full run, 365-day window, all configured engines
npm run seo:snapshot

# Subset
npm run seo:snapshot -- --engines=gsc
npm run seo:snapshot -- --engines=gsc,ga4,keywords

# Custom window
npm run seo:snapshot -- --window=180

# Anchor "today" to a past date. Drives both the output filename
# (snapshot-2026-05-09.json) and the GSC window. Useful for filling
# a few consecutive snapshots in one sitting.
npm run seo:snapshot -- --asof=2026-05-09

# Plan without API calls
npm run seo:snapshot -- --dry-run
```

Output goes to `periscope.config.outputDir` (default: `docs/strategy/data/`). Two files per run, same date stem:

- `snapshot-<YYYY-MM-DD>.json` — full structured data; source of truth for the diff command and any tooling
- `snapshot-<YYYY-MM-DD>.md` — condensed Markdown summary with frontmatter, headline numbers, and per-engine sections. Renders cleanly in any markdown viewer and is the form AI tools should ingest (RAG, search indexers, etc.) since the JSON is too large and structurally noisy for that purpose

The command prints a one-line summary per engine on completion. The markdown renderer lives in periscope's `src/lib/markdown.ts` and runs automatically after the JSON write succeeds.

When the `keywords` engine is enabled, the JSON snapshot also gets a top-level `keywords` key (with `historicalMetrics` + `ideas`) and each `gsc.topQueries` row is enriched in place with `volumeBucket`, `competition`, `competitionIndex`, and `cpcRangeMicros`. Rows the Ads side has no data for gain `_keywordsMatch: false`. The Markdown summary picks the same enrichment up automatically.

## Keyword research tools

Four commands that consume the snapshot + Google Ads API to answer concrete editorial questions. All four require the same `GOOGLE_ADS_*` env vars as the snapshot's `keywords` engine.

```powershell
# Audit existing articles: which ones could target higher-volume keywords?
npm run seo:audit-articles
# -> docs/strategy/data/keyword-audit-articles-<YYYY-MM-DD>.md

# Discover new topic ideas seeded from categories + top GSC queries
npm run seo:discover-topics
# -> docs/strategy/data/keyword-topics-<YYYY-MM-DD>.md

# Validate /lp/* pages: are they targeting realistic-volume keywords?
npm run seo:validate-lps
# -> docs/strategy/data/keyword-lp-validation-<YYYY-MM-DD>.md

# One-shot probe of a competitor URL (stdout only, no file output)
npm run seo:probe -- https://competitor.com/their-post
```

The article auditor and topic discovery read the latest snapshot in `outputDir` for GSC context. If no recent snapshot exists they fall back gracefully but the output is less useful — rerun `seo:snapshot` first when in doubt.

The reports use the bucket order `<100 < 100-1K < 1K-10K < 10K-100K < 100K+` and the competition trio `LOW / MEDIUM / HIGH` for everything. Output is markdown, committed to git like snapshot files. Reruns on the same day overwrite (date in filename, not timestamp).

## Diffing snapshots

```powershell
npm run seo:diff -- <older.json> <newer.json>
```

Prints per-engine totals delta, top-page click delta, new entrants (queries with >=5 impressions absent from older), and fallers (>30% impression drop). When stdout is a TTY, output is colored and box-bordered; piped output strips back to plain text.

## Commit cadence

Snapshots are first-party aggregate data. Commit them.

- **Monthly minimum.** Pull and commit. Headline number in the commit message.
- **Right after material content changes.** A blog post launch, a redirect map, a sitemap change. Lets you attribute future SERP movement.
- **Quarterly audit.** Diff the current snapshot against the same-week snapshot from the prior quarter. The numbers feed the next `docs/strategy/seo-audit-YYYY-QN.md`.

## Bot region exclusion (GA4)

GA4 captures both raw `trafficSources` and a `trafficSourcesExBotRegions` variant that filters out China and Singapore (the audit-identified bot-skew countries). The list comes from `periscope.config.ga4.botRegions` (default: `['China', 'Singapore']`). Update the config and re-snapshot if the bot signature changes.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `Insufficient Permission` from GSC | Service account not added to the property | Re-do step 1.5 |
| `403 ... does not have access` from GA4 | Service account not granted Viewer on the GA4 property | Re-do step 2.2 |
| GA4 silently returns empty rows | Data API not enabled in the Cloud project | Re-do step 2.1 |
| Bing returns `Invalid api key` | Wrong key or key was rotated | Regenerate in the Bing UI |
| Bing returns empty but key is valid | Property was added recently; no data accumulated yet | Wait ~90 days |
| `GSC_SERVICE_ACCOUNT_KEY_PATH points to a file that does not exist` | Relative path didn't resolve | Use an absolute path |
| Google Ads `PERMISSION_DENIED` | Service account not added as a user inside Google Ads, OR added to the child account but `LOGIN_CUSTOMER_ID` points at an MCC the service account isn't on | Re-do step 4.1; add the service account at whichever level `LOGIN_CUSTOMER_ID` points to |
| Google Ads `DEVELOPER_TOKEN_NOT_APPROVED` | Token is in pending state | Apply for the basic-access tier in the Ads UI's API Center |
| Google Ads `INVALID_CUSTOMER_ID` | Customer ID is wrong account | The scripts now strip dashes automatically; if you still see this, recheck the ID at the top right of the Ads UI |
| Google Ads `CUSTOMER_NOT_ENABLED` | Ads account hasn't completed billing setup | Set billing country and add a payment method in Ads UI → Tools → Billing → Summary (no charge for Keyword Planner use) |
| Google Ads HTTP 404 with HTML error page | API version in the engine is sunset | Bump `API_VERSION` constant in `src/engines/ads.ts` in the [periscope repo](https://github.com/anthonycoffey/periscope), publish a new version, `npm update` here. Google deprecates versions ~3 months after release; the engine uses v21 as of 2026-05-11 |
| Google Ads `USER_PERMISSION_DENIED` (or any auth/access uncertainty) | Service account not added to the target customer, or `LOGIN_CUSTOMER_ID` ≠ the Manager account where the developer token lives | Run `npm run seo:doctor -- ads`. It lists which customer IDs the service account can see and names exactly which env id is misaligned. |
| Keyword research scripts return zero ideas | URL probe: target URL is not indexed by Google. Other scripts: seed terms are too generic/specific | Adjust the seed or pick a different URL |
| `[snapshot] no engines returned data; not overwriting any existing snapshot file` | Every engine failed; protective guard fired | Investigate the specific engine errors; existing snapshot file is unchanged |

## Related

- [SPEC-018 (archived)](../../specs/archive/SPEC-018-multi-engine-snapshot.md) — multi-engine snapshot foundation
- [SPEC-019 (archived)](../../specs/archive/SPEC-019-keyword-volume-in-snapshot.md) — Google Ads keyword volume context in the snapshot
- [SPEC-020 (archived)](../../specs/archive/SPEC-020-keyword-research-tools.md) — the four keyword research scripts described above
- [On-page SEO strategy](../deep-dives/onpage-seo-strategy.md) — what the audits measure
- [CTR-by-position baseline](../deep-dives/ctr-by-position-baseline.md) — site-specific CTR curve
- [Quarterly audit folder](../../strategy/) — finished narrative reports
