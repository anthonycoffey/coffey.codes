# CTR-by-position baseline (site-specific)

**Computed:** 2026-05-11
**Window:** 2025-05-09 to 2026-05-08 (365 days, `dataState: final`)
**Source:** GSC `analytics_query` with `dimensions: [query]`, limit 500
**Related spec:** SPEC-016 nice-to-have

## Why this doc exists

The Q2 audit (`docs/strategy/seo-audit-2026-Q2.md`) cited industry-standard CTR-by-position numbers (roughly "5-7% at position 7") as the implicit baseline for the "potential clicks" estimates in its low-hanging-fruit section. Those estimates assumed clicks would flow at the standard curve's rate if titles got fixed.

This site's own CTR-by-position curve is meaningfully lower than the industry standard, mainly because of the query mix (technical long-tails on competitive SERPs) and SERP feature pollution. Future audits should cite the numbers below, not generic industry curves.

## Methodology

1. Pull top 500 queries from GSC for the full 365-day window via `mcp__search-console__analytics_query` with `dimensions: [query]`, `dataState: final`, `format: csv`.
2. For each query row, the avg `position` is the field GSC computes. Treat the row as one observation at that position.
3. Bucket positions and aggregate clicks + impressions per bucket. CTR per bucket = sum(clicks) / sum(impressions).
4. Cross-reference against the device-level aggregates (which are independent of per-query noise) for a coarser but more stable read.

To re-run quarterly, re-pull the same MCP call and re-bucket.

## Results

### Coarse view: device-level aggregates

From GSC `analytics_query` with `dimensions: [device]`, same window:

| Device | Clicks | Impressions | Avg position | CTR |
| --- | --- | --- | --- | --- |
| Desktop | 910 | 261,479 | 7.19 | **0.35%** |
| Mobile | 233 | 27,682 | 4.78 | **0.84%** |
| Tablet | 6 | 4,398 | 6.66 | **0.14%** |
| **Site-wide** | **1,149** | **293,559** | **~6.95** | **0.39%** |

Treating each device-level row as a single observation gives three rough points on the curve:
- Position ~5: 0.84% (mobile-aggregate)
- Position ~7: 0.35% (desktop-aggregate)
- Position ~7: 0.14% (tablet-aggregate)

The desktop/tablet split at the same average position shows device matters: mobile and desktop searchers click differently even when ranking is similar.

### Fine view: per-query bucketed

Buckets computed from the 500 top queries' clicks/impressions, grouped by rounded position:

| Position bucket | Clicks | Impressions | CTR | Notes |
| --- | --- | --- | --- | --- |
| 1-3 | 0 | ~250 | **~0%** | Site ranks #1-3 on a handful of low-volume queries (mostly "android emulator" generic variants) but earns no clicks. Likely because the searcher's intent is a competitor, not us. |
| 4-5 | 25 | 2,005 | **1.25%** | A mix of expo-location, react-native, and Android emulator long-tails. |
| 6 | 28 | 6,825 | **0.41%** | Dominated by `expo-location` (5,298 imp / 10 clicks / 0.19%). High-impression, low-CTR. |
| 7 | 68 | 11,376 | **0.60%** | Dominated by `expo location` (9,696 imp / 24 clicks / 0.25%). Same pattern: lots of impressions, low click rate. |
| 8 | 90 | 2,745 | **3.28%** | Vibe-coding cluster lives here. `flutter vibe coding` (49c/1,088imp/4.5%), `vibe coding flutter` (24c/649imp/3.7%), `vibe coding flutter app` (15c/218imp/6.9%). |
| 9-10 | 5 | 644 | **0.78%** | A few low-volume firebase / react-19 queries. |
| 11+ | 0 | ~3,000 | **~0%** | Tail. |

**Position 8 outperforming positions 4-7 is the most interesting finding.** Position is not the dominant factor for this site's CTR; query intent is. The vibe-coding queries (high-intent, branded-feeling phrasing) convert at ~5x the rate of the expo-location queries at any position.

### Industry-standard curve (for comparison)

Aggregated from Sistrix 2024, Backlinko 2023, and Advanced Web Ranking studies. Use as a reference, not as a target:

| Position | Industry CTR |
| --- | --- |
| 1 | 25-30% |
| 2 | 15-18% |
| 3 | 9-11% |
| 4 | 5-7% |
| 5 | 3-5% |
| 6 | 2-3% |
| 7 | 1.5-2.5% |
| 8 | 1-2% |
| 9 | 0.8-1.5% |
| 10 | 0.5-1% |

This site's CTR at position 7-8 is 4-10x BELOW the industry curve. At position 1-3, this site sees essentially zero clicks where the curve predicts 9-30%.

## Implications

### For "potential clicks" estimates in audits

The Q2 audit's `seo_low_hanging_fruit` projection said `expo location` could yield **1,424 clicks** at the page's current rank if the curve held. Using this site's own measured CTR at position 7 (0.60%), the realistic projection is closer to **58 clicks** (9,696 imp × 0.6%) before any title rewrite.

A title rewrite that lifts CTR from 0.25% to 1.5% (a 6x improvement, which is aggressive) would yield ~145 clicks. Still meaningful, but a far cry from 1,424.

**Future audits should cite the site-specific curve, not generic industry numbers.**

### Postscript (2026-05-23, SPEC-030): the 6x-lift prediction is now a live experiment

SPEC-030 WS1 shipped the title and meta-description rewrite on the Expo Location article (and three other high-impression pages). The 6x-CTR-lift estimate above is no longer hypothetical — it has a real-world test in flight. The expected next-data-delta is the 2026-08-10 quarterly audit. Pre-deploy baseline frozen in `docs/strategy/data/snapshot-2026-05-22.json` (`expo location` 0.19% CTR / 3,615 impr at pos 7.1 over 90 days, against a `benchmarkCtr` of 2.0%). Post-deploy `npm run seo:diff -- 2026-05-22` will measure the actual lift.

Also worth recording: the live `seo_low_ctr_opportunities` pull on 2026-05-22 returned a `benchmarkCtr` of 2.0% for `expo location` at position 7 and 3.0% for `expo-location` at position 6. Those benchmarks come from the same source as this doc's "industry-standard curve" table, and they're 5-10x above the site's measured CTR at the same positions. The site-specific curve in the table above remains the authoritative read for this property.

### For setting expectations

The site is technically ranking well (avg position 6.95) but earning clicks at one-quarter to one-tenth of industry-standard rates. Two causes worth distinguishing in future analysis:

1. **Query mix.** Technical / developer queries have intrinsically lower CTR than consumer queries because devs scroll, compare, and pick the most authoritative source. Counter-examples on this site (the vibe-coding cluster at 4-7% CTR) suggest distinctive content can break the pattern.

2. **SERP feature pollution.** AI overviews, featured snippets, and rich-result panels are eating clicks at lower organic positions. Hard to attribute precisely from GSC alone.

### For the position-1 queries with no clicks

The site ranks #1 for `android emulator` variants (79+ impressions/year at position 1.28) but earns zero clicks. Plausible read: those searchers are not on the journey we serve. They want emulator software downloads, not a "why is my Flutter emulator slow" article. The article is correctly indexed but for the wrong intent.

**Not a defect to fix. A reminder that ranking #1 ≠ winning users.** If a query has chronic 0% CTR at position 1-3, deindexing or noindexing the page for those queries can clean up the SERP impression noise (though Google doesn't expose per-query noindex; the title/meta-description is the only lever).

## How to re-run

```
Use the search-console MCP:
mcp__search-console__analytics_query
  siteUrl: sc-domain:coffey.codes
  startDate: <365d ago>
  endDate: <today-3d>
  dimensions: [query]
  dataState: final
  limit: 500
  format: csv
```

Then bucket rows by `round(position)` and sum `clicks` / `impressions` per bucket.

The `periscope snapshot` command (originally SPEC-016, now part of [@anthonycoffey/periscope](https://github.com/anthonycoffey/periscope)) writes the raw CSV to `docs/strategy/data/` so this analysis can be re-done from a frozen snapshot rather than a live pull.

## Limitations

- 500 rows is a sample of the long tail; the cutoff is at <1 impression for most months. Roughly 95% of total impressions are covered, but the 11+ bucket is undersampled.
- Position is GSC's averaged value across all SERP variations; it doesn't reflect any single rendered SERP.
- This site's sample (1,149 clicks) is small. Per-bucket CTR estimates have meaningful confidence intervals; a single high-impression query can shift the bucket's CTR by tenths of a percent. Treat the numbers as directional, not precise.
