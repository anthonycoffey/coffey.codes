---
id: SPEC-026
title: 'Periscope week-over-week query movement reports'
status: draft
created: 2026-05-17
author: Anthony Coffey
reviewers: []
affected_repos: [periscope, coffey.codes]
---

## Reviewer Notes

<!-- Leave empty until code review. -->

---

# Feature: Weekly movement leaderboard — what's gaining, what's slipping

## Problem

The existing `periscope diff` command compares two snapshots and surfaces deltas across engines. It's general-purpose and verbose. For a recurring client deliverable, we need a **narrower, sharper** report: a leaderboard of queries (and their owning articles) that moved meaningfully week-over-week — gains, losses, new entries, dropouts — with one-line interpretations.

This is what a client looks at on Monday morning. "What went up, what went down, what should I do this week?"

Depends on [SPEC-024](SPEC-024-periscope-gsc-first-audit-ads-quota.md) for `gsc.pageQueries`.

## Requirements

### Must have

1. WHEN `periscope movement` runs with default args, it SHALL compare the latest snapshot to the snapshot ~7 days prior (nearest match), grouping changes into: `gains`, `losses`, `new entries`, `dropouts`.
2. Movement thresholds SHALL be configurable per category (default: gain/loss = position delta ≥ 3 AND impressions delta ≥ 50; new/dropout = appears or disappears with ≥ 25 impressions in either snapshot).
3. Each section SHALL be a ranked table: query, owning article, position then→now, impressions then→now, clicks then→now, computed verdict.
4. Output SHALL be `<outputDir>/movement-<newer-date>-vs-<older-date>.md`.
5. `--window` flag SHALL accept day counts (7, 14, 28, 90) and natural-language refs ("last week", "last month") matching the existing `diff` command's resolver.

### Nice to have

- Article-level rollup: aggregate query movement per article, surface "biggest mover" articles.
- Per-cluster movement (when SPEC-025 is shipped, group queries by cluster ID).
- Top 3 gains/losses summarized in the report's intro paragraph for tl;dr scanning.

### Non-goals

- Not a replacement for `diff`. `diff` stays general; `movement` is a specialized client-facing view.
- No alerting / cron / push notifications.

## Design

Reuse:
- Snapshot ref resolver from [src/commands/diff.ts](D:/repos/periscope/src/commands/diff.ts) — already handles "last week", "7d", explicit dates, .json paths.
- `loadLatestSnapshot` / snapshot store from [src/lib/snapshot-store.ts](D:/repos/periscope/src/lib/snapshot-store.ts).
- The pageQueries row shape from SPEC-024.

New:
- `src/commands/movement.ts` — entry point.
- `src/lib/movement.ts` — diff algorithm: join pageQueries from older and newer on (page, query), compute deltas, bucket into categories.
- `src/cli.ts` — register `movement` subcommand.

Critical files:
- `src/commands/movement.ts` (new)
- `src/lib/movement.ts` (new)
- `src/cli.ts` (modify)

## Acceptance criteria

1. `periscope movement` on two consecutive weekly snapshots produces a report with all four sections populated (or an explicit "no qualifying movement").
2. Unit tests on synthetic snapshot pairs verify: position-delta threshold, impressions-delta threshold, new/dropout logic, ranking order.
3. Article-level rollup (nice-to-have) is gated behind a `--rollup-articles` flag if it doesn't land in v1.
4. Zero Ads API calls.

## Constraints

- Must work when fewer than two snapshots exist (clear "need at least 2 snapshots" message).
- Must handle snapshots taken at irregular intervals (don't error if "last week" maps to 9 days ago).

## Tasks

- [ ] Implement movement diff algorithm in `lib/movement.ts`.
- [ ] Implement `movement` command + CLI registration.
- [ ] Markdown renderer.
- [ ] Tests on synthetic snapshot pairs.
- [ ] Document in periscope README under "Recurring client deliverables."

## Notes

The killer feature for client retention is the Monday morning email. This command is the data behind that email. v1 produces markdown; the HTML variant (SPEC-027) turns it into a client-friendly visual.
