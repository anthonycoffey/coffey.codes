---
id: SPEC-017
title: 'Content strategy, post-audit (editorial direction and authority)'
status: in-progress
created: 2026-05-10
author: Anthony Coffey
reviewers: []
affected_repos: [coffey.codes]
---

## Reviewer Notes

<!-- Leave empty until code review. When requesting changes, reviewer adds feedback here: -->

## Status

**2026-05-11**: Bookkeeping (one-shot) shipped. The three required docs ([`content-disposition.md`](../../strategy/content-disposition.md), [`editorial-calendar.md`](../../strategy/editorial-calendar.md), [`voice-and-style.md`](../../documentation/guides/voice-and-style.md)) plus the nice-to-have [`content-brief-template.md`](../../templates/content-brief-template.md) are in place. The remaining tasks are long-running editorial commitments tied to the 2026-Q3 and 2026-Q4 calendar slots; the spec stays `in-progress` until the Q3 review (target 2026-08-10) is written.

---

# Feature: Content strategy, post-audit (editorial direction and authority)

## Problem

The site has 26 articles. 5 of them produce 96% of organic clicks. The Mobile Development pillar carries 77% of clicks; the Software Engineering pillar produces zero clicks across 4 articles. Three of the top four articles by clicks are declining quarter-over-quarter. The vibe-coding cluster has the highest CTR on the site (4-7%) but the lowest impression volume and is also declining.

These are facts from [`docs/strategy/seo-audit-2026-Q2.md`](docs/strategy/seo-audit-2026-Q2.md). They define what content strategy means for this site right now: not "produce more articles," but "decide what to keep, what to refresh, what to deprecate, and what new pieces close the gaps the audit surfaced."

The site also exists for a second purpose that the audit cannot measure: positioning Anthony as a credible engineer-author whose writing demonstrates expertise. The "Win Without Pitching" frame applies. Present, do not pursue. The site is not a lead-generation funnel and the editorial standard is that articles read like work, not like marketing.

This spec is the editorial layer. It owns: pillar disposition, refresh policy, deprecation policy, new-article topic selection, voice and editorial standards, and the authority-positioning question. The technical and on-page layer (titles, metadata, schema, anchors, instrumentation) is SPEC-016, a sibling spec that ships on its own cadence.

## Requirements

### Must have

1. WHEN a topic candidate is being considered for a new article, it SHALL be tested against the audit's striking-distance, low-hanging-fruit, and zero-click-anchor data first; topics with no audit signal are written only if they pass the editorial-quality bar in must-have #5 below.
2. WHEN an existing article is selected for refresh, the refresh SHALL include a meaningful body update (not a typo or formatting fix), a bumped `updated:` frontmatter field (paired with SPEC-016 must-have #2), and a one-line changelog entry inside the article noting what changed and when.
3. WHEN an article is selected for deprecation, the URL SHALL either redirect to a sibling article (1-hop 308, per SPEC-013's redirect convention) or remain published with a `noindex` and a top-of-page note flagging the article as historical, depending on whether the topic is still being searched.
4. WHEN a new article is published, it SHALL declare a category from the canonical pillar set (Web Development, Mobile Development, Cloud & DevOps, Software Engineering, Tools & Productivity) and SHALL NOT introduce a new ad-hoc pillar.
5. WHEN any new or refreshed article copy is drafted, it SHALL respect the documented voice rules: no em-dashes, no marketing-flourish tricolons, no closing-flourish summaries, no AI-slop tone, no parallel-structure decoration, no selling. The Win Without Pitching posture applies; the article presents work and does not pursue the reader.
6. WHEN the editorial calendar is set, it SHALL declare a target publish cadence (e.g. one new article per N weeks) and at least one quarterly refresh slot for an existing article. The cadence is a constraint on volume, not a quota; the quality bar in must-have #5 supersedes calendar pressure.
7. WHEN the Software Engineering pillar (4 articles, zero traffic in audit Section 10) is reviewed, the project SHALL make an explicit deprecate-or-refresh decision for each of the 4 articles, with the decision and reasoning recorded in [`docs/strategy/content-disposition.md`](docs/strategy/content-disposition.md).
8. WHEN the next quarterly content review runs (target 2026-08-10, paired with SPEC-016's Q3 audit), the review SHALL produce a delta against this spec's editorial calendar: what shipped, what slipped, what the audit data now suggests.

### Nice to have

- A content-brief template at [`docs/templates/content-brief-template.md`](docs/templates/content-brief-template.md) so each new article goes through a consistent pre-write step (working title, target queries from audit, outline, distinctive angle, voice check, internal links).
- An explicit "opinion piece" track separate from the how-to track. How-tos earn search traffic; opinion pieces build the authority signal that audit data cannot capture but that drives the AI-assistant citation channel (ChatGPT, Gemini referrals in audit Section 9.5).
- A short author-bio refresh on the homepage and `/articles` page that reads like the rest of the site (no marketing copy, two or three sentences max). Coordinates with SPEC-016 must-have #5.
- Distribution lightweight: when a new article publishes, push to LinkedIn, GitHub README pinned posts, and the existing RSS feed. Do not build new channels; use what's already wired.
- Annual editorial review (every 2026-12 or 2027-01) that re-evaluates pillars from scratch. Pillars are a useful organizing primitive for this audit cycle but should not become permanent.

### Non-goals (what this does NOT do)

- This spec does NOT change article rendering, schema, metadata, or anchor IDs. SPEC-016 owns those.
- This spec does NOT optimize Core Web Vitals or load performance. SPEC-014 owns CWV on article routes.
- This spec does NOT acquire backlinks or run outbound PR. Authority comes from writing well, being cited, and being findable, not from link-building campaigns.
- This spec does NOT add a sales funnel, gated downloads, email capture, or any lead-generation surface. Win Without Pitching applies; the contact form is the only "conversion" surface and stays the only one.
- This spec does NOT lock in a permanent pillar taxonomy. Pillars are a current-state organizational call; they can be revised in the annual review (Nice-to-have #5).
- This spec does NOT prescribe specific article topics with publish dates. The editorial calendar (must-have #6) declares cadence; the per-article topic call is a per-cycle judgment using audit data as input.
- This spec does NOT write the audit itself. SPEC-015 produced it; this spec consumes it.

## Design

### Disposition matrix for the existing 26 articles

Three buckets. Each article goes in exactly one. Decisions are recorded in [`docs/strategy/content-disposition.md`](docs/strategy/content-disposition.md), which the implementer creates as part of must-have #7.

**Bucket A, Refresh** (decline-and-still-relevant; the editorial bet is that an updated version recovers traffic):

| Article | 365d clicks | 90d trend | Why refresh |
| --- | --- | --- | --- |
| `vibe-coding-building-an-app-entirely-with-ai-prompts` | 248 | -33% | Highest CTR cluster on the site (4-7%); a refresh + companion piece is the highest-leverage editorial move. Topic is still searched (audit Section 4). |
| `slow-android-emulator-flutter-dev` | 236 | -16% | 71,131 impressions on stable evergreen queries. Audit Section 5 striking-distance shows there's still demand. |
| `managing-secrets-firebase-apphosting-yaml-nextjs` | 180 | -60% | Steepest decline of any top page. Firebase docs may have shifted; the article likely needs reverification against current Firebase CLI behavior. |
| `react-19-features-and-design-patterns` | 52 | (not flagged) | Anchor URLs rank but get zero clicks; refresh might tighten the body or split into multiple shorter pieces (decision deferred to refresh time). |

**Bucket B, Deprecate-via-redirect** (low/no traffic, topic over-saturated, no obvious refresh angle):

The 4 Software Engineering pillar articles are the primary candidates per audit Section 10:

- `embracing-clean-code-principles` (2024-04)
- `javascript-design-patterns` (2023-02)
- `tips-for-troubleshooting-and-debugging-code` (2023-02)
- `unit-testing-in-python-with-pytest` (2023-02)

For each, the implementer (Anthony) decides: does this topic still represent the kind of work the site exists to showcase? If yes, refresh. If no, redirect to `/articles` with a 308. Do not silently delete; link equity (however small) and any AI-citation footprint should land on a real page.

**Bucket C, Keep as-is** (the rest, including the long tail of articles that get a few impressions per quarter; they cost nothing to leave published and the cumulative tail-impressions are not zero):

The 17 articles not in Bucket A or B. Re-evaluate at the annual review.

### Editorial calendar

Cadence: **one new article per 4-6 weeks**, **one refresh per quarter**. Targets, not quotas. Skipping a slot is preferable to publishing a piece that fails the voice bar.

The calendar lives in [`docs/strategy/editorial-calendar.md`](docs/strategy/editorial-calendar.md). Each entry has: working title, target queries (from audit), pillar, status (planned / drafted / shipped / skipped), and a one-line "what this article demonstrates" statement that justifies its existence beyond search-volume math.

The first quarter's slots, derived from the audit:

| Slot | Type | Topic candidate | Audit signal |
| --- | --- | --- | --- |
| 2026-Q3 refresh | Refresh | `vibe-coding-building-an-app-entirely-with-ai-prompts` | -33% trend, top-CTR cluster |
| 2026-Q3 new | New | Expo Location deep-dive: `requestForegroundPermissionsAsync`, geofencing, background tracking | 14 striking-distance queries on the parent article (audit Section 5); ~3,600 potential clicks on the cluster (Section 6) |
| 2026-Q3 new (optional) | New | Vibe-coding companion: a follow-up Flutter project or a different stack | 2,290 impressions across 6 vibe-coding queries (audit Section 4); cluster is high-CTR but low-volume |
| 2026-Q4 new | New | Firebase App Hosting environment-variable patterns | striking-distance queries on `apphosting.yaml`, `firebase apphosting:secrets:set` (audit Section 5) |
| 2026-Q4 refresh | Refresh | `slow-android-emulator-flutter-dev` | -16% trend, 71,131 impressions, evergreen |

Calendar slots beyond Q4 are a Q3-review concern.

### Topic-selection methodology

For new articles, walk this checklist before drafting:

1. **Is the topic in audit striking-distance, low-hanging-fruit, or anchor-zero-click data?** If yes, the topic has measured demand on this property. Skip to step 4.
2. **Is the topic adjacent to a Bucket A article?** Adjacent means it ranks for a query the parent article doesn't fully satisfy (function-name long-tails are the canonical example). Skip to step 4.
3. **Does the topic exist outside audit data because it represents work Anthony actually did?** Articles like `vibe-coding-building-an-app-entirely-with-ai-prompts` were likely written without prior demand signal but earned traffic because they document distinctive work. The voice rule supersedes the search rule when the work is genuine.
4. **Voice check**: does the working title invite an em-dash, a tricolon, or a marketing flourish? If yes, the topic might be fine but the framing is wrong. Reframe before drafting.
5. **Internal-link check**: which existing articles will link to this one, and which will it link to? An article with no plausible internal links is suspicious; either the pillar is wrong or the topic is too niche.

### Voice and editorial standards

Codifies the project's voice rules so future drafts have a single reference. Lives in [`docs/documentation/guides/voice-and-style.md`](docs/documentation/guides/voice-and-style.md). Required content:

- **No em-dashes.** Use commas, periods, parentheses, or sentences.
- **No marketing tricolons.** "Fast, reliable, scalable" patterns are forbidden.
- **No closing-flourish summaries.** End the article when the work is done; do not write a "wrapping up" or "key takeaways" section that re-states what the body already covered.
- **No parallel-structure decoration.** A list of three rhetorical pairs is decoration, not information.
- **No AI-slop tone.** Avoid: "let's dive in", "in the world of X", "imagine a world where", "the importance of cannot be overstated", "buckle up". The voice check is: does this read like Anthony wrote it, or like a pattern-completing language model wrote it?
- **No selling.** Articles describe work. They do not invite the reader to hire the author. The contact form is the only invitation surface and it stays implicit (in the nav, not in the article body).
- **Win Without Pitching posture.** Present, do not pursue. An article ends; it does not push.

The guide is short on purpose. Long style guides erode in practice. One page of rules with examples is the limit.

### Authority positioning

The audit cannot measure authority. The proxies it can measure (24 ChatGPT referrals, 9 Gemini referrals in 180 days, audit Section 9.5) suggest the AI-citation channel is small but real. The strategy:

- Write articles that demonstrate work, not that explain known concepts. "I built X and these are the decisions" beats "here is how X works" when X is well-documented elsewhere.
- The vibe-coding article is the existing template: it documented a project nobody else had documented, in the author's voice, and earned the highest CTR on the site as a result.
- The Expo Location deep-dive (Q3 calendar slot) is the next test: the parent article gets 150,793 impressions on function-name queries it doesn't satisfy. A companion piece written from real-project decisions (not Expo's docs paraphrased) is the same template applied to a different topic.
- Opinion-piece track (nice-to-have): one or two pieces a year that are explicitly not how-to. They take a position on a subject the author has direct experience with. They do not earn search traffic; they earn citations.

The site's About page and homepage bio are entity signals; they should reinforce the same posture (specific, undecorated, work-evidence-first).

### Distribution

Use what's already wired. Do not build new surfaces.

- Each new article publishes through the standard MDX pipeline. Vercel auto-deploys; the RSS feed picks it up.
- Manual push: LinkedIn (one post per article, link plus a one-paragraph framing in the article's own voice), GitHub profile README "recent writing" pinned section.
- No newsletter. No paid distribution. No syndication networks. The bar to add a channel is: "this channel demonstrably surfaces the writing to people the writing is for, and the manual cost is small."

### Refresh mechanics

When a Bucket A article is refreshed:

1. Read the article fresh; identify what is now wrong, what is now stale, what the audit data suggests is being missed.
2. Edit the body. Material changes only; typo or formatting passes do not count as a refresh.
3. Add a `## Updated YYYY-MM-DD` heading near the top of the article body with a one-sentence note: what changed, why.
4. Set the frontmatter `updated:` field to the publish date of the refresh (paired with SPEC-016 must-have #2).
5. Do not change `publishedAt`. The article keeps its original publish date for archival accuracy.
6. Ship as a single PR titled `content: refresh <slug> [SPEC-017]`. PR body cites the audit signal that drove the refresh.

### Deprecation mechanics

When a Bucket B article is deprecated by redirect:

1. Add the source-to-target entry in `next.config.js` `redirects()` (308, single hop, per SPEC-013's redirect convention).
2. Delete or rename the MDX file in `app/(site)/articles/posts/`. Renaming with a `.archived.mdx` extension keeps the source visible in git but excludes it from the build.
3. Note the deprecation in [`docs/strategy/content-disposition.md`](docs/strategy/content-disposition.md) with the date and the reason.

When a Bucket B article is deprecated by `noindex` (rare, only for articles with a small but genuine ongoing audience):

1. Add `noindex: true` to the frontmatter or equivalent metadata flag.
2. Add a top-of-page note to the article body: "This article is from <year> and is preserved for archival purposes. The current state of the topic may differ."
3. Note in `content-disposition.md` why the article was kept rather than redirected.

## Edge cases

- [ ] If an article in Bucket A is refreshed but traffic continues to decline 60+ days after the refresh, treat as signal that the topic is genuinely fading; reclassify to Bucket B at the next quarterly review.
- [ ] If a new article fails the voice check during drafting and the angle cannot be reframed without losing the topic, abandon the draft. The skipped calendar slot is preferable.
- [ ] If a Bucket B article being redirected has any remaining backlinks (verify via a backlink check before redirecting), prefer the `noindex` path so external referrers still resolve.
- [ ] If the audit's data shows traffic on an article that is in Bucket B at the time of decision, recheck the audit window; the article may have re-emerged. Move to Bucket A.
- [ ] If the editorial calendar slips by 2+ slots in a row, do not "catch up" by publishing two articles in the same slot. The voice bar drops faster than backlogged enthusiasm fixes.
- [ ] If a new article's draft references the contact form, a hire-me link, or any selling surface, remove it. Win Without Pitching applies. The site's affordances handle the implicit invitation.
- [ ] If a refresh introduces a new sub-topic that warrants its own article (common during deep refreshes), spin the sub-topic into a new calendar slot rather than padding the original article.
- [ ] If the AI-citation channel grows beyond ~5% of total sessions, that signal should drive the next strategy revision. Currently it's ~0.5% of sessions (33 of 6,792); below the noise floor.

## Acceptance criteria

1. [`docs/strategy/content-disposition.md`](docs/strategy/content-disposition.md) exists and lists every one of the 26 current articles with a Bucket assignment (A / B / C) and a one-line reason.
2. [`docs/strategy/editorial-calendar.md`](docs/strategy/editorial-calendar.md) exists with at least the Q3 and Q4 2026 slots documented, each entry containing working title, target queries (from audit), pillar, status, and the "what this demonstrates" statement.
3. [`docs/documentation/guides/voice-and-style.md`](docs/documentation/guides/voice-and-style.md) exists, is under 600 words, and matches the voice rules in Design > Voice and editorial standards.
4. The 4 Software Engineering pillar articles each have a documented disposition (refresh, redirect, or noindex-and-keep) by the next quarterly review (2026-08-10).
5. The first refreshed article in Bucket A has shipped (PR merged) by 2026-09-30. The first new article from the Q3 calendar slot has shipped by 2026-10-15. Both ship dates are commitment dates for the calendar; missing them triggers a calendar revision at the Q3 review, not a panic ship.
6. The next quarterly content review (2026-08-10) produces a delta document at [`docs/strategy/content-review-2026-Q3.md`](docs/strategy/content-review-2026-Q3.md) covering: what shipped, what slipped, audit-data deltas vs. Q2, and adjustments to the calendar.
7. No article published or refreshed under this spec contains an em-dash, a marketing tricolon, or a closing-flourish summary, verified by `grep` for the em-dash character across `app/(site)/articles/posts/*.mdx` returning zero matches and a manual reading pass on each shipped article.

## Constraints

- Editorial work is the author's labor. Cadence in must-have #6 is the upper bound, not the floor.
- No new dependencies. The MDX pipeline, frontmatter, and existing renderer absorb everything this spec requires.
- All shipped content is reviewed against the voice guide before merge. The author is the reviewer; the guide is the standard.
- The contact form is the only conversion surface. No newsletters, no gated content, no email capture.
- Spec-driven workflow per project convention: changes ship as PRs scoped to a single content action (one refresh, one new article, one disposition decision per PR), with the PR body citing the audit number or strategy decision that justifies the change.

## Tasks

### Bookkeeping (one-shot)

- [x] Create [`docs/strategy/content-disposition.md`](../../strategy/content-disposition.md) with all 26 articles bucketed (A / B / C)
- [x] Create [`docs/strategy/editorial-calendar.md`](../../strategy/editorial-calendar.md) with Q3 and Q4 2026 slots
- [x] Create [`docs/documentation/guides/voice-and-style.md`](../../documentation/guides/voice-and-style.md)
- [x] (Nice-to-have) Create [`docs/templates/content-brief-template.md`](../../templates/content-brief-template.md)

### Q3 2026 (target ship dates per acceptance criterion #5)

- [ ] Refresh `vibe-coding-building-an-app-entirely-with-ai-prompts` (target 2026-09-30)
- [ ] New article: Expo Location deep-dive (target 2026-10-15)
- [ ] (Optional) Vibe-coding companion piece (no target; ships if it earns the slot)

### Q4 2026

- [ ] New article: Firebase App Hosting environment-variable patterns
- [ ] Refresh `slow-android-emulator-flutter-dev`

### Software Engineering pillar disposition (must-have #7)

- [ ] Decide and document for `embracing-clean-code-principles`
- [ ] Decide and document for `javascript-design-patterns`
- [ ] Decide and document for `tips-for-troubleshooting-and-debugging-code`
- [ ] Decide and document for `unit-testing-in-python-with-pytest`
- [ ] Execute (refresh PR, redirect PR, or noindex PR) per decision

### Quarterly review (must-have #8)

- [ ] Run Q3 audit (SPEC-016 must-have #10) and pull deltas
- [ ] Write [`docs/strategy/content-review-2026-Q3.md`](docs/strategy/content-review-2026-Q3.md)
- [ ] Adjust calendar based on Q3 findings

### Distribution (Nice-to-have)

- [ ] LinkedIn post on each new or refreshed article ship
- [ ] Update GitHub profile README pinned-writing section after each ship

### Authority track (Nice-to-have)

- [ ] At least one opinion piece in 2026 (no calendar slot; ships when one is genuinely worth writing)
- [ ] About page voice review (coordinate with SPEC-016 homepage rewrite)

### Annual review

- [ ] 2026-12-01 calendar reminder: re-evaluate pillar taxonomy from scratch

## Notes

- **Source data**: [`docs/strategy/seo-audit-2026-Q2.md`](docs/strategy/seo-audit-2026-Q2.md). Every Bucket A and Q3 calendar slot traces to a numbered finding in the audit.
- **Sibling spec**: [`SPEC-016-seo-strategy.md`](../archive/SPEC-016-seo-strategy.md) (now archived, `status: complete`) owned the technical and on-page layer through Q2 2026. The follow-up technical sprint shipped as [`SPEC-030-technical-seo-sprint-ctr-recovery.md`](../archive/SPEC-030-technical-seo-sprint-ctr-recovery.md) on 2026-05-23 (CTR-recovery metadata rewrites, RelatedPosts component, sitemap fix, GSC indexation rescue). SPEC-030's WS1 metadata-only edits on the four Bucket A articles do not substitute for the full editorial refreshes this spec still owns (see Tasks > Q3 / Q4 2026).
- **Related specs (all archived, `status: complete`)**:
  - [SPEC-013](../archive/SPEC-013-gsc-issue-remediation.md) (GSC issue remediation). Establishes the 308 single-hop redirect convention used in the deprecation mechanics above.
  - [SPEC-014](../archive/SPEC-014-article-perf-a11y-polish.md) (article perf and a11y). Owned CWV; this spec does not.
  - [SPEC-015](../archive/SPEC-015-seo-audit-data-driven.md) (SEO audit, data-driven). Produced the data this spec consumes.
- **Voice references**:
  - The user's auto-memory `feedback_voice_no_em_dashes.md` is the canonical voice rule source. The voice-and-style guide produced under this spec restates and expands on those rules.
  - "Win Without Pitching" by Blair Enns is the underlying posture (memory: `feedback_blair_enns.md`). Articles present work; they do not pursue the reader.
- **What this spec deliberately does not promise**:
  - A rank, traffic, or CTR target. Editorial work moves slowly; numeric targets distort the voice bar.
  - A specific article every N weeks. The cadence is a guide; quality bar supersedes calendar pressure.
  - A "personal brand" outcome. Authority is a side-effect of writing well over time. It is not a deliverable that can be specced.
- **Measurement window**: refreshes typically show signal at 30-60 days; new articles at 60-90 days; the authority signal at 6-12 months. Do not iterate the strategy on shorter windows than these.
