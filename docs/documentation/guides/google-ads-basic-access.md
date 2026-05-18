---
service: coffey.codes
updated: 2026-05-17
description: Application checklist for upgrading a Google Ads developer token from Test → Basic access so periscope can query production customer accounts. Field-by-field walkthrough, RMF positioning, README requirements, and a privacy/ToS template.
---

# Google Ads Basic Access — application checklist

A freshly minted Google Ads developer token is granted **Test access only**. That means the API works, but every call against a production customer ID returns HTTP 403 `DEVELOPER_TOKEN_NOT_APPROVED`. To run [`periscope audit articles`](../../strategy/data/snapshot-2026-05-17.md) (or any other `seo:*` command) against `coffey.codes`'s real Google Ads account, the token must be upgraded to **Basic access**.

Basic is the right level for periscope — it caps at 15,000 ops/day per token (we use a handful per snapshot) and 1,000 ops/day per `login-customer-id`, which is far more than the tool needs. Standard access only matters for resellers managing many MCC accounts.

Submit the form at <https://ads.google.com/aw/apicenter> → **Basic access** → **Apply for Basic Access**. The review window is 1–5 business days. The most common rejection reason is "use case is unclear or not RMF-compliant" — this doc exists to head off both.

## Before you apply

| Check | Why |
| --- | --- |
| You have a **valid `developer_token`** issued under your MCC (Manager) Ads account. | The token itself is created in API Center → "Token" tab. Apply only after the token exists. |
| The MCC has at least one **linked customer account** with billing set up. | If `CUSTOMER_NOT_ENABLED`, your application will be denied. Run `periscope doctor ads` to confirm the link works in Test mode first. |
| Your tool has a **public-facing description** (page or repo). | Reviewers paste your tool name into a Google search; if nothing turns up, reject is fast. |
| The tool's **README is comprehensive** (see below). | Linked from the form; reviewers click it. |
| You have a **privacy policy / ToS** at a stable URL. | Required by the RMF (Required Minimum Functionality). |

## RMF compliance positioning (this is the section reviewers actually read)

The Google Ads API's [Required Minimum Functionality (RMF)](https://developers.google.com/google-ads/api/docs/policies/required-minimum-functionality) policy says any third-party tool must implement at least one of: campaign management, reporting, account management, or — relevant to us — **research / planning** features. Periscope is squarely in the research/planning bucket. Frame the application that way:

> Periscope is an SEO research tool that analyzes a property's own keyword landscape. It consumes Google Search Console (real ranking queries) as the primary data source and supplements with Google Ads' Keyword Planner (`KeywordPlanIdeaService`, `KeywordPlanService.generateKeywordHistoricalMetrics`) to enrich GSC queries with search-volume and competition data, and to surface adjacent keyword ideas for articles that lack GSC coverage yet. The operator authenticates as themselves against their own Google Ads account; the tool does not aggregate data across customers, does not modify campaigns, and does not pull data for accounts the operator isn't already authorized on.

That paragraph touches all the boxes Google looks for: *what the tool is*, *which API surfaces it uses*, *which RMF category*, and the negative space (*what it doesn't do*).

## Periscope repo / README requirements

The reviewer will check the public repo to confirm the tool is real and that the use case matches the application. Periscope's README at <https://github.com/anthonycoffey/periscope> already satisfies the requirements; if it ever stops, fix it before re-applying:

- [x] **What it does** — table of commands, plain language.
- [x] **How to install** — concrete `npm install` instructions including the GitHub Packages PAT step.
- [x] **Configuration** — sample `periscope.config.mjs` showing required + optional fields.
- [x] **Auth model** — table of which env vars feed which engine.
- [x] **Public source** — repository is browsable and the link from the API Center form lands on it (not a redirect, not a private mirror).
- [x] **License** — MIT.

## Privacy policy / ToS template

Periscope is a CLI run locally against the operator's own credentials, so a single short page covers both. Either host it on `coffey.codes/legal/periscope/` or as `PRIVACY.md` in the periscope repo and link to it.

```markdown
# Periscope — Privacy and Terms

## Data collected
Periscope is a command-line tool run on your local machine against your own
Google credentials. It does not have a backend, does not collect telemetry,
does not transmit data to any third party other than the Google APIs you
explicitly configure (Search Console, GA4, Bing Webmaster Tools, Google Ads).

## Data storage
All data the tool retrieves is written to local files in your project's
configured `outputDir` (default `docs/strategy/data/`). Data never leaves
your machine via Periscope itself; whether you commit the output to a git
repository is your choice.

## Credentials
Periscope reads credentials from environment variables and JSON key files on
your local filesystem. It never prints credentials in logs (developer token,
access token, and service-account private key are scrubbed from all output).

## Third-party services
Periscope queries the following Google APIs on your behalf using credentials
you configure:
- Google Search Console (`webmasters.readonly`)
- Google Analytics Data API
- Google Ads API (`adwords` scope)
Each service's own privacy policy and Terms of Service govern data retrieved
from them.

## Liability
Periscope is MIT-licensed and provided "as is", without warranty of any kind.

## Contact
coffey.j.anthony@gmail.com
```

## Form: field-by-field guidance

When you submit at <https://ads.google.com/aw/apicenter>, expect these fields. Recommended answers (adjust for your contact info):

| Field | Answer |
| --- | --- |
| **Tool name** | Periscope |
| **Tool URL** | https://github.com/anthonycoffey/periscope |
| **Privacy policy URL** | URL of the policy you hosted from the template above |
| **Tool description** | Use the RMF positioning paragraph from above. |
| **Use case** | Research / planning. Specifically: enriching the operator's own Google Search Console query data with Google Ads search-volume and competition; surfacing adjacent keyword ideas for under-performing pages. |
| **Which Ads API services do you use?** | `KeywordPlanIdeaService` (`generateKeywordIdeas`, `generateKeywordIdeasFromUrl`), `KeywordPlanService.generateKeywordHistoricalMetrics`, `CustomerService.listAccessibleCustomers`. |
| **Will you store Google Ads data?** | Yes, locally on the operator's filesystem only, as part of the snapshot output. Not transmitted to any third party. |
| **Are you charging users?** | No (open-source tool, MIT-licensed). |
| **Approximate daily call volume per token** | <100 (per-property snapshots fire <10 calls; the cache absorbs the rest). |
| **Multi-tenant?** | No. Each operator authenticates with their own Google credentials against their own account. |

## After submission

1. Watch the email associated with the MCC for the decision. The first response is usually a confirmation that the application is queued.
2. If approved, the developer token's access level flips to Basic. **No code change needed.** Re-run `periscope doctor ads`; the previously 403'd calls should now succeed.
3. If rejected, the email lists the specific RMF criterion that wasn't satisfied. Address it (usually a doc/site gap, not a code gap), then re-submit.

## What to do while you wait

The application can take several business days. In the meantime, `periscope audit articles` already operates **GSC-first** as of 1.2.0 — verdicts (`TITLE_QUERY_DRIFT`, `STRIKING_DISTANCE`, `CANNIBALIZATION`, `WELL_TARGETED`, `GHOST`) all derive from Search Console data and need no Ads access. Only the optional Ads enrichment for GHOST articles is blocked, and the keyword-ideas cache covers most of that gap on rerun.

Read the categorized error message periscope prints on rejection; it tells you which fix path applies (apply for Basic, switch to a test account, enable billing, etc.). See [`src/lib/ads-error-classify.ts`](https://github.com/anthonycoffey/periscope/blob/main/src/lib/ads-error-classify.ts) for the full category map.

## Related

- [seo-snapshot-setup.md](./seo-snapshot-setup.md) — the canonical wiring guide for the snapshot script.
- [Periscope README](https://github.com/anthonycoffey/periscope) — the public surface reviewers will click through to.
- [SPEC-024](../../specs/active/SPEC-024-periscope-gsc-first-audit-ads-quota.md) — the spec behind the GSC-first audit and error classification that make Basic access optional rather than blocking.
