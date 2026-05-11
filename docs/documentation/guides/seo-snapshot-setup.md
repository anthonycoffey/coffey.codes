---
service: coffey.codes
updated: 2026-05-11
description: How to wire and run the three-engine SEO snapshot script (GSC + GA4 + Bing). Setup, env vars, common runs, commit cadence.
---

# SEO snapshot setup

`scripts/seo-snapshot.mjs` pulls Google Search Console, GA4, and Bing Webmaster Tools into a single dated JSON file in `docs/strategy/data/`. `scripts/seo-snapshot-diff.mjs` reports the delta between two snapshots. Both ship under SPEC-018.

This guide is the consolidated walk-through for getting credentials in place and running the script. The script header in `scripts/seo-snapshot.mjs` is the authoritative spec.

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

## Verifying the wiring

```powershell
node scripts/seo-snapshot.mjs --dry-run
```

Should print:

```
[dry-run] Would pull from gsc, ga4, bing for window <start> to <end>
```

Or list which engines were skipped and why. If a step is wrong, the error message will name the env var or service that's missing.

## Running snapshots

```powershell
# Full run, 365-day window, all configured engines
node scripts/seo-snapshot.mjs

# Subset
node scripts/seo-snapshot.mjs --engines=gsc
node scripts/seo-snapshot.mjs --engines=gsc,ga4

# Custom window
node scripts/seo-snapshot.mjs --window=180

# Plan without API calls
node scripts/seo-snapshot.mjs --dry-run
```

Output goes to `docs/strategy/data/snapshot-<YYYY-MM-DD>.json`. The script prints a one-line summary per engine on completion.

## Diffing snapshots

```powershell
node scripts/seo-snapshot-diff.mjs <older.json> <newer.json>
```

Prints per-engine totals delta, top-page click delta, new entrants (queries with >=5 impressions absent from older), and fallers (>30% impression drop). When stdout is a TTY, output is colored and box-bordered; piped output strips back to plain text.

## Commit cadence

Snapshots are first-party aggregate data. Commit them.

- **Monthly minimum.** Pull and commit. Headline number in the commit message.
- **Right after material content changes.** A blog post launch, a redirect map, a sitemap change. Lets you attribute future SERP movement.
- **Quarterly audit.** Diff the current snapshot against the same-week snapshot from the prior quarter. The numbers feed the next `docs/strategy/seo-audit-YYYY-QN.md`.

## Bot region exclusion (GA4)

GA4 captures both raw `trafficSources` and a `trafficSourcesExBotRegions` variant that filters out China and Singapore (the audit-identified bot-skew countries). The list is hard-coded in `scripts/seo-snapshot.mjs` per SPEC-018 must-have #5. If the bot signature changes, edit the constant and ship a new SPEC.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `Insufficient Permission` from GSC | Service account not added to the property | Re-do step 1.5 |
| `403 ... does not have access` from GA4 | Service account not granted Viewer on the GA4 property | Re-do step 2.2 |
| GA4 silently returns empty rows | Data API not enabled in the Cloud project | Re-do step 2.1 |
| Bing returns `Invalid api key` | Wrong key or key was rotated | Regenerate in the Bing UI |
| Bing returns empty but key is valid | Property was added recently; no data accumulated yet | Wait ~90 days |
| `GSC_SERVICE_ACCOUNT_KEY_PATH points to a file that does not exist` | Relative path didn't resolve | Use an absolute path |

## Related

- [SPEC-018 spec](../../specs/active/SPEC-018-multi-engine-snapshot.md) (or archive if completed)
- [On-page SEO strategy](../deep-dives/onpage-seo-strategy.md) — what the audits measure
- [CTR-by-position baseline](../deep-dives/ctr-by-position-baseline.md) — site-specific CTR curve
- [Quarterly audit folder](../../strategy/) — finished narrative reports
