---
id: SPEC-025
title: 'Periscope topic-gap clustering from GSC queries'
status: draft
created: 2026-05-17
author: Anthony Coffey
reviewers: []
affected_repos: [periscope, coffey.codes]
---

## Reviewer Notes

<!-- Leave empty until code review. -->

---

# Feature: Topic-gap clustering — "what should I write next" from real impressions

## Problem

The existing `periscope discover topics` command answers the "what should I write" question by seeding Google Ads `KeywordPlanIdeaService` with category names + top GSC queries. The ideas it returns are speculative — they tell us what Google Ads' model *thinks* relates to the seeds. They don't tell us where the property is already getting real impressions for queries no article actually targets.

This SPEC adds a complementary command that answers a different question: **"Looking at the queries this property is already getting impressions for, which semantic clusters have high aggregate impressions but no dedicated article?"** That's where new content has the highest probability of capturing existing search demand instead of speculating about it.

Depends on [SPEC-024](SPEC-024-periscope-gsc-first-audit-ads-quota.md) for `gsc.pageQueries` rows in the snapshot.

## Requirements

### Must have

1. WHEN `periscope discover gaps` runs against a snapshot containing `gsc.pageQueries`, it SHALL cluster all queries by token overlap (Jaccard ≥ configurable threshold, default 0.4) into named clusters.
2. WHEN clusters are computed, the command SHALL rank them by aggregate impressions descending and identify each cluster's "best-matching existing article" (highest GSC click count for any query in that cluster).
3. WHEN a cluster's aggregate impressions exceed a configured threshold (default 1000/quarter) AND no existing article token-overlaps with the cluster's centroid above a threshold (default 0.5), the cluster SHALL be flagged as a `GAP`.
4. Output SHALL be `<outputDir>/topic-gaps-<asof>.md` with: cluster name (canonical query — highest-impressions member), member queries with metrics, aggregate impressions/clicks, best-matching article (or "none — GAP"), and a one-line write recommendation.

### Nice to have

- Centroid naming via an LLM call (claude-haiku) when a user opts in via `--llm-cluster-names`. Default is heuristic (longest common token sequence).
- Cluster-level position trend over time (requires multiple snapshots).

### Non-goals

- Not a writing tool. Output is editorial backlog, not draft text.
- Not a competitive intelligence tool. This is intra-property only.

## Design

Two-stage clustering, no external deps:

1. **Tokenize + normalize** each query: lowercase, strip stopwords, stem (Porter), drop tokens length ≤ 2.
2. **Hierarchical agglomerative clustering** with Jaccard distance. Cluster threshold tuned to produce ~10–50 clusters from typical query volumes (500–5000 queries). Pure JS, fits in `src/lib/cluster.ts`.

Critical files:
- `src/commands/discover-gaps.ts` (new) — entry point.
- `src/lib/cluster.ts` (new) — tokenizer, Jaccard, agglomerative clusterer.
- `src/lib/article-matching.ts` (new) — reuse the token-overlap logic from SPEC-024's audit (extract from `audit-articles.ts` if duplication appears).
- `src/cli.ts` — register `discover gaps` subcommand.

## Acceptance criteria

1. `periscope discover gaps` on coffey.codes' snapshot produces a markdown report with ≥3 clusters and at least one `GAP` flag.
2. Clustering is deterministic given the same input (no random init).
3. Unit tests cover: tokenizer, Jaccard distance, the agglomerative clusterer on a synthetic query set with known clusters.
4. Zero Ads API calls — this command is GSC-only.

## Constraints

- Industry-agnostic (no domain-specific stopword lists beyond standard English).
- No external clustering library.

## Tasks

- [ ] Implement `cluster.ts` with tokenizer + agglomerative clustering.
- [ ] Implement `discover-gaps.ts` command.
- [ ] Markdown renderer.
- [ ] Tests (deterministic clustering, known-cluster fixtures).
- [ ] Register in CLI.
- [ ] coffey.codes consumer bump + smoke-test report committed under `docs/strategy/data/`.

## Notes

This is the GSC-native answer to the "what's next" question that `discover topics` currently answers with Ads ideas. Both commands continue to exist; they're complementary, not redundant. `discover topics` discovers new demand outside the property's current footprint; `discover gaps` finds unclaimed demand *within* the property's existing impressions.

LLM-named centroids are a nice-to-have because heuristic naming ("longest common token sequence") often produces awkward labels like `react native expo`. An LLM can name the cluster *"React Native Expo SDK upgrade workflows"* in one cheap haiku call per cluster.
