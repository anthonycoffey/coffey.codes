---
title: 'SEO audit, 2026 Q3 (early pull)'
date: 2026-05-11
spec: SPEC-016
window: '2025-05-09 to 2026-05-08 (365 days)'
status: frozen-snapshot
author: Anthony Coffey
---

# SEO audit, 2026 Q3 (early pull, post-#168 deploy check)

## 0. Framing

This audit was run on **2026-05-11**, one day after the Q2 audit was published and one day after PR #168 merged (the audit-driven SEO work). The original SPEC-016 must-have #10 targets **2026-08-10** for the quarterly cadence; this is a deliberate early pull to:

1. Verify the Q2 audit data pipeline still works post-deploy.
2. Re-test the **Bing diagnostic** (SPEC-016 must-have #9).
3. Confirm schema changes from #161, #165, #168 are reflected in the deployed JSON-LD.
4. Spot-check the new article's index discovery state.
5. Check whether `form_submit` (the GTM tag wired 2026-05-10) is firing yet.

Most metrics will mirror Q2 because the 365-day window overlaps Q2's by 364 days. The next true delta read still belongs at the 2026-08-10 quarterly target. This doc replaces nothing; it's an early-signal snapshot.

## 1. Scope, data sources, date range

Property: `sc-domain:coffey.codes`. Window: **2025-05-09 to 2026-05-08** (365 days, `dataState: final`).

All three engines authenticated. Bing remains the exception: still returns empty data through `bing_analytics_query` and `bing_opportunity_finder` (see Section 9). No Ahrefs MCP calls.

## 2. Top-level GSC summary (365 days)

| Metric | Q3 (2026-05-11) | Q2 (2026-05-10) | Δ |
| --- | --- | --- | --- |
| Clicks | 1,151 | 1,149 | +2 |
| Impressions | 294,982 | 293,559 | +1,423 |
| CTR | 0.39% | 0.39% | flat |
| Avg position | ~6.95 | 6.95 | flat |

Effectively unchanged. The 1-day window shift dropped one early-2025 day (very low traffic) and added one recent day (~12k impressions / 0-2 clicks).

`sites_health_check` (week-over-week):
- Q2 (2026-04-30 to 2026-05-07): clicks down 27.3% WoW, "warning"
- **Q3 (2026-05-01 to 2026-05-08): clicks up 11.7% WoW (17 → 19), "healthy"**

That's the first measurable post-#168 indicator. One-week comparison so the signal is thin, but the direction is right.

`analytics_anomalies` (90 days): same single anomaly as Q2, the 2026-03-11 spike (9 clicks vs 3 expected, +198.91%). No new anomalies in the past day.

Sitemap (`sitemaps_list`), **new finding**:

| Sitemap path | Submitted | Indexed | Last downloaded |
| --- | --- | --- | --- |
| `https://coffey.codes/sitemap.xml` | 160 | 0 | 2026-05-10T20:53:11Z |
| `http://coffey.codes/sitemap.xml` | 160 | 0 | 2026-05-10T20:53:02Z |

Google auto-discovered an `http://` variant of the sitemap. Both report 160 URLs and `indexed: "0"` (same attribution-lag quirk as Q2). Worth investigating whether the `http://` variant should be removed in GSC, or whether it's harmlessly duplicated by Google's own crawl.

## 3. Top performing pages (365 days, by clicks)

| Page | Q3 clicks | Q2 clicks | Δ |
| --- | --- | --- | --- |
| /articles/building-location-based-features-using-expo-location | 390 | 388 | +2 |
| /articles/vibe-coding-building-an-app-entirely-with-ai-prompts | 248 | 248 | 0 |
| /articles/slow-android-emulator-flutter-dev | 236 | 236 | 0 |
| /articles/managing-secrets-firebase-apphosting-yaml-nextjs | 180 | 180 | 0 |
| /articles/react-19-features-and-design-patterns | 52 | 52 | 0 |
| /Anthony%20Coffey%20-%20Resume.pdf | 15 | 15 | 0 |
| /articles/authorize-net-for-react-native-expo-sdk-49 | 15 | 15 | 0 |
| / (homepage) | 4 | 4 | 0 |
| /contact | 4 | 4 | 0 |

Effectively no change. Title and description rewrites from #161 (Expo Location, Firebase Secrets) haven't influenced anything yet because Google's last crawl of the affected pages predates the deploy.

`analytics_trends` (90 days, page dimension):

| Page | Direction | Change | Current | Previous |
| --- | --- | --- | --- | --- |
| slow-android-emulator-flutter-dev | declining | -19.6% | 41 | 51 |
| managing-secrets-firebase-apphosting-yaml-nextjs | declining | -57.1% | 6 | 14 |
| vibe-coding-building-an-app-entirely-with-ai-prompts | declining | -40% | 9 | 15 |
| react-19-features-and-design-patterns | declining | -16.7% | 10 | 12 |

Four declining pages now (was three in Q2; React 19 just crossed the threshold). The SEO work that addresses these is downstream of editorial refresh (SPEC-017), not the title rewrites already shipped.

## 4. Top performing queries (365 days)

Identical to Q2 modulo 1-3 impressions on the long tail. Top 10 query order unchanged. `flutter vibe coding` still leads at 49 clicks / 1,088 impressions / 4.5% CTR / position 8.48.

Branded query `"anthony coffey"`: still 99 impressions, **0 clicks, position 14.5** on the homepage. The homepage title rewrite from #161 (removed em-dash, leads with the author name) hasn't been crawled yet; Google's last crawl of `/` was **2026-05-05**, before the #168 deploy on 2026-05-11. Will need either a manual reindex request or natural recrawl before this can move.

## 5. Striking distance, low hanging fruit, cannibalization, lost queries

All four sections return effectively identical results to Q2. `seo_cannibalization` returns `[]` again (zero cannibalization). `seo_lost_queries` (90-day comparison): no new lost queries beyond the single `vibe coding flutter app` entry from Q2.

The Expo Location striking-distance cluster (14 of 25 entries) is intact: `expo-location requestForegroundPermissionsAsync`, `permissionStatus.granted`, `hasServicesEnabledAsync`, `reverseGeocodeAsync`, etc. The article's title rewrite in #161 hasn't influenced the click counts yet; same crawl-lag reason.

## 6-8. Sections from Q2 carry forward unchanged

Skipping detailed re-tables for Sections 6-8 (low hanging fruit, cannibalization, lost queries). The Q2 audit's data and analysis remain accurate. The next true delta will be visible after Google has had ~30 days to recrawl the rewritten pages.

## 9. Bing diagnostic (SPEC-016 must-have #9)

Re-tested per the SPEC-016 task:

| Tool | Result |
| --- | --- |
| `bing_sites_list` | Returns the verified site (`https://coffey.codes/`, IsVerified: true) |
| `bing_analytics_query` (180 days) | `[]` |
| `bing_opportunity_finder` | `[]` |
| GA4 `analytics_traffic_sources` (180 days) | **114 sessions** attributed to `bing / organic` |

**Diagnosis:** Bing is verified at the Webmaster Tools account and is sending real organic traffic to the site (114 sessions in 180 days per GA4). But the `search-console-mcp` Bing endpoints return empty.

Three plausible causes, in order of likelihood:

1. **MCP-side bug**: `search-console-mcp` may not be authenticating against the right Bing account, or the API response shape changed and the MCP isn't parsing it. Open an issue against the MCP repo.
2. **Bing Webmaster API permission**: the API key behind the MCP may have different permissions than the Webmaster Tools UI account. Log into the UI directly to confirm whether Top Queries / Top Pages reports show data.
3. **Bing Webmaster Tools genuinely has no recorded data** for the property. Unlikely given GA4 sees Bing traffic.

**Action for the user (UI task, not codebase):**
- Log into [Bing Webmaster Tools](https://www.bing.com/webmasters/) for `coffey.codes`.
- Visit the "Search Performance" report.
- If the UI shows clicks/impressions, the MCP is broken. File an issue.
- If the UI also shows empty, Bing is collecting GA4 traffic but not surfacing it to Webmaster Tools (very unusual; would be a Bing-side problem).

Either way, the Q2 audit's Bing section interpretation ("no comparison possible") stands. Re-test at the next quarterly.

### Postscript (2026-05-11, SPEC-018)

The SPEC-018 snapshot script bypasses the MCP and calls the Bing Webmaster Tools REST API directly (`GetRankAndTrafficStats`, `GetQueryStats`) with a fresh API key generated through the Webmaster Tools UI. Result in `docs/strategy/data/snapshot-2026-05-11.json`:

```json
"bing": { "totals": { "clicks": 0, "impressions": 0, "ctr": 0 }, "topQueries": [], "_note": "empty response" }
```

The direct API returns the same empty result the MCP does. This eliminates cause #1 (MCP-side bug) from the list above. The remaining causes are now ordered:

1. **Bing Webmaster API permission scope**: the UI-generated API key may not return performance data even though the account is verified. Cross-check the [Bing Webmaster Tools UI](https://www.bing.com/webmasters/) Search Performance report directly; if the UI shows clicks/impressions, file a support ticket about API key scope. If the UI is also empty, move to #2.
2. **Bing Webmaster Tools genuinely has no recorded data** for the property despite GA4 seeing 114 Bing sessions in 180 days. This would be a Bing-side data-pipeline gap, not anything actionable from the codebase.

Next quarterly audit (target 2026-08-10): re-run the snapshot, diff against this baseline using `scripts/seo-snapshot-diff.mjs`, see if `bing.totals.impressions` has moved off zero.

## 9.5 GA4 cross-reference (180 days, post-config-change)

Compared against the Q2 pull. The GA4 walk-through on 2026-05-10 changed three things: `form_start` toggled OFF as a key event, `form_submit` GTM tag created and toggled ON as a key event, Google EU Consent Policy attestation affirmed.

| Metric | Q3 (180d ending 2026-05-08) | Q2 (180d ending 2026-05-07) | Δ |
| --- | --- | --- | --- |
| Direct sessions | 5,465 | 5,465 | 0 |
| Google Organic sessions | 849 | 847 | +2 |
| Bing Organic sessions | 114 | 114 | 0 |
| ChatGPT referral | 24 | 24 | 0 |
| Gemini referral | 9 | 9 | 0 |

Effectively flat. 1 day of delta isn't enough to move 180-day totals.

**`form_submit` events**: not yet visible in any GA4 report through the MCP surface. Expected: the GTM tag started forwarding 2026-05-10; no real-world submissions in the ~24 hours since. The earliest meaningful read on the new key event is 14-30 days out (2026-05-25 to 2026-06-10).

**Bot regions still dominant**: China 864 sessions, Singapore 668 sessions. Audit Section 9.5's reinterpretation stands. The new bot-region segment in GA4 admin (configured 2026-05-10) doesn't affect raw `analytics_traffic_sources` totals; it's applied when you view reports in the GA4 UI directly.

## 10. Per-pillar breakdown

Same picture as Q2. Mobile Development still carries 77% of clicks. Software Engineering still at zero. The Three.js portfolio article (shipped 2026-05-10) lands in **Web Development** and will start adding to that pillar once Google indexes it (currently "URL is unknown to Google" per Section 12).

## 11. Country and device breakdown

Identical to Q2 modulo 1-3 sessions. USA still dominant. Mobile CTR (0.84%) still 2.4x desktop's (0.35%).

## 12. On-page health and crawl status (post-#168 deploy)

This is the section that's genuinely new. `inspection_inspect` results:

| URL | Verdict | Last crawled | Comment |
| --- | --- | --- | --- |
| `/articles/three-js-portfolio-website-for-software-engineer` | "URL is unknown to Google" | (never) | Brand new (deployed 2026-05-11). Needs explicit indexing request. |
| `/` (homepage) | PASS, indexed | **2026-05-05** | Pre-deploy crawl. New title with author name + no em-dash not yet in Google's index. |
| `/articles/category/development` | "URL is unknown to Google" | (never) | The orphan category from the audit. Google never had it; the 308 redirect from #161 is now wired but Google won't notice unless someone links to the URL or the sitemap exposes it (it doesn't, since `getAllCategories()` no longer returns "Development"). |
| `/articles/building-location-based-features-using-expo-location` | PASS, indexed | **2026-04-29** | Pre-deploy crawl. New title ("Expo Location in React Native: Permissions, Coordinates, and Geofencing") not yet in Google's index. |

`schema_validate` results:

**Expo Location article** (post-deploy):
- ✅ `valid: true`, no errors
- ✅ New title in `BlogPosting.headline`: "Expo Location in React Native: Permissions, Coordinates, and Geofencing"
- ✅ `datePublished` is full ISO 8601 with timezone: `2025-03-24T00:00:00.000Z`
- ✅ `dateModified` is full ISO 8601 with timezone: `2026-05-11T02:09:34.329Z`
- ✅ OG image URL includes `&category=Mobile%20Development`
- The PR #165 ISO datetime fix is verified live. Rich Results Test warnings from the Q2 audit should be gone (the user reported them as "Invalid datetime value" and "missing a timezone" on the Expo Location article).

**Three.js portfolio article**:
- ⚠️ `valid: false`, but all 6 errors are **WARNINGS** on optional VideoObject fields: `duration`, `expires`, `hasPart`, `publication`, `regionsAllowed` or `ineligibleRegion`, `interactionStatistic` or `interactionCount`.
- ✅ All required VideoObject fields present and correct: `name`, `description`, `thumbnailUrl`, `uploadDate`, `embedUrl`, `contentUrl`.
- ✅ `dateModified` ISO 8601 with timezone.
- ✅ BreadcrumbList valid.
- The "valid: false" status is misleading; these are recommended-not-required fields. Google's Rich Results Test will still pass the Article and Video rich-result types. `duration` can be added if the user pulls it from YouTube; the rest aren't applicable to this content.

`pagespeed_analyze`: not run this audit (still rate-limited last time; SPEC-014 owns perf work).

## 13. Findings and next actions

### What this Q3 pull validates

1. ✅ ISO 8601 datetime fix (PR #165) is live; both Expo Location and Three.js articles emit full datetime with timezone.
2. ✅ Video SEO infrastructure (PR #168) is live; VideoObject is emitted in BlogPosting JSON-LD for articles with `youtubeId` frontmatter.
3. ✅ Title rewrite on Expo Location article (PR #161) is live in the source. Google just hasn't recrawled yet.
4. ✅ Category fix (PR #161) is live. `/articles/category/development` returns 308 to `/articles/category/mobile%20development`.
5. ✅ Bing diagnostic re-test complete: still empty through the MCP. Action item moved to "log into the Bing UI to confirm".

### What this pull cannot validate yet (Google crawl lag)

1. ❌ Homepage title rewrite. Google's last crawl of `/` was 2026-05-05, before deploy.
2. ❌ Expo Location title and description rewrite. Last crawl 2026-04-29.
3. ❌ New Three.js article discovery. Completely unknown to Google.

**These three need either (a) a manual reindex request in GSC, or (b) ~2-4 weeks of natural recrawl** before the SEO work has any chance of showing up in SERP behavior.

### Recommended next-up (user, ~15 min total)

1. Open GSC URL Inspection → request reindex for:
   - `https://coffey.codes/articles/three-js-portfolio-website-for-software-engineer` (priority, brand new)
   - `https://coffey.codes/` (homepage with new title)
   - `https://coffey.codes/articles/building-location-based-features-using-expo-location` (rewritten title)
   - `https://coffey.codes/articles/managing-secrets-firebase-apphosting-yaml-nextjs` (rewritten summary)
2. Open Bing Webmaster Tools → check whether the UI shows traffic that the MCP is missing.
3. Optional: check `http://coffey.codes/sitemap.xml` in GSC Sitemaps; if it shows up as a separate sitemap, decide whether to delete it (the canonical is the `https://` variant).

### Genuine next delta (calendar)

The next quarterly audit on or around **2026-08-10** will be the first true measurement of whether the SEO work has moved the needle. Hold rank judgment until then.

## 14. Outstanding from SPEC-013 nice-to-haves

| Item | Status | Notes |
| --- | --- | --- |
| `dateModified` distinct from `datePublished` | ✅ Shipped (PR #161 + #165 datetime fix) | Verified on both Expo Location and Three.js articles |
| Per-page OG images for taxonomy hubs + homepage | Partial | Articles now get styled OG cards with category kicker (PR #168). Taxonomy hubs and `/` still use static `/og-image.jpg`. |
| `Organization.sameAs` on publisher block | Still outstanding | Not addressed in #168. Low priority. |

---

End of Q3 early-pull snapshot.
