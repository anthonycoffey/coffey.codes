---
id: SPEC-029
title: 'Periscope multi-property config (--property flag, properties[] map)'
status: draft
created: 2026-05-17
author: Anthony Coffey
reviewers: []
affected_repos: [periscope, coffey.codes]
---

## Reviewer Notes

<!-- Leave empty until code review. -->

---

# Feature: Multi-property config for periscope

## Problem

Periscope today supports exactly one property per config file. The schema in [src/lib/config.ts](https://github.com/anthonycoffey/periscope/blob/main/src/lib/config.ts) hardcodes `siteUrl`, `ga4PropertyId`, `outputDir`, `articles.dir`, `landingPages.dir`, `ads.*`, and `categories[]` as top-level keys. Every consuming repo that wants to monitor more than one property has to either fork the package or maintain N config files + invoke the CLI N times.

This was carved out of [SPEC-024](./SPEC-024-periscope-gsc-first-audit-ads-quota.md) (must-have #9) because the author has no second property to exercise from this machine — landing multi-property without a real second property risked shipping untested code on the critical path of every Ads command. SPEC-024 closed all the OTHER must-haves; this spec is the dedicated follow-up.

## Requirements

### Must have

1. WHEN `periscope.config.{ts,mjs}` contains a `properties: Record<string, PropertyConfig>` map plus a `defaultProperty: string`, the CLI SHALL accept `--property <name>` on every command to select which property to run against. Without `--property`, the default is used.
2. WHEN `periscope.config.{ts,mjs}` uses the existing flat shape (no `properties` map), every command SHALL continue to work unchanged — the flat shape becomes the "single default property". No breaking changes for existing consumers.
3. `PropertyConfig` per property SHALL include: `siteUrl`, `gscSiteUrl` (often same), `ga4PropertyId`, `ads.customerId`, `ads.loginCustomerId`, `ads.developerTokenEnv` (default `GOOGLE_ADS_DEVELOPER_TOKEN`), `outputDir`, `articles.dir`, `landingPages.dir`, `categories[]`.
4. WHEN `--property foo` is passed but `foo` is not defined in the config, the CLI SHALL exit with code 2 and list the available property names.
5. `periscope doctor` and `periscope --explain` (SPEC-024) SHALL print the selected property name as the first line of their output.
6. `outputDir` per property SHALL isolate snapshot files and keyword-ideas caches per property (e.g., `data/coffey-codes/snapshot-*.json` vs `data/client-b/snapshot-*.json`).

### Nice to have

- `--all-properties` flag on `snapshot` to run every property in sequence (useful for daily cron).
- `periscope properties list` subcommand to print the configured property names.

### Non-goals

- This spec does NOT add an interactive onboarding command — that's [SPEC-028](./SPEC-028-periscope-onboard-flow.md).
- This spec does NOT add per-property credential isolation in a vault — credentials remain env-var-driven.
- This spec does NOT introduce a property-aware diff format. `periscope diff` continues to compare snapshots within one property's `outputDir`.

## Design (sketch)

### Config shape — additive

The zod schema gains a discriminated union: either the existing flat shape OR a `properties` map.

```ts
const SinglePropertySchema = z.object({
  siteUrl: z.string(),
  ga4PropertyId: z.string().optional(),
  outputDir: z.string().default('docs/strategy/data'),
  articles: ArticlesSchema,
  landingPages: LandingPagesSchema,
  ads: AdsSchema,
  ga4: Ga4Schema,
  categories: z.array(z.string()).default([]),
});

const PropertyConfigSchema = SinglePropertySchema.extend({
  ads: AdsSchema.extend({
    customerId: z.string().optional(),
    loginCustomerId: z.string().optional(),
    developerTokenEnv: z.string().default('GOOGLE_ADS_DEVELOPER_TOKEN'),
  }),
});

const MultiPropertySchema = z.object({
  defaultProperty: z.string(),
  properties: z.record(z.string(), PropertyConfigSchema),
});

export const PeriscopeConfigSchema = z.union([
  SinglePropertySchema,
  MultiPropertySchema,
]);
```

`loadConfig()` returns a `{ config, resolvedProperty: ResolvedProperty }` shape where `ResolvedProperty` is always the flat per-property view, regardless of source. Commands consume `resolvedProperty` and never branch on which shape the user wrote.

### CLI surface

```bash
periscope --property client-b snapshot
periscope --property client-b audit articles
periscope --property client-b validate lps --cache-only
```

`--property` is a global option (registered on the root command). Each command's `--explain` prefixes its plan with `[--property=<name>]`.

### Critical files

- `src/lib/config.ts` — schema, resolution.
- `src/lib/auth.ts` — Ads env var lookup honors per-property `ads.developerTokenEnv`.
- `src/cli.ts` — register `--property` globally; pass through to every command.
- All command modules — accept `propertyName` option, plumb to `loadConfig`.
- `tests/fixtures/periscope.config.multi.mjs` — two properties for tests.
- `tests/unit/config-multi-property.test.ts`, `tests/unit/cli-property-flag.test.ts`.

## Edge cases

- [ ] `--property` passed without a `properties` map in the config: error message that explains the user is on the flat shape, list how to convert.
- [ ] Both `properties` and top-level `siteUrl` defined: zod refuses; clear error.
- [ ] `defaultProperty` names a property that doesn't exist in `properties`: zod refuses.
- [ ] Two properties with the same `outputDir`: warn (snapshot files will overwrite each other).
- [ ] Per-property `developerTokenEnv` points to an unset env var: same `developer-token-not-approved` / `auth-error` flow as today.

## Acceptance criteria

1. Existing single-property consumers (including `coffey.codes`) need zero config changes after upgrading to the version that lands this spec.
2. A `periscope.config.mjs` with two properties allows `periscope --property foo snapshot` and `periscope --property bar snapshot` to write to different `outputDir` paths with different `siteUrl`/`customerId` values, verified by a multi-property fixture under `tests/fixtures/`.
3. `periscope --property does-not-exist audit articles` exits 2 and lists the available property names.
4. `periscope --property foo audit articles --explain` prints `[--property=foo]` as the first line of the plan.

## Constraints

- Must remain backwards-compatible with the single-property flat config shape.
- Snapshot file format additions only (no breaking removals).
- The Ads developer-token env var name MUST be configurable per property — different client accounts use different MCCs with different tokens.

## Tasks

- [ ] Extend zod schema to a discriminated union (flat or multi-property).
- [ ] `loadConfig` returns a `resolvedProperty` view.
- [ ] CLI `--property` global flag wired into every command.
- [ ] Per-property `outputDir` honored end-to-end.
- [ ] Per-property `ads.developerTokenEnv` consulted by auth.
- [ ] `--explain` and `doctor` prefix their output with the property name.
- [ ] Multi-property fixture + tests.
- [ ] README + migration note: "How to convert a single-property config to multi-property".

## Notes

### Why this didn't ride along in SPEC-024

The author has no second property to exercise from this machine right now. Landing the multi-property abstraction without a real second property to test it against would put untested code on the critical path of every Ads command (every `loadConfig` call, every CLI invocation). SPEC-024 carved this out so the GSC-first pivot + error UX + caching could land first, then this spec can be planned and tested deliberately once a second property is real.

### Open questions

1. Should `--all-properties` be opt-in per command or only on `snapshot`?
2. Should the cache file naming gain a property prefix (e.g., `keyword-ideas-<property>-<asof>.json`), or is per-property `outputDir` enough?
3. Is there a use case for a "shared" / inheritable property block (DRY across properties that share categories or auth)?

### Related specs

- [SPEC-024](./SPEC-024-periscope-gsc-first-audit-ads-quota.md) — parent; this spec implements its must-have #9 in isolation.
- [SPEC-028](./SPEC-028-periscope-onboard-flow.md) — onboarding flow will create new property entries in `properties:`; depends on this shape landing first.
