---
id: SPEC-016
title: 'SEO strategy, post-audit (technical and on-page)'
status: in-progress
created: 2026-05-10
author: Anthony Coffey
reviewers: []
affected_repos: [coffey.codes]
---

## Reviewer Notes

<!-- Leave empty until code review. When requesting changes, reviewer adds feedback here: -->

---

# Feature: SEO strategy, post-audit (technical and on-page)

## Problem

SPEC-015's audit (`docs/strategy/seo-audit-2026-Q2.md`, frozen 2026-05-10) produced a grounded picture of the site's SEO state. The headlines:

- 1,149 organic clicks and 293,559 impressions over 365 days (2025-05-08 to 2026-05-07).
- The top page (`expo-location` article) holds 150,793 impressions at **0.26% CTR** at average position 6.75. Visibility is fine; the SERP click-decision is being lost.
- Three of the top four articles by clicks are declining quarter-over-quarter (-16% to -60%).
- 5 articles produce 96% of organic clicks; 21 of 26 articles are dead weight in SEO terms.
- The Mobile Development pillar carries 77% of clicks. Software Engineering pillar earns zero clicks across 4 articles.
- The site does not rank for its own author name ("anthony coffey", position 14.5 on 99 impressions, homepage).
- GA4 traffic is heavily contaminated by bot sessions from China and Singapore (1,531 sessions, none corroborated by GSC country data).
- Bing returns empty data through `bing_analytics_query` despite the property being verified.
- "Conversion" events fire in GA4 but the audit never confirmed what the conversion event actually is.

This spec is the **technical-SEO and on-page** layer of the response. It owns metadata changes, schema improvements, anchor patterns, instrumentation, and measurement plumbing. The editorial layer (what to write, refresh, deprecate) is a sibling spec, SPEC-017, that consumes the same audit data but on a different cadence.

The two specs are intentionally separate. SEO strategy can ship in a few PRs over weeks; content strategy is a months-long editorial commitment. Coupling them would block the fast wins behind the slow editorial calendar.

## Requirements

### Must have

1. WHEN a top-5 article (`building-location-based-features-using-expo-location`, `vibe-coding-building-an-app-entirely-with-ai-prompts`, `slow-android-emulator-flutter-dev`, `managing-secrets-firebase-apphosting-yaml-nextjs`, `react-19-features-and-design-patterns`) is rendered, its `<title>` and `<meta name="description">` SHALL be reviewed against the article's striking-distance and low-hanging-fruit queries from SPEC-015 and rewritten where the current values miss the dominant intent.
2. WHEN an article page is rendered, the emitted `BlogPosting.dateModified` SHALL be derived from the MDX file's `mtime` (or an explicit `updated:` frontmatter field if present), not equal to `datePublished` by default.
3. WHEN an article uses long-form headings that map to SERP intent (e.g. function names like `requestForegroundPermissionsAsync`), the rendered HTML SHALL emit a stable, kebab-case `id` on the heading element so the URL-with-anchor is a valid deep-link target.
4. WHEN [`app/(site)/articles/posts/slow-android-emulator-flutter-dev.mdx`](app/(site)/articles/posts/slow-android-emulator-flutter-dev.mdx) is rendered, its frontmatter `category` SHALL read `Mobile Development` (currently `Development`), and the orphan `/articles/category/development` route SHALL 404 or redirect to `/articles/category/mobile%20development`.
5. WHEN the homepage `/` is rendered, its `<title>` and `<meta description>` SHALL include the canonical author entity ("Anthony Coffey") in a form that competes for the branded query "anthony coffey".
6. WHEN an article ranks in striking distance (positions 8-15) for a query that maps to a sibling article's topic, the spec author SHALL add an internal link from the striking-distance page section to the canonical article, scoped to the queries identified in audit Section 5.
7. WHEN a GA4 report is run for SEO purposes, "conversion" SHALL have a documented definition (which event, where it fires, what user action it represents). The audit found 5 conversions in 180 days but never verified the underlying event.
8. WHEN GA4 traffic-source reports are reviewed for SEO purposes, the report SHALL exclude or annotate the bot-skewed regions identified in audit Section 9.5 (China 863 sessions, Singapore 668 sessions, neither in GSC's top countries).
9. WHEN the next quarterly audit runs, the project SHALL include a re-test of `bing_analytics_query` to determine whether Bing's empty response was an MCP issue, an account-side reporting issue, or a true reflection that the site has no Bing impressions.
10. WHEN the next quarterly audit runs (target 2026-08-10), it SHALL re-pull the same MCP tool set against the same property and produce a side-by-side delta against `docs/strategy/seo-audit-2026-Q2.md`.

### Nice to have

- Per-page `openGraph.images` for taxonomy hubs (`/articles/categories`, `/articles/tags`, individual category and tag pages) and the homepage. Currently fall back to the dynamic `/og?title=...` route or the root OG. SPEC-013 nice-to-have, restated here with current data showing it's still worth doing.
- `Organization.sameAs` on the publisher block in `BlogPosting` JSON-LD (sister to the existing `Person.sameAs` on the layout-level Person schema).
- A CTR-by-position baseline computed from this site's own GSC data (not a generic curve), to make "below curve" claims defensible. The audit cited "5-7% at position 7" implicitly; future audits should cite the site's own observed CTR per position bucket.
- Wikidata or Knowledge Graph entry for "Anthony Coffey" linked via `Person.sameAs`. Useful for the branded-query rank discussed in must-have #5.
- A small dashboard or scheduled snapshot (`scripts/seo-snapshot.mjs` from SPEC-015 nice-to-have) that captures clicks, impressions, top pages, and top queries weekly into `docs/strategy/data/`.

### Non-goals (what this does NOT do)

- This spec does NOT write or refresh article content. Editorial work is SPEC-017's scope.
- This spec does NOT change the article rendering pipeline beyond the metadata, schema, and anchor-id changes listed in must-haves #1-#3.
- This spec does NOT propose performance work. SPEC-014 (in flight) owns Core Web Vitals on article routes.
- This spec does NOT acquire backlinks, run PR campaigns, or pursue distribution. Authority through writing is SPEC-017's scope; outbound link-building is not a project focus.
- This spec does NOT fix every striking-distance query. It addresses the title/anchor/internal-link patterns that benefit the largest cluster (Expo Location function-name long-tails) and leaves long-tail-by-long-tail tuning to natural editorial cycles.
- This spec does NOT cover Bing optimization beyond the diagnostic in must-have #9. If Bing turns out to have real but unreported traffic, a follow-up spec scopes the work.

## Design

### 1. Title and meta-description rewrites (must-have #1)

For each top-5 article, capture the current `<title>` and `<meta description>` from the rendered HTML and the rewrite target. The frontmatter `summary` field feeds the description; the rendered title is `${frontmatter.title} | Anthony Coffey` per [`app/(site)/articles/[slug]/page.tsx`](app/(site)/articles/[slug]/page.tsx).

**Building Location-Based Features Using Expo Location**

- Striking-distance queries (audit Section 5): `expo-location requestForegroundPermissionsAsync`, `expo-location permissionStatus.granted`, `expo-location hasServicesEnabledAsync`, `reverseGeocodeAsync`, `expo background location`, `location expo`.
- Current title leads with "Building Location-Based Features"; the searcher is asking by API surface name.
- Rewrite the article's frontmatter `title` to lead with the canonical package + concept ("Expo Location"), and update `summary` to mention the function names the article actually documents.
- The rewrite is a content-adjacent change (frontmatter only) and stays inside this spec because it does not require body edits; if the body needs additions to match the rewritten title, that work moves to SPEC-017.

**Slow Android Emulator Flutter Dev**

- Striking-distance queries: `android emulator slow`, `why android emulator is slow`, `why is android emulator so slow`, `android emulator very slow`.
- Current title is searcher-aligned. Description may be the lever; verify the current `summary` against the article body and tighten if needed.

**Managing Secrets in Firebase App Hosting for Next.js Applications**

- Striking-distance queries: `apphosting.yaml`, `firebase apphosting:secrets:set`, `firebase apphosting:secrets:grantaccess`, `next_public_firebase_api_key`, `firebase app hosting environment variables`.
- The article documents these CLI commands. Description should name the commands explicitly.

**React 19 Features and Design Patterns**

- Per-anchor URLs (`#actions-api`, `#streaming-patterns`, `#react-compiler`, etc.) rank at positions 6-9 with hundreds of impressions each but zero clicks. The article ranks but the searcher is choosing other results.
- Lower priority than the three above (only 52 clicks against 15,131 impressions, but the impressions are spread across 10 anchors, each at smaller volume).

**Vibe Coding: Building a Flutter App Entirely with AI Prompts**

- Vibe-coding cluster has the highest CTR on the site (4-7%). Title is working. The page is declining (-33% trend in audit Section 3); the editorial fix is in SPEC-017.

For each rewrite: ship in a single PR titled `seo: rewrite top-5 article titles + descriptions [SPEC-016]`. The PR body cites the specific audit numbers per article.

### 2. `dateModified` from file mtime (must-have #2)

Current state per audit Section 12: all three audited article schemas have `dateModified === datePublished`. Three of the top four articles are declining. Fresh `dateModified` is a real signal Google uses to decide crawl frequency and rank-stability for time-sensitive topics.

Approach: in [`app/(site)/articles/[slug]/page.tsx`](app/(site)/articles/[slug]/page.tsx), populate `BlogPosting.dateModified` from one of these in priority order:

1. An explicit `updated:` field in the MDX frontmatter (when the author wants to assert a meaningful update, not a typo fix).
2. The MDX file's `mtime` from `fs.stat()` at build time.
3. Fall back to `datePublished` only if both are unavailable.

Risk: every git rebase, prettier run, or trivial whitespace change updates `mtime`. The `updated:` frontmatter field is the more defensible source. Consider making `mtime` the implementation default but documenting that the editorial-meaningful update path is `updated:`. SPEC-017's refresh policy (must-have #3 there) pairs with this: a real refresh sets `updated:`; a typo fix does not.

### 3. Anchor-id heading pattern (must-have #3)

The MDX renderer in [`components/mdx.tsx`](components/mdx.tsx) controls how headings render. Verify whether headings already get auto-generated kebab-case `id`s (most MDX setups do via `rehype-slug`); if not, add `rehype-slug` to the MDX pipeline.

Once IDs are emitted, the editorial pattern (handled in SPEC-017) is to write `## requestForegroundPermissionsAsync` as a section heading inside the Expo Location article, which then deep-links as `/articles/building-location-based-features-using-expo-location#requestforegroundpermissionsasync`. Google indexes anchored URLs as separate "pages" and serves them when the query matches the section heading.

Caveat from audit reading: React 19's anchor URLs already rank but get zero clicks (Section 9.5). The mechanism is real but the click-conversion is not automatic. SPEC-017 owns the editorial call on whether to expand the pattern.

### 4. Category fix on `slow-android-emulator-flutter-dev` (must-have #4)

Single-line change in [`app/(site)/articles/posts/slow-android-emulator-flutter-dev.mdx`](app/(site)/articles/posts/slow-android-emulator-flutter-dev.mdx) frontmatter:

```diff
- category: 'Development'
+ category: 'Mobile Development'
```

The orphan `/articles/category/development` route is generated by [`app/(site)/articles/category/[category]/page.tsx`](app/(site)/articles/category/[category]/page.tsx) reading from `getAllCategories()` in [`app/(site)/articles/utils.ts`](app/(site)/articles/utils.ts). Once the frontmatter is corrected, the category disappears from `getAllCategories()` and the route returns 404.

Belt and braces: add a redirect in `next.config.js` from `/articles/category/development` to `/articles/category/mobile%20development` so any backlinks to the orphan still resolve.

### 5. Homepage author-name title (must-have #5)

Current homepage `<title>` per the audit (observed in `analytics_realtime`) leads with the author name and uses an em-dash separator before the role and location. The em-dash violates voice rules; the page also fails to rank for the branded query.

Two diagnoses are plausible: the SERP for "anthony coffey" is dominated by other people with the same name (likely), or the page lacks supporting entity signals. Fixes:

- Replace the em-dash. Title becomes "Anthony Coffey, AI Consultant and Software Engineer in Austin, TX" or shorter.
- Confirm `Person.sameAs` covers the strongest off-site profiles (already done per audit Section 12: GitHub, LinkedIn, Linktr.ee).
- Add a short bio paragraph above the fold on `/` that reinforces the entity (location, role, two-sentence positioning). Not a content rewrite of substance, just a compact entity signal. Coordinate with SPEC-017 if any wording requires editorial judgment.

### 6. Internal linking (must-have #6)

For the striking-distance queries listed in audit Section 5, add explicit internal links from the receiving article (where the query actually ranks) to the canonical sibling article when the topic warrants. Specific candidates:

| Query (page) | Anchor in receiving article | Link target |
| --- | --- | --- |
| `react 19 best practices` (react-19-features-and-design-patterns) | "more on patterns" | [/articles/javascript-design-patterns](app/(site)/articles/posts/javascript-design-patterns.mdx) |
| `expo background location` (building-location-based...) | new section paragraph | none yet (article doesn't cover it well; SPEC-017 may write a companion piece) |
| `firebase app hosting environment variables` (managing-secrets-firebase...) | existing section | [/articles/setting-up-ci-cd-for-firebase-functions-using-github-actions](app/(site)/articles/posts/setting-up-ci-cd-for-firebase-functions-using-github-actions.mdx) where applicable |

Defer the rest to SPEC-017's editorial passes.

### 7. GA4 conversion event audit (must-have #7)

Open the GA4 admin UI (or query the GA4 events API), enumerate every event marked `conversion = true`, and document each one in [`docs/strategy/ga4-events.md`](docs/strategy/ga4-events.md). For each: event name, what user action triggers it, where in the codebase it fires (or where in GA4 it's defined), and whether it should be considered a meaningful conversion for SEO reporting.

The two suspicious data points from the audit:

- `/contact` had 0 conversions on 3 organic-search sessions over 180 days. If conversion = form submit, that's the page where it should fire most often.
- The homepage had 3 conversions on 12 sessions (25% rate). Either the homepage genuinely converts (clicks to contact, scrolls to engagement event), or the conversion event is firing on something light.

The output is a table that lets future SEO work cite a specific event by name.

### 8. GA4 bot-region filter (must-have #8)

Two implementations are reasonable:

- A GA4 "Audience" or "Comparison" segment named "Excluding bot regions" that excludes country = China and country = Singapore for any organic-search-attributed report.
- A GA4 filter (account-level) that drops `(direct)` traffic from those countries entirely.

Option (a) is reversible and report-scoped; option (b) is a permanent data change. Prefer (a) for reversibility.

Ship as a screenshot or written walk-through in [`docs/strategy/ga4-events.md`](docs/strategy/ga4-events.md) so the configuration is documented in-repo even though it lives in GA4's UI.

### 9. Bing diagnostic (must-have #9)

The next quarterly audit's first action: re-run `bing_analytics_query` and `bing_opportunity_finder`. If they continue to return empty:

- Log into Bing Webmaster Tools UI directly. If the UI shows the same empty data, there are no Bing impressions and the audit's empty section was correct.
- If the UI shows traffic but the MCP returns empty, the issue is `search-console-mcp`'s Bing client (open an issue against the MCP repo or look for a config flag).

Document the outcome in `docs/strategy/seo-audit-2026-Q3.md` (the next audit) regardless of which way it lands.

### 10. Quarterly re-audit (must-have #10)

Target date: 2026-08-10. Use the same MCP tool list as SPEC-015. New file: `docs/strategy/seo-audit-2026-Q3.md`. Cross-reference deltas vs. Q2 audit; flag any metric that swung more than 25%.

The original SPEC-015's nice-to-have snapshot script (`scripts/seo-snapshot.mjs`) becomes more compelling at this point; if quarterly snapshots become routine, the script saves the data-pull labor.

## Edge cases

- [ ] If MDX `mtime` falls back to publication date because the file hasn't been touched since, do not emit `dateModified` rather than emit a false-equivalence value. Schema validators accept missing `dateModified`.
- [ ] If `rehype-slug` is already in the MDX pipeline, must-have #3 is a no-op verification, not a code change.
- [ ] If the orphan `/articles/category/development` route still appears in `sitemap.ts` after the frontmatter fix, audit `getAllCategories()` for stale caching (Next.js dynamic routes generally regenerate at build time; verify after a clean build).
- [ ] If the GA4 conversion audit reveals a misconfigured event (e.g. fires on every page-view), pause SEO reporting that uses GA4 as ground truth until the event is fixed. Note the issue and date in `docs/strategy/ga4-events.md`.
- [ ] If the Bing diagnostic reveals real traffic that the MCP wasn't surfacing, treat the existing audit's Bing section as understated and amend the next-quarter audit accordingly. Do not back-edit the frozen Q2 audit.
- [ ] If a top-5 article's title rewrite causes a measurable rank loss on a query it currently wins, revert the title within 14 days. The `dateModified` change is not reversible and must be a deliberate decision per article.
- [ ] If `analytics_anomalies` flags a sudden click drop after the title rewrites ship, treat as signal: possibly the SERP snippet got worse, possibly Google is re-evaluating. Hold the rollback decision for two weeks before reverting.

## Acceptance criteria

1. Each top-5 article's `<title>` and `<meta description>` matches the rewrite plan in Design > Section 1, verified by visiting the deployed URL and inspecting `<head>`.
2. Pasting the deployed `building-location-based-features-using-expo-location` URL into the Rich Results Test shows `BlogPosting.dateModified` distinct from `datePublished` (or correctly absent).
3. Visiting `/articles/category/development` returns either 404 or a 308 redirect to `/articles/category/mobile%20development`. The MDX file's frontmatter shows `category: 'Mobile Development'`.
4. Visiting `/articles/building-location-based-features-using-expo-location#requestforegroundpermissionsasync` (or whatever heading exists) scrolls to a heading on the page rather than 404-ing the anchor.
5. Visiting the deployed homepage shows `<title>` containing "Anthony Coffey" without an em-dash.
6. The file [`docs/strategy/ga4-events.md`](docs/strategy/ga4-events.md) exists and lists every GA4 event marked `conversion: true` with the trigger and meaning.
7. `docs/strategy/seo-audit-2026-Q3.md` exists by 2026-08-15 (allowing 5 days of slip from the 2026-08-10 target) and contains side-by-side deltas vs. Q2.
8. The Q3 audit's Section 9 (Bing) explicitly states whether `bing_analytics_query` returns empty, returns data, or whether the MCP turned out to have a bug. No vague "see also" deferrals.

## Constraints

- Each tranche of work ships as a small, focused PR. Suggested PR splits:
  - PR 1: title and meta-description rewrites (frontmatter only) on top-5 articles.
  - PR 2: `dateModified` schema change + MDX file mtime read.
  - PR 3: anchor-id verification and `rehype-slug` add (if needed).
  - PR 4: category frontmatter fix + redirect.
  - PR 5: homepage title and meta-description.
  - PR 6: GA4 events doc + bot-region filter walkthrough.
- All PRs must respect voice rules (no em-dashes, no marketing tricolons, no closing-flourish summaries) in user-facing copy.
- No new dependencies beyond `rehype-slug` if it isn't already installed.
- `npm run lint`, `npm run build`, `npm run typecheck`, and existing Playwright e2e must pass on each PR.
- No content rewrites of article body text in this spec. Title and frontmatter `summary` are the boundary.
- Commit format follows project convention: `<type>: <description> [SPEC-016]`.

## Tasks

- [x] Capture current `<title>` and `<meta description>` for each top-5 article (via SPEC-015 audit data)
- [x] Draft rewrite targets, citing audit Section 5 and Section 6 numbers
- [x] Frontmatter rewrites for top-5 articles (partial: Expo Location title + summary, Firebase Secrets summary; React 19 / vibe-coding / slow-android-emulator deferred to editorial review)
- [x] Add `dateModified` derivation in [`app/(site)/articles/[slug]/page.tsx`](app/(site)/articles/[slug]/page.tsx) (priority: frontmatter `updated:`, then file mtime, then publishedAt)
- [ ] Document `updated:` frontmatter convention in [`docs/documentation/agents/coffey-codes.md`](docs/documentation/agents/coffey-codes.md) so SPEC-017's refresh policy can rely on it
- [x] Verify or add `rehype-slug` to MDX pipeline (already implemented via custom `createHeading` in [`components/mdx.tsx`](components/mdx.tsx); no change needed)
- [ ] Spot-check rendered IDs on the Expo Location and React 19 articles
- [x] Frontmatter category fix on `slow-android-emulator-flutter-dev.mdx`
- [x] Add redirect for `/articles/category/development` in `next.config.js`
- [x] Homepage `<title>` and `<meta description>` rewrite (em-dash and `&` removed in [`app/page.tsx`](app/page.tsx) and [`app/layout.tsx`](app/layout.tsx))
- [ ] Add concise bio paragraph above the fold on `/` (deferred; coordinate with SPEC-017 voice review)
- [ ] Internal-link additions per Design > Section 6 (folded into PR 1 or PR 5 depending on which articles are touched)
- [ ] GA4 conversion audit, write `docs/strategy/ga4-events.md` (PR 6)
- [ ] Configure GA4 segment "Excluding bot regions" and document (PR 6)
- [ ] (Nice-to-have) Per-page `openGraph.images` for taxonomy hubs and homepage
- [ ] (Nice-to-have) `Organization.sameAs` on publisher block
- [ ] (Nice-to-have) Compute CTR-by-position baseline from site data, document method in [`docs/documentation/deep-dives/onpage-seo-strategy.md`](docs/documentation/deep-dives/onpage-seo-strategy.md)
- [ ] (Nice-to-have) `scripts/seo-snapshot.mjs` weekly snapshot script
- [x] Quarterly re-audit (early pull): `docs/strategy/seo-audit-2026-Q3.md` shipped 2026-05-11, one day after Q2. Mostly a post-deploy verification snapshot; the true 90-day delta still belongs at the 2026-08-10 target.
- [x] Confirm Bing diagnostic outcome in Q3 audit Section 9: bing_analytics_query and bing_opportunity_finder still return empty; GA4 records 114 bing/organic sessions over 180 days. Most likely cause is MCP-side; user follow-up is to check the Bing Webmaster Tools UI directly.
- [ ] After all PRs land, request reindex on each modified article URL in GSC

## Notes

- **Source data**: [`docs/strategy/seo-audit-2026-Q2.md`](docs/strategy/seo-audit-2026-Q2.md). Every must-have requirement traces to a specific section of that doc.
- **Sibling spec**: [`docs/specs/active/SPEC-017-content-strategy.md`](docs/specs/active/SPEC-017-content-strategy.md) owns the editorial direction (what to write, refresh, deprecate). The two specs share inputs but ship on different cadences.
- **Related specs**:
  - SPEC-013 (GSC issue remediation): complete. Provided the schema baseline this spec extends.
  - SPEC-014 (article perf and a11y): in flight. Owns Core Web Vitals; this spec defers performance work to it.
  - SPEC-015 (SEO audit, data-driven): review-pending. Provides the data this spec acts on.
- **Reference docs**:
  - [`docs/documentation/deep-dives/onpage-seo-strategy.md`](docs/documentation/deep-dives/onpage-seo-strategy.md): existing site-wide title and meta-description strategy.
  - [Google Search Central, "Article" structured data](https://developers.google.com/search/docs/appearance/structured-data/article)
  - [Google Search Central, "Title link" guidance](https://developers.google.com/search/docs/appearance/title-link)
- **Measurement window**: shipping the title rewrites in PR 1 should produce a measurable signal in 14-28 days (Google needs to recrawl and the rewritten snippet needs SERP impressions to accumulate). Hold rank judgment for 30 days minimum before iterating.
- **What this spec deliberately does not promise**: a target click-rate or rank improvement. The audit's potential-clicks numbers (e.g. "1,424 for `expo location`") are ceilings under the curve-CTR assumption; real recovery depends on the SERP and is not under direct control.
