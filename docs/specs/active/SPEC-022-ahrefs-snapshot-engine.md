---
id: SPEC-022
title: 'Ahrefs as a fifth snapshot engine (link graph + organic position data)'
status: draft
created: 2026-05-14
author: Anthony Coffey
reviewers: []
affected_repos: [coffey.codes]
---

## Reviewer Notes

<!-- Leave empty until code review. When requesting changes, reviewer adds feedback here: -->

---

# Feature: Ahrefs engine in `seo-snapshot.mjs`

## Problem

The current snapshot covers four engines: GSC, GA4, Bing Webmaster, Google Ads Keyword Planner. Together they answer "what is Google/Bing showing us for, and what could we rank for." What they do not answer:

1. **Link graph.** Who links to us, how that count is trending, what anchors they use.
2. **Off-property organic position.** GSC shows position only for queries that drove clicks/impressions in the window. Ahrefs tracks position for any keyword its crawler has us indexed for, including ones that never converted.
3. **Competitor link and keyword overlap.** Who else ranks for our keywords, and where their backlink profile is concentrated.
4. **Historical domain rating.** A single number that summarizes the link graph's authority over time.

Ahrefs has all of this. The Ahrefs MCP is available, but it requires the $129/mo plan and adds a per-call latency tax. The native Ahrefs API gives us the same data, faster, and slots cleanly into the existing snapshot pattern as a fifth engine.

## Requirements

### Must have

1. WHEN `scripts/seo-snapshot.mjs` runs with the `ahrefs` engine enabled, it SHALL pull a defined set of fields from Ahrefs and write them to the snapshot JSON under a top-level `ahrefs` key.
2. WHEN the `AHREFS_API_KEY` env var is missing, the engine SHALL skip with a one-line stderr warning, matching the existing engine-skip pattern (no half-broken state).
3. The Ahrefs engine SHALL be included in the default engine set when its env var is present, and SHALL be selectable via `--engines=ahrefs` for targeted runs.
4. The snapshot's Markdown companion (`scripts/lib/snapshot-markdown.mjs`) SHALL render an "Ahrefs" section containing headline numbers: domain rating, total referring domains, new/lost refdomains in the window, top 10 organic keywords by traffic, top 10 backlinks by URL rating of source page.
5. WHEN `scripts/seo-snapshot-diff.mjs` compares two snapshots that both contain Ahrefs data, it SHALL surface: domain rating delta, refdomain delta (new/lost since older snapshot), and any keyword whose position changed by more than 5 ranks.
6. All Ahrefs API calls SHALL go through a shared client in `scripts/lib/ahrefs.mjs` that handles auth, rate limiting, and response normalization, mirroring the structure of `scripts/lib/google-ads.mjs`.
7. The Ahrefs engine SHALL respect the existing `--window=<days>` flag for time-bounded queries (refdomains gained/lost, keyword position history).

### Nice to have

- A `--ahrefs-competitors=domain1.com,domain2.com` flag that pulls comparable headline numbers for named competitors into a `ahrefs.competitors[]` array. Useful for periodic competitor snapshots without standing up a separate script.
- Anchor text distribution (top 20 anchors with link counts) in the snapshot. Useful for spotting over-optimized profiles before Google's algo does.
- Lost backlinks list (URLs that linked to us in the prior snapshot but no longer do). Surfaces outreach opportunities.

### Non-goals (what this does NOT do)

- This spec does NOT replace any existing engine. GSC, GA4, Bing, and Keywords all stay.
- This spec does NOT add a "fetch full backlink dump" feature. Backlinks are expensive in API credits; we pull top-N by quality metric, not the full graph.
- This spec does NOT auto-disavow, auto-outreach, or write any data back to Ahrefs. Read-only.
- This spec does NOT add a new keyword research script. The Ahrefs data feeds existing tools (article auditor, topic discovery) by enriching the snapshot they already read.
- This spec does NOT migrate keyword volume away from Google Ads. Ads stays the volume source; Ahrefs is link graph + position data.

## Design

### Shared library

`scripts/lib/ahrefs.mjs` exports:

```js
export async function getAhrefsClient()                // returns a configured client from AHREFS_API_KEY
export async function getDomainRating(target)          // current DR + history
export async function getRefdomainsOverview(target, window)
export async function getOrganicKeywords(target, limit)
export async function getTopPages(target, limit)
export async function getBacklinksStats(target)
export async function getTopBacklinks(target, limit)   // sorted by source URL rating
export async function getAnchors(target, limit)        // for nice-to-have #2
export async function getLostBacklinks(target, window) // for nice-to-have #3
```

Same patterns as `scripts/lib/google-ads.mjs`: thin wrapper over the HTTP API, retry with exponential backoff on 429s, raise on any other non-2xx, normalize the response shape.

### Snapshot integration

`scripts/seo-snapshot.mjs` gains a `pullAhrefs(target, window)` function next to the existing `pullGsc`, `pullGa4`, `pullBing`, `pullKeywords`. The dispatch table in `main()` adds `ahrefs` as a known engine. Order in the JSON output is alphabetical (`ahrefs` first), so existing consumers reading `gsc`/`ga4`/`bing`/`keywords` are unaffected.

Snapshot shape adds:

```json
{
  "ahrefs": {
    "target": "coffey.codes",
    "fetchedAt": "2026-05-14T...",
    "domainRating": { "current": 12, "history": [...] },
    "refdomains": { "total": 87, "newInWindow": 4, "lostInWindow": 2 },
    "organicKeywords": [{ "keyword": "...", "position": 3, "traffic": 120, "url": "/articles/..." }],
    "topPages": [{ "url": "/articles/...", "organicTraffic": 340, "topKeyword": "..." }],
    "backlinksStats": { "total": 412, "doFollow": 280, "fromUniqueDomains": 87 },
    "topBacklinks": [{ "sourceUrl": "...", "targetUrl": "...", "sourceUrlRating": 42, "anchor": "..." }],
    "_meta": { "creditsUsed": 14, "window": 365 }
  }
}
```

### Markdown renderer

`scripts/lib/snapshot-markdown.mjs` gains an `ahrefsSection(data)` function. Output:

```markdown
## Ahrefs

- **Domain Rating:** 12 (delta vs prior snapshot rendered by diff script)
- **Referring domains:** 87 total. 4 new in 365d, 2 lost.
- **Backlinks:** 412 total, 280 dofollow, from 87 unique domains.

### Top organic keywords
| Keyword | Position | Traffic | URL |
| --- | --- | --- | --- |
| ... | ... | ... | ... |

### Top backlinks (by source URL rating)
| Source | Target | UR | Anchor |
| --- | --- | --- | --- |
| ... | ... | ... | ... |
```

### Diff integration

`scripts/seo-snapshot-diff.mjs` gains an `ahrefsDiff(older, newer)` block alongside the existing per-engine diff blocks. Surfaces:

- DR delta with arrow
- Refdomain net change, plus the actual new and lost domain lists
- Keywords whose position moved >5 ranks in either direction
- Lost backlinks (if both snapshots have `topBacklinks`)

### Auth and config

Single env var: `AHREFS_API_KEY`. Lives next to the other engine env vars in `.env` / `.env.local`. Documented in [seo-snapshot-setup.md](../../documentation/guides/seo-snapshot-setup.md) in the engines table and in a new "5. Ahrefs" subsection under "One-time setup."

Free tier of the Ahrefs API does not exist; the basic paid plan ($129/mo as of 2026-05) is the entry point. Document this in the setup guide alongside the existing Google Ads "must enable billing" warning.

### Target domain

Pulls data for the property the snapshot is targeting (currently `coffey.codes`, the only configured target). For the nice-to-have competitor flag, additional domains are passed via CLI and queried in parallel with a single shared rate-limit budget.

## Edge cases

- [ ] **Ahrefs returns a 429 (rate limit hit).** Client backs off with exponential delay up to 3 retries, then raises. The engine's failure is isolated; other engines complete normally.
- [ ] **Target domain has zero backlinks** (brand new property, or one Ahrefs hasn't crawled yet). All fields populate with empty arrays / zero values, not nulls. The diff script handles zero-to-zero as "no change" gracefully.
- [ ] **Ahrefs plan is downgraded mid-cycle.** API returns an "insufficient plan" 403; engine logs the exact error and skips, matching the existing skip pattern.
- [ ] **Snapshot has Ahrefs data but the prior snapshot does not.** Diff script reports "Ahrefs baseline established" rather than crashing on a missing comparison.
- [ ] **Credit usage spikes.** The `_meta.creditsUsed` field lets us track per-snapshot cost. If a run consumes >100 credits, log a warning so we notice before the monthly cap.
- [ ] **API version sunsets.** Ahrefs has historically been more stable than Google's APIs here, but if v3 sunsets, the version constant in `scripts/lib/ahrefs.mjs` is the only thing to change. Document this in the troubleshooting table.

## Acceptance criteria

1. A run of `node scripts/seo-snapshot.mjs --engines=ahrefs` against a real Ahrefs account produces a snapshot JSON with the documented `ahrefs` block populated and the Markdown companion's "Ahrefs" section rendered.
2. A full run (`node scripts/seo-snapshot.mjs` with all engines enabled) includes Ahrefs alongside the other four engines without affecting their output structure.
3. `node scripts/seo-snapshot-diff.mjs <older> <newer>` between two snapshots containing Ahrefs data prints the new Ahrefs diff block.
4. With `AHREFS_API_KEY` unset, the engine skips with the expected one-line stderr warning and the rest of the snapshot completes.
5. [seo-snapshot-setup.md](../../documentation/guides/seo-snapshot-setup.md) is updated with: env var documentation, the one-time setup subsection, an entry in the troubleshooting table, and a note in the "engines and auth model" table.
6. [seo-tooling-inventory.md](../../documentation/guides/seo-tooling-inventory.md) is updated to list Ahrefs as a fifth engine and to remove the "intentionally not here" bullet about Ahrefs.
7. `npm run lint` passes after the new files land.
8. Total credit cost per snapshot is documented in the spec's Notes section after the first live run.

## Constraints

- Zero new heavyweight npm deps. Ahrefs API is HTTP/JSON, callable with the native `fetch`. If a thin SDK exists and saves meaningful code, evaluate it during implementation but default to direct `fetch`.
- Output files stay committed to git (snapshot files are first-party aggregate data). Ahrefs section adds an estimated 5-15 KB per snapshot.
- Voice rules apply to all rendered output (Markdown companion + diff output): no em-dashes, no marketing tricolons, no closing flourishes.
- Per-snapshot credit cost must stay under 25 credits in steady state. The basic plan has a fixed monthly cap; one snapshot a month plus the occasional ad-hoc run must fit.
- API key must never be logged. Sanity-check the client logging on first implementation.

## Tasks

- [ ] Implement `scripts/lib/ahrefs.mjs` with the documented exports.
- [ ] Implement `pullAhrefs` in `scripts/seo-snapshot.mjs` and wire it into the engine dispatch table.
- [ ] Update `scripts/lib/snapshot-markdown.mjs` with the `ahrefsSection` renderer.
- [ ] Update `scripts/seo-snapshot-diff.mjs` with the `ahrefsDiff` renderer.
- [ ] Update `docs/documentation/guides/seo-snapshot-setup.md` (engines table, one-time setup, troubleshooting, env vars).
- [ ] Update `docs/documentation/guides/seo-tooling-inventory.md` (add Ahrefs to engines, remove the "not here yet" bullet).
- [ ] Update `docs/documentation/agents/coffey-codes.md` if it lists engines explicitly.
- [ ] First end-to-end run against the live Ahrefs account; commit the first snapshot containing Ahrefs data.
- [ ] Document actual credit cost per snapshot in this spec's Notes.

## Notes

- **Why a fifth engine, not a parallel script.** The whole point of the snapshot is one dated file per pull. Splitting Ahrefs into its own script would create two parallel histories that need to be cross-referenced. One file is the right shape; the snapshot pattern already handles "some engines skipped" cleanly.
- **Why not Ahrefs MCP.** The MCP is convenient for interactive use but slow under script load and rate-limited per-call. The native API has higher throughput, no per-call MCP overhead, and matches the existing direct-API pattern used by GSC, GA4, Bing, and Ads.
- **Why not Semrush / Moz / Majestic.** Ahrefs has the best Texas-region coverage for the kinds of niche keywords this site targets, and we already have an account. The spec's engine pattern is generic; a future SPEC could add a sixth engine if we ever want competitor coverage from a different data source.
- **Related specs:**
  - SPEC-018 (multi-engine snapshot foundation) — the pattern this extends
  - SPEC-019 (Google Ads as fourth engine) — the most recent example of adding an engine
  - SPEC-020 (keyword research tools) — downstream consumers that automatically benefit from richer snapshot data

## Open questions

1. Which Ahrefs API version (v2 vs v3) to target. v3 is REST-shaped and current; v2 is legacy SOAP-style. Default to v3 unless something forces otherwise.
2. Should `organicKeywords` include the SERP feature flags (featured snippet, PAA, etc.) that Ahrefs returns? Useful for content prioritization, but bulks up the snapshot. Lean toward yes, gated behind a `--verbose` flag if size becomes an issue.
3. Should `topBacklinks` be capped at top 25 or top 100? Smaller is cheaper in credits and keeps the snapshot lean; larger gives more outreach signal. Lean toward 25 as the default with the credit budget as the deciding factor after the first run.
4. Where does Ahrefs data flow into the existing keyword research scripts (audit, discovery, validation)? Out of scope for this spec, but worth a follow-up SPEC once the data is flowing.
