---
id: SPEC-015
title: 'SEO audit — data-driven, via search-console MCP'
status: complete
created: 2026-05-10
author: Anthony Coffey
reviewers: []
affected_repos: [coffey.codes]
---

## Reviewer Notes

<!-- Leave empty until code review. When requesting changes, reviewer adds feedback here: -->

---

# Feature: SEO audit — data-driven, via search-console MCP

## Problem

Post-SPEC-013 the site has a clean SEO surface area (Organization publisher with logo, BreadcrumbList, OG hardening, pagination noindex). What is still missing is a **grounded** picture of what's actually working in search and where the leverage is. SPEC-013's audit was code-only because the Ahrefs MCP returns `Insufficient plan` and there was no other data path.

The `search-console-mcp` plugin is now wired into Claude Code. GSC, Bing, and GA4 data are all queryable in-session (the GA4 banner had reported `✘` at spec-write time but turned out to be authenticated by audit time — `analytics_realtime` against propertyId `416080229` returned live data). This spec produces the **audit** — a frozen snapshot of where the site actually stands in search, with real impressions, clicks, queries, and per-page metrics — that a follow-up content-strategy spec can build on.

The audit is data-first. Every recommendation must be grounded in a number from the MCP, not a guess.

## Requirements

### Must have

1. WHEN a Claude Code session starts in this repo, the `search-console` MCP SHALL be available as `mcp__search-console__*` tools and `claude mcp list` SHALL report it `✓ Connected`.
2. WHEN the audit runs, it SHALL use the `search-console-mcp` server **as the sole data source** for GSC, Bing, and GA4 metrics. It SHALL NOT call the Ahrefs MCP (gated by plan), the bundled `gsc-*` tools on the Ahrefs MCP (same gate), or scrape any data via WebFetch.
3. WHEN the audit runs, it SHALL pull at least 90 days of data covering: pages (clicks, impressions, CTR, position), queries (same metrics + position bucket), country breakdown, device breakdown, and the CTR-by-position curve.
4. WHEN the audit runs, it SHALL execute each of these MCP tool calls at minimum, against the verified property URL:
   - `sites_list`, `sites_health_check`, `sitemaps_list`
   - `seo_striking_distance`, `seo_low_hanging_fruit`, `seo_cannibalization`, `seo_lost_queries`
   - `analytics_query`, `analytics_trends`, `analytics_anomalies`, `analytics_time_series`
   - `opportunity_matrix`, `page_analysis`, `compare_engines`
   - `bing_analytics_query`, `bing_opportunity_finder`
   - `inspection_inspect`, `pagespeed_analyze`, `schema_validate` (on the top 5 pages by clicks)
5. WHEN the audit doc is written, it SHALL exist at `docs/strategy/seo-audit-2026-Q2.md` with the date range queried, totals, and per-pillar performance broken down by the categories already in use (Web Development, Mobile Development, Cloud & DevOps, Software Engineering, Tools & Productivity).
6. WHEN the audit doc references on-page artifacts, every file path SHALL resolve to a real file in the repo.
7. WHEN the audit doc lists recommendations, every "quick win" item SHALL cite a specific number from the MCP data (e.g. "page X is at average position 8.4 for query Y with CTR 0.6% versus a position-curve expectation of ~6%").
8. WHEN the audit completes, `docs/README.md` SHALL list `docs/strategy/` in the folder map.

### Nice to have

- A snapshot script (`scripts/seo-snapshot.mjs` or similar) that re-runs the data pulls and saves CSV/JSON snapshots into `docs/strategy/data/` for quarterly re-runs without copy-pasting from the chat.
- GA4 cross-reference (only if `--engine=ga4` setup completes): which referral / direct / search-driven sessions actually convert on `/contact` form submissions, by landing page.
- A short voice-cleanup callout for any LP copy that violates the user's voice rules (em-dashes, parallel-structure flourishes); track separately if scope balloons.

### Non-goals (what this does NOT do)

- This spec does NOT change article or page content. Content edits happen in subsequent SPECs once the strategy points to specific articles.
- This spec does NOT produce the **content strategy doc** (`docs/strategy/content-strategy.md`) — that is the next, separate spec, and it depends on this one being complete.
- This spec does NOT implement quick-win SEO fixes (per-page OG, `dateModified`, `sameAs`). If the audit confirms they're worth doing, they become their own SPEC.
- This spec does NOT cover Ahrefs MCP. That account is gated by plan; track separately if a plan upgrade happens.
- This spec does NOT re-litigate SPEC-013 fixes (already shipped) or SPEC-014 perf work (in flight).

## Design

### Prerequisites (complete)

The `search-console-mcp` plugin is wired and verified. Working config (registered via `claude mcp add-json -s user`, lives in `C:\Users\coffe\.claude.json`):

```json
"search-console": {
  "type": "stdio",
  "command": "D:/nvm4w/nodejs/npx.cmd",
  "args": ["-y", "search-console-mcp"]
}
```

`claude mcp list` reports `search-console: ✓ Connected`. The startup banner had reported `[ ✔ Google | ✘ GA4 | ✔ Bing ]` at spec-write time, but at audit time all three engines authenticated: Google site `sc-domain:coffey.codes`, Bing site `https://coffey.codes/`, GA4 propertyId `416080229` (the second `--engine=ga4` setup must have stuck without further intervention). All must-have data sources were available for the audit.

Bing turned out to return empty data through `bing_analytics_query` and `bing_opportunity_finder` despite the property being verified, so the Bing comparison section in the audit doc captures this as signal rather than a true comparison. `pagespeed_analyze` was rate-limited at audit time and is deferred to SPEC-014's perf workstream.

Three Windows landmines that aren't obvious — leave them documented here so this isn't re-discovered:

1. `Claude-3p\claude_desktop_config.json` is the desktop app's data dir. Claude Code (the CLI) reads `~/.claude.json`, not that file.
2. Bare `npx` fails in a shell-less spawn on Windows. There's no `npx` binary, only `npx.cmd`.
3. `cmd /c npx ...` spawns fine but `cmd.exe` buffers stdout, breaking JSON-RPC over stdio. Calling `npx.cmd` directly with its full path (forward slashes) is the form that works.

### Audit doc — `docs/strategy/seo-audit-2026-Q2.md`

Frozen snapshot. Dated. Not updated after publication. Sections:

1. **Scope, data sources, and date range** — which MCP tools were called, over what window, with which property URL.
2. **Top-level GSC summary** — total clicks, impressions, average position, CTR; trend over the window.
3. **Top performing pages** — clicks, impressions, position, top query per page.
4. **Top performing queries** — clicks, impressions, position, top page per query.
5. **Striking distance** (`seo_striking_distance`) — keywords ranking 11–20. Highest-leverage list for editorial work.
6. **Low hanging fruit** (`seo_low_hanging_fruit`) — pages with high impressions but CTR below the position-curve average. Title and meta-description rewrite targets.
7. **Cannibalization** (`seo_cannibalization`) — queries where multiple URLs compete. Consolidation candidates.
8. **Lost queries** (`seo_lost_queries`) — keywords that lost rankings or visibility quarter-over-quarter. Refresh candidates.
9. **Bing comparison** (`compare_engines`, `bing_analytics_query`) — same-query performance gap between Google and Bing.
10. **Per-pillar breakdown** — same metrics rolled up by article category (Web Development, Mobile Development, Cloud & DevOps, Software Engineering, Tools & Productivity).
11. **Country and device breakdown** — geographic and device-type distribution.
12. **On-page health spot checks** (`inspection_inspect`, `pagespeed_analyze`, `schema_validate`) — top 5 pages by clicks; surfaces any structured-data, indexability, or performance regressions.
13. **Findings + prioritized recommendations** — quick wins (citing specific numbers), medium efforts, strategic plays (deferred to the strategy spec).
14. **Outstanding from SPEC-013 nice-to-haves** — restated with current data to confirm they're still worth doing (`dateModified`, per-page OG, `sameAs` on Organization).

## Edge cases

- [ ] If `claude mcp list` reports `search-console: Failed to connect` after a session restart, the most likely cause is the npx path no longer resolving (Node version may have changed under nvm-for-windows). Verify `D:/nvm4w/nodejs/npx.cmd` still exists; update the `command` field in `~/.claude.json` if the path drifted.
- [ ] If GSC reports zero data for a pillar, that's data not error — capture it in the "lost / never gained" findings.
- [ ] If GA4 auth still won't stick after a second `setup --engine=ga4` attempt, fall back to Google + Bing only. The audit's must-have requirements are satisfiable without GA4.
- [ ] If Bing returns dramatically different traffic patterns than Google, treat both as signal — do not normalize to Google's distribution.
- [ ] If `pagespeed_analyze` reports a regression on an article since SPEC-013 / SPEC-014, flag it but do NOT fix in this spec — file a follow-up.

## Acceptance criteria

1. After Claude Code restart, `mcp__search-console__sites_list` returns `https://coffey.codes/` (or the verified property URL) without error.
2. `docs/strategy/seo-audit-2026-Q2.md` exists, contains real numbers from at least 90 days of GSC data plus a Bing comparison section, and every file path it references resolves.
3. The audit doc names at least 3 specific quick-win items, each grounded in an actual number from an MCP tool call (no "consider", no "should look at" without data).
4. The doc covers all 14 sections listed in the Design > Audit doc subsection.
5. `docs/README.md` lists `strategy/` in its folder map.
6. No tool call to the Ahrefs MCP (`mcp__67181dc5-*`) appears in the audit's data-collection chain.

## Constraints

- Docs-only; no code changes in this spec.
- Audit window must be at least 90 days. Longer (180–365) preferred if the data is available.
- No content rewrites in this spec.
- The audit doc must respect the user's voice rules (no em-dashes, no marketing-flourish tricolons, no closing-flourish summaries).

## Tasks

- [x] Wire `search-console-mcp` into Claude Code (`~/.claude.json`, user scope, full `npx.cmd` path)
- [x] Mirror config into `Claude-3p\claude_desktop_config.json` for the desktop app
- [x] Verify Google + Bing auth via banner; verify connection via `claude mcp list`
- [x] Confirm GA4 authentication (was reported `✘` at spec-write but `analytics_realtime` against propertyId `416080229` returned live data at audit time, so no re-run of `setup --engine=ga4` was needed)
- [x] Restart Claude Code to expose `mcp__search-console__*` tools to a session
- [x] Call `sites_list` to confirm the verified property URL (`sc-domain:coffey.codes`)
- [x] Run all data pulls listed in must-have requirement #4 (Bing's `bing_analytics_query` and `compare_engines` returned empty / `InvalidUrl`; documented as signal in audit section 9. `pagespeed_analyze` rate-limited at audit time; deferred to SPEC-014's perf workstream)
- [x] Write `docs/strategy/seo-audit-2026-Q2.md` covering all 14 sections
- [x] Update `docs/README.md` to list `strategy/`
- [ ] (Nice-to-have) Add `scripts/seo-snapshot.mjs` for quarterly re-runs (deferred per scope decision)

## Notes

- **Plan source**: `C:\Users\coffe\.claude\plans\lets-conduct-an-audit-glittery-parnas.md` — original approved plan from the planning conversation; predates the wiring work.
- **Follow-up spec**: the **content strategy** doc (`docs/strategy/content-strategy.md`) is explicitly out of scope here. It will be its own spec, created after this audit ships, and will reference the audit's numbers when prioritizing pillars and editorial calendar.
- **Related specs**:
  - SPEC-013 (GSC issue remediation) — complete, archived. Schema, redirect, and noindex fixes this audit benefits from were shipped there.
  - SPEC-014 (article perf + a11y) — in flight. The audit will note `pagespeed_analyze` scores but not propose perf work that's already scoped under SPEC-014.
- **Data privacy**: GSC, Bing, and GA4 data is the user's own. CSV/JSON snapshots saved under `docs/strategy/data/` (if the snapshot script lands) are first-party and safe to commit. Do not commit any service-account JSON or auth tokens.
- **MCP package**: `search-console-mcp@1.13.5` (npm). Auth tokens stored in Windows Credential Manager, hardware-bound (cannot be transferred between machines).
