---
id: SPEC-030
title: 'Technical SEO sprint: CTR recovery & on-page optimization'
status: complete
created: 2026-05-22
completed: 2026-05-23
author: Anthony Coffey
reviewers: []
affected_repos: [coffey.codes]
---

## Reviewer Notes

<!-- Leave empty until code review. -->

---

# Feature: Technical SEO sprint — CTR recovery & on-page optimization

## Problem

Per `docs/strategy/data/snapshot-2026-05-22.md`, coffey.codes earns **1,169 GSC clicks from 310,678 impressions (0.38% sitewide CTR)** over the trailing 365 days. Technical foundations are solid — sitemap, robots, per-page canonicals, JSON-LD (Person, WebSite, BlogPosting, BreadcrumbList, Service), and dynamic OG images are all present. The bottleneck is **click-through rate on high-impression pages**:

- `/articles/building-location-based-features-using-expo-location` — 161,827 impressions, 0.25% CTR, position 6.8.
- `/articles/slow-android-emulator-flutter-dev` — 74,065 impressions, 0.32% CTR, position 5.9.
- These two pages alone hold ~76% of all site impressions yet convert poorly.
- For contrast, `/articles/vibe-coding-...` earns 2.73% CTR — proof the SERP snippet can convert when it matches query intent.

The single biggest rank/click lever is on-page CTR optimization (titles, meta descriptions, structured data for rich results) and the one infrastructure gap is the absence of a related-posts internal-linking component.

## Requirements

### Must have

1. WHEN a user searches for one of the dominant query clusters covered by the four high-impression articles, the SERP snippet SHALL surface a title and meta description that front-loads the matched query intent and contains a click hook, derived from MDX frontmatter `title` and `summary`.
2. WHEN an article body contains content matching `FAQPage` or `HowTo` schema shape, the rendered page SHALL include the matching JSON-LD; WHEN it does not, the system SHALL NOT emit fabricated schema (Google guideline).
3. WHEN an article has been edited after publication, the `BlogPosting` JSON-LD `dateModified` and the sitemap `lastModified` SHALL reflect the most recent `updated` frontmatter value (falling back to `publishedAt`).
4. WHEN an article page renders, it SHALL surface up to 3 related articles selected by shared tags / category at the foot of the article body.
5. WHEN an article is updated, the new URL SHALL be submitted to Bing via IndexNow.
6. WHEN any of the four WS1 article URLs is validated via the `schema_validate` MCP tool, validation SHALL pass with no errors.

### Nice to have

- Cannibalization decisions (canonical or consolidation recommendation) documented for the two adjacent-article pairs flagged in `content-disposition.md`.
- Core Web Vitals baseline captured for the top 5 pages.

### Non-goals (what this does NOT do)

- Rewrite article prose or publish new articles — owned by the SPEC-017 editorial calendar.
- Re-open the Software Engineering pillar — already deprecated per `content-disposition.md`.
- Off-page / backlink acquisition.

## Design

Six workstreams, executed in dependency order:

### WS1 — CTR recovery on high-impression pages

Article `title` and meta description derive from MDX frontmatter (`generateMetadata` in `app/(site)/articles/[slug]/page.tsx`). Frontmatter edits are metadata-only and in-scope.

Target pages (from snapshot 2026-05-22):

| Slug | Impr | CTR | Pos | Trend (90d) |
| --- | ---: | ---: | ---: | --- |
| `building-location-based-features-using-expo-location` | 161,827 | 0.25% | 6.8 | — |
| `slow-android-emulator-flutter-dev` | 74,065 | 0.32% | 5.9 | -16% |
| `managing-secrets-firebase-apphosting-yaml-nextjs` | 44,899 | 0.40% | 7.5 | -60% |
| `react-19-features-and-design-patterns` | 16,635 | 0.32% | 9.1 | — |

Rules: titles ≤60 visible chars before the `| Anthony Coffey` template suffix; lead with the dominant query phrase; meta description states the concrete outcome a reader gets (the click hook).

### WS2 — Structured data enhancements

`app/(site)/articles/[slug]/page.tsx` already emits `BlogPosting` + `BreadcrumbList`. Extend:

- `dateModified` reads frontmatter `updated` (already used in sitemap for portfolio; extend the article frontmatter type if missing).
- `FAQPage` / `HowTo` JSON-LD emitted conditionally when the article body already contains matching visible Q&A or step content. Pages without such content log a candidate row for the editorial calendar and skip schema emission.
- Validate every changed article URL with the `schema_validate` MCP tool post-deploy.

### WS3 — RelatedPosts component (TDD)

The one genuine infrastructure gap. Build `components/RelatedPosts.tsx`:

- Inputs: current slug, current tags, current category.
- Algorithm: rank other published posts by (a) shared-tag count, (b) same category as tiebreaker, (c) `publishedAt` recency as final tiebreaker. Take top 3, exclude current slug.
- Reuses `getAllBlogPosts` from `app/(site)/articles/utils`.
- TDD: RED test first — given a corpus and a current article, asserts the top-3 are correctly ordered. Then GREEN implement.

### WS4 — Sitemap & crawl signals

- `app/sitemap.ts` line 30: change articles' `lastModified` to `post.metadata.updated ?? post.metadata.publishedAt` (mirrors the portfolio pattern on line 58).
- Extend the article frontmatter type in `app/(site)/articles/utils.ts` to include optional `updated`.
- Submit the four WS1 URLs (and any article whose `updated` changes during the sprint) to Bing via the `bing_index_now` MCP tool.

### WS5 — Core Web Vitals baseline

Run `pagespeed_core_web_vitals` against the top 5 pages, record LCP / CLS / INP in a baseline table in this spec under Notes. Fix any regressions the data justifies — prime suspect is the homepage Three.js path (per-slug lazy-loading already exists for articles; verify the homepage parity).

### WS6 — Cannibalization & striking-distance review

- For the two adjacent pairs flagged in `content-disposition.md` (`building-an-mdx-powered-blog-...` vs `step-by-step-building-your-blog-...`, and `building-interactive-3d-...` vs `three-js-portfolio-...`): if both rank for overlapping queries, set an explicit canonical on the weaker page pointing at the stronger one, or document a consolidation recommendation for the editorial calendar.
- Confirm pos 5-9 queries from the snapshot have on-page heading/anchor coverage in the relevant articles (auto-anchors are emitted by `createHeading` in `components/mdx.tsx`).

## Edge cases

- [ ] An article has no `updated` frontmatter — sitemap and BlogPosting fall back to `publishedAt` (existing behavior preserved).
- [ ] A heading in MDX contains characters the slugify function strips entirely — anchor may collide; `createHeading` in `components/mdx.tsx` does not currently de-duplicate. Out of scope for this sprint; log if encountered.
- [ ] An article has fewer than 3 viable related posts — `RelatedPosts` renders only as many as it has (no padding with unrelated posts).
- [ ] `bing_index_now` rate-limits — submit in batches and log skipped URLs.
- [ ] `pagespeed_core_web_vitals` MCP rate-limits (already observed) — capture baseline opportunistically; do not block the sprint.

## Acceptance criteria

1. `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` all green.
2. `RelatedPosts` component test passes (RED → GREEN demonstrated in git history).
3. `schema_validate` MCP tool reports zero errors on the four WS1 article URLs after deploy.
4. The four WS1 pages render updated `<title>` and `<meta name="description">` matching the new frontmatter (verified via `view-source` or Rich Results Test).
5. `app/sitemap.ts` output for refreshed articles reflects the `updated` date.
6. Post-deploy `npm run seo:diff -- 2026-05-22` shows a measurable directional movement on the four WS1 pages (target: +0.2 percentage points CTR within 6 weeks; reported in a follow-up snapshot review, not gated on merge).
7. Two cannibalization decisions documented in `docs/strategy/content-disposition.md`.

## Constraints

- Spec-first DDD + TDD per `docs/documentation/development-standards.md`. Spec drives to `ready` before code.
- No article prose rewrites (out of scope; editorial calendar owns).
- Google Search Console MCP currently unauthenticated for `coffey-codes` (`bing` works). All required signals are recoverable from the periscope snapshot at `docs/strategy/data/snapshot-2026-05-22.md` if re-auth blocks.

## Tasks

- [ ] WS0: Re-auth GSC MCP (optional — periscope snapshot is the primary source)
- [ ] WS1: Rewrite `title` + `summary` frontmatter on the four high-impression articles
- [ ] WS2a: Extend `BlogPosting` JSON-LD with `dateModified` from frontmatter `updated`
- [ ] WS2b: Add conditional `FAQPage` / `HowTo` JSON-LD where article body already supports it
- [ ] WS2c: Validate changed pages with `schema_validate` MCP
- [ ] WS3a: RED component test for `RelatedPosts` ranking
- [ ] WS3b: GREEN implement `components/RelatedPosts.tsx`
- [ ] WS3c: Render `RelatedPosts` in `app/(site)/articles/[slug]/page.tsx`
- [ ] WS4a: Sitemap `lastModified` reads `updated ?? publishedAt`
- [ ] WS4b: Article frontmatter type extended with optional `updated`
- [ ] WS4c: Bing IndexNow submission for WS1 URLs
- [ ] WS5: Capture CWV baseline in this spec's Notes section
- [ ] WS6a: Cannibalization decision for the two adjacent article pairs
- [ ] WS6b: Striking-distance heading/anchor coverage check

## Notes

- Source data: `docs/strategy/data/snapshot-2026-05-22.md` (pulled 2026-05-22T04:15:31.230Z, 365-day window).
- Related specs: SPEC-017 (content strategy; owns article prose), SPEC-013 (GSC issue remediation), SPEC-016 (SEO strategy), SPEC-018 (multi-engine snapshot), SPEC-023 (Periscope tool suite).
- Strategy docs: `docs/strategy/editorial-calendar.md`, `docs/strategy/content-disposition.md`.
- Approved plan: `C:\Users\coffe\.claude\plans\using-seo-data-from-jiggly-lightning.md`.
- CWV baseline table: _to be filled by WS5 once PageSpeed API rate-limit clears._

### Sprint progress log (2026-05-22)

- **WS0** ✅ Spec scaffolded at `ready`. GSC MCP re-auth ran in PowerShell (`npx search-console-mcp setup` reported all engines connected); the in-Claude stdio MCP server still holds stale state and requires a Claude restart to read fresh tokens from Windows Credential Manager.
- **WS1** ✅ Title + summary + `updated` rewritten on all 4 high-impression articles. Rationale per article documented in the approved plan.
- **WS2a** ✅ Discovered already implemented — `app/(site)/articles/[slug]/page.tsx` line 153-157 already reads `post.metadata.updated || post.mtime || post.metadata.publishedAt` into BlogPosting `dateModified`. The WS1 `updated` additions immediately feed the JSON-LD for free.
- **WS2b** ⏸ Deferred. FAQPage / HowTo schema requires matching visible content per Google guideline; the four WS1 articles don't have an explicit Q&A section, and adding one is a prose edit (out of sprint scope per the approved plan). Logged as an editorial-calendar candidate.
- **WS2c** ⏸ Pending deploy — `schema_validate` MCP call should run against the four article URLs once they're live.
- **WS3** ✅ `components/RelatedPosts.tsx` (98 lines) + `__tests__/components/RelatedPosts.test.tsx` (10 tests). TDD: RED then GREEN demonstrated in commit history. Pure `selectRelatedPosts` ranker exported separately for testability. Wired into article template foot (above `<CommentsLazy />`).
- **WS4a** ✅ `app/sitemap.ts` line 30 now uses `post.metadata.updated ?? post.metadata.publishedAt`.
- **WS4b** ✅ Discovered already implemented — `Metadata` type in `app/(site)/articles/utils.ts` line 11 already has `updated?: string` and the parser at line 61 handles it.
- **WS4c** ✅ Submitted 4 URLs to Bing via `bing_url_submit_batch` MCP — "Successfully submitted 4 URLs in batch."
- **WS5** ⏸ Blocked by PageSpeed API rate limit (consistent error across multiple attempts). Re-run when the limit clears.
- **WS6** ✅ Closed against live GSC (90-day window). Findings:
  - **Pair #13/#14 (mdx-blog) and pair #12/#20 (three-js)**: **no cannibalization detected**. The hypothesis from `content-disposition.md` was wrong — these pairs coexist cleanly. **No canonicals needed.**
  - **One real cannibalization issue**: the `react-19-features-and-design-patterns` article cannibalizes itself. Google indexes the article's anchor fragments (`#actions-api`, `#react-compiler`, `#resource-loading-patterns`) as separate URLs that compete with the parent URL for `react 19 new features and patterns` (177 total impressions, 0 clicks across 4 URL variants — parent at 48 impr + 3 anchors at 43 impr each). A fourth anchor `#streaming-patterns` ranks for the same query at 26 impressions per `seo_striking_distance` but sits below the cannibalization tool's surfacing threshold. Not fixable via canonical (anchor fragments share the canonical with the parent). Logged as an editorial item — the article TOC's prominent anchor links are the structural cause, and a content refresh (per the editorial calendar) is the appropriate fix vehicle.
  - **Striking-distance heading coverage** spot-checked against the live pull: all WS1-rewritten articles already have on-page heading coverage for their position 8-15 queries (auto-anchored by `components/mdx.tsx` `createHeading`). The biggest unaddressed cluster is the Expo-location function-name long-tails, which are owned by Editorial Slot 2 in `docs/strategy/editorial-calendar.md`.
  - **Low-CTR validation** of WS1: `expo location` (3,615 impr, 0.19% CTR, benchmark 2%) and `expo-location` (2,003 impr, 0.30%, benchmark 3%) are both 10x below benchmark — confirms WS1's thesis that the parent article's SERP snippet wasn't satisfying head queries.
  - Live data pulled via `seo_cannibalization` / `seo_striking_distance` / `seo_low_ctr_opportunities` MCP calls on 2026-05-22 via the Google service-account auth path.
- **Verification** ✅ `npm run typecheck` clean, `npm run lint` clean (after `.claude/worktrees/**` + `**/.next/**` added to ignore list — see "Sprint-adjacent fix" below), `npm test` 286/286 passing across 53 files, `npm run build` clean.

### Sprint-adjacent fix

`eslint.config.mjs` was ignoring `.next` at the repo root but not `**/.next/**`. The `.claude/worktrees/loving-davinci-930c4c/.next/build/chunks/` directory contains transpiled build artifacts that were generating ~22,000 phantom lint errors. Added two ignore entries: `**/.next/**` and `.claude/worktrees/**`. Sprint-adjacent technical hygiene; not within the on-page SEO scope but blocked the sprint's lint verification.

### Post-deploy verification checklist

- [ ] `npm run seo:snapshot` after deploy.
- [ ] `npm run seo:diff -- 2026-05-22` to baseline CTR/impression deltas on the four WS1 pages.
- [x] `mcp__search-console__schema_validate` on each of the four WS1 article URLs — **all four `valid: true`, zero errors** (2026-05-23, post-merge). Live BlogPosting JSON-LD confirms the new `headline`, `description`, `dateModified: 2026-05-22T00:00:00.000Z`, and OG image URLs with the rewritten titles are deployed.
- [ ] PageSpeed baseline on the top 5 pages when rate limit clears (still rate-limited as of 2026-05-23).
- [ ] Six-week follow-up: rerun `seo:diff` and record movement against the snapshot in `docs/strategy/data/`.

### Regression coverage added (PR #211)

- `__tests__/sitemap.test.ts` (new) — asserts article sitemap entries use `metadata.updated ?? metadata.publishedAt` for `lastModified`. WS4 wiring is now regression-protected.
- `__tests__/articles/slug-page.test.tsx` — added: `BlogPosting.dateModified` reads from frontmatter `updated:` with precedence over `mtime` and `publishedAt`; `RelatedPosts` is rendered on the article page when shared-tag candidates exist (and not rendered when none exist). WS2a + WS3 wiring are now regression-protected.
- Test suite is now 292 passing (up from 286), 54 files.
