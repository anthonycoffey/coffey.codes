---
title: 'SEO audit, 2026 Q2'
date: 2026-05-10
spec: SPEC-015
window: '2025-05-08 to 2026-05-07 (365 days)'
status: frozen-snapshot
author: Anthony Coffey
---

# SEO audit, 2026 Q2

Frozen data snapshot. Numbers are what they were on the date in the frontmatter; do not edit retroactively. A follow-up content-strategy spec uses this as input.

## 1. Scope, data sources, date range

Property: `sc-domain:coffey.codes` (Domain property, GSC, siteOwner). Canonical host: `https://coffey.codes`.

Window: **2025-05-08 to 2026-05-07** (365 days). All `analytics_query` pulls used `dataState: final`.

Data sources:

| Engine | Status | Notes |
| --- | --- | --- |
| Google Search Console | Authenticated, full data | 365 days available |
| Bing Webmaster Tools | Authenticated, returned empty data | `bing_analytics_query` and `bing_opportunity_finder` returned `[]` for 180-day window. `compare_engines` rejected the URL with `InvalidUrl`. Treated as "no recorded Bing impressions in window" per spec edge case. |
| GA4 (`416080229`) | Authenticated, contradicting the spec's `✘ GA4` note from 2026-05-10 | `analytics_realtime` and 180-day historical pulls both returned data. Section 9.5 uses GA4. |
| Ahrefs MCP | **Not used** (gated by plan tier) | Per SPEC-015 must-have requirement #2 |

Tools called (search-console MCP, package `search-console-mcp@1.13.5`):

`sites_list`, `sites_health_check`, `sitemaps_list`, `analytics_time_series`, `analytics_trends`, `analytics_anomalies`, `analytics_query` (page, query, country, device dimensions), `seo_striking_distance`, `seo_low_hanging_fruit`, `seo_cannibalization`, `seo_lost_queries`, `bing_sites_list`, `bing_analytics_query`, `bing_opportunity_finder`, `compare_engines`, `opportunity_matrix`, `page_analysis`, `analytics_traffic_sources`, `analytics_organic_landing_pages`, `analytics_user_behavior`, `inspection_inspect` (top 5 pages), `schema_validate` (top 3 article pages).

Tool not called: `pagespeed_analyze`. Rate-limited at audit time; perf work is already scoped under SPEC-014 (in flight) and reading PSI scores here would not change that scope.

## 2. Top-level GSC summary (365 days)

Aggregate, derived from device breakdown (most reliable totals):

| Metric | Value |
| --- | --- |
| Clicks | 1,149 |
| Impressions | 293,559 |
| CTR | 0.39% |
| Avg position | 6.95 |

Trend (weekly clicks, 4-week rolling average):

| Period | Avg weekly clicks | Avg position |
| --- | --- | --- |
| 2025-05 (start of window) | 1.75 | 15.65 |
| 2025-08 | 17.75 | 10.04 |
| 2025-11 (peak) | **35.5** | 6.93 |
| 2026-02 | 27.25 | 6.37 |
| 2026-05 (end of window) | 15.5 | 6.80 |

Position improved from ~15 to ~7 over the year. Clicks peaked in Sept-Nov 2025 at ~35-45/week, then declined to 15-20/week by end of window. Impressions grew 100x (77 in 2025-05-05 week to 12,623 peak in 2026-01-26 week) but click rate did not keep pace, suggesting visibility-without-CTR is the dominant pattern.

`sites_health_check` flagged: clicks down 27.3% week-over-week (2026-04-22 to 2026-04-29 vs 2026-04-30 to 2026-05-07).

Anomalies: one click spike on **2026-03-11** (9 clicks vs 3 expected, 198.91% deviation).

Sitemap health (`sitemaps_list`): `https://coffey.codes/sitemap.xml`, last submitted 2025-10-04, last downloaded 2026-05-08, 0 errors, 0 warnings, **161 URLs submitted, `indexed: "0"` reported**. The "0 indexed" figure is GSC's sitemap-channel attribution; spot-checks on the top 5 pages all return `coverageState: "Submitted and indexed"`, so the discrepancy is reporting attribution lag, not an indexing failure.

## 3. Top performing pages (365 days, by clicks)

| Page | Clicks | Impressions | CTR | Avg position |
| --- | --- | --- | --- | --- |
| [/articles/building-location-based-features-using-expo-location](app/(site)/articles/posts/building-location-based-features-using-expo-location.mdx) | 388 | 150,793 | 0.26% | 6.75 |
| [/articles/vibe-coding-building-an-app-entirely-with-ai-prompts](app/(site)/articles/posts/vibe-coding-building-an-app-entirely-with-ai-prompts.mdx) | 248 | 9,038 | 2.74% | 8.47 |
| [/articles/slow-android-emulator-flutter-dev](app/(site)/articles/posts/slow-android-emulator-flutter-dev.mdx) | 236 | 71,131 | 0.33% | 5.85 |
| [/articles/managing-secrets-firebase-apphosting-yaml-nextjs](app/(site)/articles/posts/managing-secrets-firebase-apphosting-yaml-nextjs.mdx) | 180 | 43,482 | 0.41% | 7.46 |
| [/articles/react-19-features-and-design-patterns](app/(site)/articles/posts/react-19-features-and-design-patterns.mdx) | 52 | 15,131 | 0.34% | 8.61 |
| /Anthony%20Coffey%20-%20Resume.pdf | 15 | 464 | 3.23% | 39.80 |
| [/articles/authorize-net-for-react-native-expo-sdk-49](app/(site)/articles/posts/authorize-net-for-react-native-expo-sdk-49.mdx) | 15 | 885 | 1.69% | 11.48 |
| / | 4 | 310 | 1.29% | 13.89 |
| /contact | 4 | 221 | 1.81% | 26.36 |
| [/articles/setting-up-ci-cd-for-firebase-functions-using-github-actions](app/(site)/articles/posts/setting-up-ci-cd-for-firebase-functions-using-github-actions.mdx) | 3 | 594 | 0.51% | 12.07 |

Five articles account for 1,104 of 1,149 clicks (96%). Concentration is heavy.

The top page (`building-location-based-features-using-expo-location`) ranks at position 6.75 with 0.26% CTR, against a Google CTR-by-position curve expectation of roughly 5-7% at that position. The 150,793 impressions are not converting to clicks at the expected rate, which directly motivates quick win #1 in section 13.

The 90-day trend (`analytics_trends`):

| Page | Direction | Change | Current | Previous |
| --- | --- | --- | --- | --- |
| building-location-based-features-using-expo-location | rising | +20.45% | 53 | 44 |
| managing-secrets-firebase-apphosting-yaml-nextjs | declining | -60% | 6 | 15 |
| slow-android-emulator-flutter-dev | declining | -16% | 42 | 50 |
| vibe-coding-building-an-app-entirely-with-ai-prompts | declining | -33.33% | 10 | 15 |

Three of the top four are declining. The "freshness gap" hypothesis (none of these have `dateModified` distinct from `datePublished`, see section 14) is consistent with this.

## 4. Top performing queries (365 days, by clicks)

| Query | Clicks | Impressions | CTR | Avg position |
| --- | --- | --- | --- | --- |
| flutter vibe coding | 49 | 1,075 | 4.56% | 8.38 |
| expo location | 24 | 9,656 | 0.25% | 7.73 |
| vibe coding flutter | 24 | 648 | 3.70% | 8.26 |
| vibe coding flutter app | 15 | 218 | 6.88% | 7.39 |
| expo-location | 10 | 5,285 | 0.19% | 6.60 |
| vibe code flutter app | 9 | 157 | 5.73% | 7.55 |
| expo geofencing | 7 | 216 | 3.24% | 7.58 |
| firebase apphosting:secrets:grantaccess | 7 | 386 | 1.81% | 6.16 |
| firebase apphosting:secrets:set | 6 | 192 | 3.13% | 5.45 |
| vibe code flutter | 6 | 144 | 4.17% | 8.21 |

Two query clusters dominate:

1. **Vibe-coding cluster** (six top-10 queries, all variants of "vibe coding flutter"): combined 109 clicks, 2,290 impressions, 4.76% CTR. High-intent, branded-feeling queries. CTR is healthy.
2. **Expo Location cluster** ("expo location", "expo-location", function-name long-tails): combined 34 clicks against 14,941 impressions, 0.23% CTR. Position is fine (avg ~7), but impressions are dwarfing clicks. Title and snippet are losing the SERP click decision.

Branded query "anthony coffey": **0 clicks, 99 impressions, position 14.5** on the homepage. The site is not ranking on its own author name.

No `analytics_trends` results returned for queries with the chosen thresholds (`minClicks: 5`, `threshold: 20%`), which means no individual query crossed the rising/declining bar at 90 days.

## 5. Striking distance (positions 8-15, 365 days)

`seo_striking_distance` returned 25 queries. Heavily concentrated on `building-location-based-features-using-expo-location`:

| Query | Page | Position | Impressions | Clicks |
| --- | --- | --- | --- | --- |
| expo-location permissionstatus.granted | building-location-based... | 8.41 | 1,141 | 0 |
| flutter vibe coding | vibe-coding-building... | 8.38 | 1,075 | 49 |
| vibe coding flutter | vibe-coding-building... | 8.26 | 648 | 24 |
| apphosting.yaml | managing-secrets-firebase... | 8.45 | 448 | 2 |
| next_public_firebase_api_key | managing-secrets-firebase... | 9.30 | 345 | 1 |
| firebase app hosting environment variables | managing-secrets-firebase... | 9.19 | 211 | 1 |
| expo background location | building-location-based... | 8.20 | 202 | 0 |
| expo-location requestforegroundpermissionsasync returns status granted | building-location-based... | 8.28 | 172 | 0 |
| location expo | building-location-based... | 8.65 | 166 | 1 |
| expo-location hasservicesenabledasync | building-location-based... | 9.55 | 137 | 0 |
| anthony coffey | / (homepage) | 14.51 | 99 | 0 |
| react 19 best practices | react-19-features-and-design-patterns | 9.65 | 71 | 2 |

Pattern: 14 of the top 25 striking-distance queries point at the Expo Location article. They are function-name long-tails (`requestForegroundPermissionsAsync`, `hasServicesEnabledAsync`, `permissionStatus.granted`). Position is fine but clicks are 0 because the article's title does not match the query intent (the article is titled "Building Location-Based Features Using Expo Location"; the searcher wants "expo-location requestForegroundPermissionsAsync example"). This is a section-anchor opportunity (heading-as-deep-link) rather than a new article.

## 6. Low hanging fruit (high impressions, low CTR, 365 days)

`seo_low_hanging_fruit` (potential clicks at expected position-curve CTR):

| Query | Impressions | Clicks | CTR | Position | Potential clicks |
| --- | --- | --- | --- | --- | --- |
| expo location | 9,656 | 24 | 0.25% | 7.73 | **1,424** |
| expo-location | 5,285 | 10 | 0.19% | 6.60 | 783 |
| expo-location requestforegroundpermissionsasync getcurrentpositionasync example | 1,267 | 0 | 0% | 5.97 | 190 |
| expo-location requestforegroundpermissionsasync getcurrentpositionasync | 1,185 | 0 | 0% | 7.36 | 178 |
| expo-location permissionstatus.granted | 1,141 | 0 | 0% | 8.41 | 171 |
| location.permissionstatus.granted expo-location | 866 | 0 | 0% | 7.49 | 130 |
| flutter vibe coding | 1,075 | 49 | 4.56% | 8.38 | 112 |
| expo-location requestforegroundpermissionsasync | 676 | 0 | 0% | 6.83 | 101 |
| expo-location requestforegroundpermissionsasync status granted | 623 | 0 | 0% | 7.73 | 93 |
| expo-location locationobject timestamp milliseconds | 503 | 0 | 0% | 7.25 | 75 |

Top item ("expo location") implies ~1,400 clicks left on the table at the page's current rank. The full top-25 list represents roughly 3,600 potential clicks vs. the 88 actual on those rows.

## 7. Cannibalization

`seo_cannibalization` (`days: 365`, `minImpressions: 50`) returned `[]`. No cannibalization detected in the window. This is consistent with a small editorial corpus (26 articles, no overlapping topics within a single search intent).

## 8. Lost queries (90-day comparison)

`seo_lost_queries` returned one entry:

| Query | Page | Previous clicks | Current clicks | Lost |
| --- | --- | --- | --- | --- |
| vibe coding flutter app | vibe-coding-building... | 7 | 0 | 7 |

Limited signal. The vibe-coding cluster as a whole is declining (page-level trend was -33.33% in section 3), so the loss on this specific phrasing is consistent with the broader pattern, not a single isolated query drop.

## 9. Bing comparison

`bing_sites_list` confirms `https://coffey.codes/` is verified at Bing Webmaster Tools (`IsVerified: true`).

`bing_analytics_query` returned `[]` for the requested 180-day window (Bing's API window cap). `bing_opportunity_finder` also returned `[]`. `compare_engines` rejected the call with `400 InvalidUrl` (Bing's `compare` endpoint disagrees with the GSC siteUrl format used).

Interpretation: Bing has either zero or near-zero recorded impressions for this property over the queried window, OR Bing Webmaster Tools is collecting data but the API surface is not exposing it through these tools for this property. Given that GA4 (section 9.5) records 114 organic Bing sessions in the same 180-day window, the latter is more likely.

Action: do not normalize Google numbers against Bing in this audit; treat Bing as not-measurable from this MCP for now. Re-test in the next quarterly audit.

## 9.5 GA4 cross-reference (180 days, 2025-11-08 to 2026-05-07)

GA4 propertyId `416080229`. The window is 180 days because GSC and GA4 retention behave differently and the GA4 organic-landing-page report aligns better at 180.

### Traffic sources (sessions)

| Channel | Source | Sessions |
| --- | --- | --- |
| Direct | (direct) / (none) | 5,465 |
| Organic Search | google / organic | 847 |
| Organic Search | bing / organic | 114 |
| Unassigned | (not set) | 80 |
| Organic Search | duckduckgo / organic | 44 |
| Organic Social | m.facebook.com / referral | 31 |
| Referral | github.com / referral | 27 |
| Referral | chatgpt.com / referral | 24 |
| Referral | vercel.com / referral | 24 |
| Organic Social | facebook.com / referral | 22 |
| Referral | gemini.google.com / referral | 9 |
| Organic Social | linkedin.com / referral | 6 |

The 5,465 Direct sessions account for 84% of all traffic, which is much higher than the typical 30-40% baseline. Combined with the country breakdown below, this is bot contamination, not real visitors.

ChatGPT (24) and Gemini (9) referrals confirm AI-assistant citation traffic exists. It is small but real.

### Country and device (180 days, GA4)

| Country | Sessions | Active users |
| --- | --- | --- |
| United States | 4,087 | 3,797 |
| China | **863** | **856** |
| Singapore | **668** | **667** |
| India | 136 | 87 |
| Germany | 107 | 87 |
| France | 56 | 50 |
| United Kingdom | 55 | 38 |
| Netherlands | 42 | 34 |

GSC's same-window top countries (real human searchers): USA, India, Germany, UK, France. **China and Singapore do not appear in GSC's top 25**. The 863 China + 668 Singapore GA4 sessions, combined with the Direct-channel skew above, are bot/scraper traffic. Engagement rate is 17% overall, but mobile is 43.5% (closer to typical human range).

| Device | Active users | Sessions | Engagement rate |
| --- | --- | --- | --- |
| desktop | 5,702 | 6,363 | 15.4% |
| mobile | 362 | 425 | 43.5% |
| tablet | 3 | 4 | 50.0% |

Desktop is dominated by the bot contamination. Mobile's 43.5% engagement is the cleaner human signal.

### Organic landing pages (180 days, GA4)

| Landing page | Sessions | Bounce rate | Engagement rate | Avg duration (s) | Conversions |
| --- | --- | --- | --- | --- | --- |
| /articles/building-location-based-features-using-expo-location | 292 | 39.4% | 60.6% | 183.5 | 1 |
| (not set) | 191 | 97.9% | 2.1% | 4.7 | 0 |
| /articles/vibe-coding-building-an-app-entirely-with-ai-prompts | 186 | 40.3% | 59.7% | 137.1 | 0 |
| /articles/slow-android-emulator-flutter-dev | 161 | 51.6% | 48.4% | 189.1 | 0 |
| /articles/managing-secrets-firebase-apphosting-yaml-nextjs | 89 | 34.8% | 65.2% | 293.4 | 1 |
| /articles/react-19-features-and-design-patterns | 46 | 54.3% | 45.7% | 118.4 | 0 |
| / | 12 | 41.7% | 58.3% | 53.7 | **3** |
| /articles/preventing-unnecessary-re-renders-in-react-apps | 12 | 33.3% | 66.7% | 269.6 | 0 |
| /articles/authorize-net-for-react-native-expo-sdk-49 | 11 | 36.4% | 63.6% | 102.2 | 0 |

Conversions in the window: 5 total across organic-landing pages. Three are on the homepage (`/`, 12 sessions, **25% conversion rate**). One each on `building-location-based-features` and `managing-secrets-firebase`. The contact form is the conversion goal; the homepage is converting at a higher rate per-session than any article.

### Page-level GSC + GA4 overlay (`page_analysis`, 90 days)

| URL | GSC clicks | GA4 sessions | clicks/sessions | Notes |
| --- | --- | --- | --- | --- |
| /articles/slow-android-emulator-flutter-dev | 92 | 1 | 0.01 | **GA4 undercounting** or the page is hit by bots not retained by GA4. Signal: do not trust GA4 numbers in isolation for this article. |
| /articles/setting-up-ci-cd-for-firebase-functions-using-github-actions | 1 | 1 | 1 | Tiny sample. |
| /contact | 1 | 2 | 2 | Direct traffic mostly. |
| /articles/building-location-based-features-using-expo-location | 97 | 110 | 1.13 | Healthy ratio. |
| /articles/managing-secrets-firebase-apphosting-yaml-nextjs | 21 | 24 | 1.14 | Healthy. |
| /articles/vibe-coding-building-an-app-entirely-with-ai-prompts | 25 | 70 | 2.80 | More GA4 sessions than GSC clicks suggests organic-non-search traffic (referrals, direct). The 70 GA4 sessions on this article match the AI-citation channel (ChatGPT/Gemini referrals, GitHub) plausibly. |

`opportunity_matrix` (90 days) priority scores:

| URL | Priority | Action |
| --- | --- | --- |
| building-location-based-features-using-expo-location | 9.7 | Optimize content |
| slow-android-emulator-flutter-dev | 9.2 | Optimize content |
| vibe-coding-building-an-app-entirely-with-ai-prompts | 2.5 | Optimize content |
| managing-secrets-firebase-apphosting-yaml-nextjs | 2.1 | Optimize content |

Top two have a 4x priority margin over the rest.

## 10. Per-pillar breakdown

Pillars derived from frontmatter `category` field on `app/(site)/articles/posts/*.mdx`. 365-day window, top-50 pages by clicks.

| Pillar | Posts | Clicks | Impressions | Top page (clicks) |
| --- | --- | --- | --- | --- |
| Mobile Development | 3 | 651 | 160,716 | building-location-based-features-using-expo-location (388) |
| Cloud & DevOps | 6 | 183 | 44,076 | managing-secrets-firebase-apphosting-yaml-nextjs (180) |
| Web Development | 8 | 53 | 19,357+ | react-19-features-and-design-patterns (52) |
| Tools & Productivity | 4 | 2 | 706 | how-to-end-a-process-by-port-number (2) |
| Software Engineering | 4 | 0 | 0 | (no posts in top 50 by clicks) |
| **"Development"** (data quality issue) | 1 | 236 | 71,131 | slow-android-emulator-flutter-dev (236) |

Non-article pages: 23 clicks combined (`/Anthony Coffey - Resume.pdf` 15, `/` 4, `/contact` 4, `/articles` 0).

Two findings:

1. **Pillar concentration is extreme.** Mobile + the misnamed "Development" pillar account for 887 clicks; everything else combines to 261. If the misnamed post is recategorized to Mobile Development (where it belongs by topic), Mobile = 887, the rest = 261. **Mobile Development carries 77% of organic clicks** in the window.
2. **Software Engineering pillar shows zero traffic** in the top 50 across 4 articles, all with publishedAt dates from 2023 and 2024. Either the topics (clean code, JS design patterns, debugging tips, pytest) are over-saturated SERPs, or the older articles need refresh. Either way, this pillar is not earning impressions, not just not earning clicks.

## 10a. Data quality finding: misnamed category

[`slow-android-emulator-flutter-dev.mdx`](app/(site)/articles/posts/slow-android-emulator-flutter-dev.mdx) has `category: "Development"` in its frontmatter. The category route at `/articles/category/development` is GSC-indexed (1 impression, position 10) and was a referrer in `inspection_inspect`. Every other post uses one of the five canonical categories. Recommended fix: change frontmatter to `Mobile Development` and let the redirect / 404 settle the orphan category route.

## 11. Country and device breakdown (GSC, 365 days)

### Country

| Country | Clicks | Impressions | CTR | Avg position |
| --- | --- | --- | --- | --- |
| USA | 183 | 169,795 | 0.11% | 6.88 |
| India | 85 | 11,741 | 0.72% | 7.10 |
| Germany | 71 | 4,945 | 1.44% | 6.62 |
| UK | 47 | 11,724 | 0.40% | 5.82 |
| France | 43 | 4,060 | 1.06% | 7.40 |
| Canada | 35 | 6,793 | 0.52% | 7.25 |
| Spain | 35 | 3,249 | 1.08% | 7.24 |
| Belgium | 30 | 1,048 | 2.86% | 6.43 |
| Italy | 27 | 2,662 | 1.01% | 7.86 |
| Indonesia | 26 | 2,984 | 0.87% | 6.36 |

USA gets 58% of impressions but only 16% of clicks. Smaller markets (Germany 1.44%, Belgium 2.86%, Spain 1.08%) convert impressions to clicks at 5-25x the USA's rate at similar positions. The USA SERP is more competitive on these queries.

### Device

| Device | Clicks | Impressions | CTR | Avg position |
| --- | --- | --- | --- | --- |
| Desktop | 910 | 261,479 | 0.35% | 7.19 |
| Mobile | 233 | 27,682 | 0.84% | 4.78 |
| Tablet | 6 | 4,398 | 0.14% | 6.66 |

Mobile CTR is 2.4x desktop's at a better average position (4.78 vs 7.19). Desktop carries 91% of impressions, typical for dev content, but mobile's click rate is meaningfully better.

## 12. On-page health spot checks (top 5 pages by clicks)

`inspection_inspect` results:

| Page | Verdict | Coverage | Last crawled | Crawled as |
| --- | --- | --- | --- | --- |
| building-location-based-features-using-expo-location | PASS | Submitted and indexed | 2026-04-29 | MOBILE |
| vibe-coding-building-an-app-entirely-with-ai-prompts | PASS | Submitted and indexed | 2026-05-07 | MOBILE |
| slow-android-emulator-flutter-dev | PASS | Submitted and indexed | 2026-04-27 | MOBILE |
| managing-secrets-firebase-apphosting-yaml-nextjs | PASS | Submitted and indexed | 2026-04-06 | MOBILE |
| react-19-features-and-design-patterns | PASS | Submitted and indexed | 2026-04-09 | MOBILE |

All five pass mobile-first crawl. `richResultsResult` reports `Breadcrumbs` detected on three of the five (the Firebase secrets and React 19 pages report no rich results, despite having valid BreadcrumbList JSON-LD per `schema_validate`). Plausible cause: API summary lag rather than a missing schema, since the schema_validate output below confirms all three articles have a complete BreadcrumbList.

`schema_validate` results (3 of top 5 articles):

| Page | Schemas detected | Issues |
| --- | --- | --- |
| building-location-based-features-using-expo-location | Person, WebSite, BlogPosting, BreadcrumbList | `dateModified === datePublished` (2025-03-24); no `articleSection` mismatch (correctly "Mobile Development") |
| managing-secrets-firebase-apphosting-yaml-nextjs | Person, WebSite, BlogPosting, BreadcrumbList | `dateModified === datePublished` (2025-03-14) |
| react-19-features-and-design-patterns | Person, WebSite, BlogPosting, BreadcrumbList | `dateModified === datePublished` (2025-03-17) |

All schemas are valid (`valid: true`, `errors: []`). `Person.sameAs` is populated with GitHub, LinkedIn, Linktr.ee. `Organization` publisher is present with logo. SPEC-013's hardening landed correctly.

`pagespeed_analyze` was not pulled (rate-limited at audit time). SPEC-014 (in flight) is the active perf-work spec; this audit defers all perf reads to that workstream.

## 13. Findings and prioritized recommendations

### Quick wins (ship now, each cited from data above)

1. **Rewrite the Expo Location article's `<title>` and `meta description` to lead with the function-name long-tails.** The article is at average position 6.75 with **0.26% CTR** on **150,793 impressions** (section 3). The 25 striking-distance queries in section 5 include `expo-location requestforegroundpermissionsasync`, `expo-location permissionstatus.granted`, `expo-location hasservicesenabledasync`, `reversegeocodeasync`. None of these tokens appear in the current article title ("Building Location-Based Features Using Expo Location"). Title rewrite target: surface the most-searched function names. `seo_low_hanging_fruit` puts the recoverable click count at **1,424 for "expo location" alone** at the current rank (section 6).

2. **Add `id`-anchored subheadings for each Expo Location function** so each long-tail query lands on a deep section, not the article top. The React 19 article already has `#actions-api`, `#streaming-patterns`, `#react-compiler` etc. ranking at positions 6.0-6.4 with 371-797 impressions each (section 9.5 `page_analysis`). The same anchor pattern on Expo Location would give Google something to deep-link to for `requestForegroundPermissionsAsync`-style queries that currently get 0 clicks at position ~7 (section 6 rows 3-9, totaling ~640 impressions across function-name queries with 0 clicks).

3. **Recategorize [slow-android-emulator-flutter-dev.mdx](app/(site)/articles/posts/slow-android-emulator-flutter-dev.mdx) from `Development` to `Mobile Development`.** The article has 236 clicks and 71,131 impressions (section 3) but its category route `/articles/category/development` exists outside the canonical pillar set, splitting traffic from the Mobile Development pillar listing. One-line frontmatter edit. Section 10a documents.

4. **Add a `<title>` and `<meta description>` for the homepage `/` that targets the author name.** "anthony coffey" is at position 14.5 with 99 impressions and 0 clicks (section 5). The site is not winning its own author name. Section 9.5 shows the homepage is the highest-converting landing page (3 of 5 conversions on 12 sessions). Combining (a) it converts and (b) it does not rank for the obvious branded query is the cheapest fix on this list.

### Medium efforts

5. **Refresh four articles in the Software Engineering pillar.** Section 10 shows zero clicks across 4 posts (`embracing-clean-code-principles`, `javascript-design-patterns`, `tips-for-troubleshooting-and-debugging-code`, `unit-testing-in-python-with-pytest`), all with 2023 or 2024 publish dates. Either deprecate or refresh with current examples and bump `dateModified`.

6. **Set `dateModified` from the file's last-edit timestamp**, not the publish date. All three article schemas validated in section 12 show `dateModified === datePublished`. Confirms the SPEC-013 nice-to-have outstanding item is still worth doing (section 14). Effort: small change in [app/(site)/articles/[slug]/page.tsx](app/(site)/articles/[slug]/page.tsx) BlogPosting block.

7. **Filter GA4 reports to exclude the bot-skewed traffic.** Section 9.5 shows 863 China and 668 Singapore sessions with engagement contradicting GSC's country distribution. Add a GA4 audience or filter to exclude Direct + non-search-driven traffic from those regions for any internal reporting that uses GA4 as ground truth.

### Strategic plays (deferred to follow-up content-strategy spec)

These are out of scope for this audit. Listed here as data the strategy spec should consume:

- The Mobile Development pillar carries 77% of clicks. Whether to double down or rebalance is a strategy call.
- The vibe-coding cluster has the highest CTR (4-7%) but lowest impressions. Three of the four top articles are declining. A second post in this cluster (or a refresh) is plausible.
- The AI-citation channel (ChatGPT 24, Gemini 9 referrals in section 9.5) is small but real. There is no current measurement for "what cites the site". Content optimized for AI-assistant citation is a different shape than content optimized for SERP CTR.
- USA traffic converts at 0.11% CTR vs 1.4-2.9% in EU markets at similar positions (section 11). Whether to write for the more competitive market or lean into the markets that already convert is a strategy call.

## 14. Outstanding from SPEC-013 nice-to-haves

Restated against current data:

| Item | Status | Data confirms still worth doing? |
| --- | --- | --- |
| `dateModified` distinct from `datePublished` | **Outstanding** | Yes. All three audited article schemas show `dateModified === datePublished` (section 12). Three of top four articles are declining (section 3). Freshness signal would help. |
| Per-page OG image (currently `/og?title=...` dynamic route) | **Outstanding** | Inconclusive from this data. The dynamic OG works (schema validates with the URL). Real test would be social-share CTR which isn't in GSC. Defer until there's a measurement source. |
| `sameAs` on Organization publisher | **Already shipped** | `schema_validate` shows `Person.sameAs` populated with GitHub, LinkedIn, Linktr.ee (section 12). `Organization.sameAs` is not present, which may be the original SPEC-013 ask. Low-priority. |

---

End of frozen snapshot.
