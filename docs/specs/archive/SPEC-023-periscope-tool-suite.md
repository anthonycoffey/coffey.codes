---
id: SPEC-023
title: 'Periscope: extract SEO tooling into a reusable TypeScript package'
status: complete
created: 2026-05-15
completed: 2026-05-17
author: Anthony Coffey
reviewers: []
affected_repos: [coffey.codes]
---

## Reviewer Notes

<!-- Leave empty until code review. When requesting changes, reviewer adds feedback here: -->

---

# Feature: Periscope tool suite (Phase A: in-place build)

## Problem

The seven SEO scripts in `scripts/` (snapshot, diff, four keyword research tools, plus the youtube-thumbnail outlier) work, but they are shaped for coffey.codes specifically. Three concrete problems:

1. **Multi-project need is real.** The 24hrcarunlocking.com client project needs the same data tooling. Copy-paste forks maintenance immediately.
2. **The UX is inconsistent.** Seven separate `.mjs` entry points, two duplicated ANSI color helpers (`seo-snapshot-diff.mjs:52-64` and `keyword-probe-url.mjs:16-27`), no unified `--help`, project-specific paths and constants (article dir, LP dir, category seeds, geo target, language constant, bot regions) baked into engine code.
3. **The naming is bland.** `seo-snapshot.mjs` is descriptive but disposable. A real tool suite needs a name and a coherent CLI surface.

This SPEC covers **Phase A**: build a TypeScript package `@anthonycoffey/periscope` inside this repo under `tooling/periscope/`, port the seven SEO scripts to it (the youtube one stays put), prove parity against coffey.codes, and delete the old `scripts/seo-*.mjs` and `scripts/keyword-*.mjs` files once parity is confirmed. **Phases B (extract to its own GitHub repo) and C (publish to GitHub Packages) are out of scope for this SPEC** and will get their own (SPEC-024, SPEC-025).

## Requirements

### Must have

1. WHEN `node tooling/periscope/dist/cli.js --help` runs, it SHALL list six subcommands: `snapshot`, `diff`, `audit articles`, `discover topics`, `validate lps`, `probe`.
2. WHEN `periscope snapshot --engines=gsc,ga4,keywords --window=180 --asof=YYYY-MM-DD --dry-run` runs, it SHALL accept the same flag set the old `scripts/seo-snapshot.mjs` accepts and produce equivalent output.
3. WHEN `periscope snapshot` runs against real credentials, it SHALL produce a snapshot JSON whose top-level keys (`gsc`, `ga4`, `bing`, `keywords`, `window`, `siteUrl`, `pulledAt`, plus future `ahrefs`) and per-engine field shapes are byte-identical to a snapshot from the old script run the same day (modulo natural daily delta in numerical values).
4. WHEN `periscope diff <older> <newer>` runs, it SHALL produce diff output matching the structure (sections, deltas, ANSI styling) of the old `seo-snapshot-diff.mjs`.
5. WHEN any keyword research subcommand runs (`audit articles`, `discover topics`, `validate lps`, `probe <url>`), it SHALL produce a Markdown report (or stdout output for `probe`) whose structure matches the corresponding old script's output.
6. The package SHALL load configuration from `periscope.config.{ts,mjs,json}` at the consumer repo root, validated by zod. Schema fields cover: `siteUrl`, `ga4PropertyId`, `outputDir`, optional `articles.dir` + `articles.frontmatterFields`, optional `landingPages.dir`, optional `ads.languageCode` + `ads.geoTargets`, optional `ga4.botRegions`, optional `categories[]`.
7. WHEN a subcommand requires a config field that is not set (e.g. `audit articles` with no `articles.dir`), it SHALL exit with code 2 and a clear message naming the missing field, NOT crash with a stack trace.
8. The package SHALL ship as TypeScript built with `tsup` to ESM, with `.d.ts` types emitted for the public API surface (`engines/*`, `lib/config`, `lib/snapshot-store`, `types/*`).
9. `commander` SHALL handle CLI parsing. Each subcommand SHALL have its own `--help` text with at least one example.
10. ANSI color logic SHALL be consolidated into `src/lib/colors.ts` and used by both `diff` and `probe` (the two current duplicators) plus any other command that wants color.
11. The package SHALL ship with vitest unit tests covering: bucket math (`bucketRank`, `bucketLabel`), config loader (valid + invalid configs, missing required fields), the hand-rolled frontmatter parser (against real coffey.codes article frontmatter), and the ANSI color helpers (color-on / color-off paths).
12. WHEN parity is proven against coffey.codes (verification items 1-10 below pass), the old `scripts/seo-snapshot.mjs`, `scripts/seo-snapshot-diff.mjs`, `scripts/keyword-*.mjs`, `scripts/lib/google-ads.mjs`, and `scripts/lib/snapshot-markdown.mjs` SHALL be deleted in the close-out commit of Phase A.
13. `scripts/youtube-thumbnail.mjs` SHALL be left in place untouched (not SEO, not in scope).

### Nice to have

- A `--config <path>` flag on every subcommand to override the default config location.
- `periscope init` subcommand that scaffolds a `periscope.config.ts` with example values for the consumer project.
- Example configs in `tooling/periscope/examples/` covering both shapes: `blog-site.config.ts` (coffey.codes) and `local-services.config.ts` (24hrcarunlocking-style: no articles, no LPs).
- A `src/engines/ahrefs.ts` stub that throws `NotImplementedError` so SPEC-022 has a clean slot.

### Non-goals (what this does NOT do)

- This SPEC does NOT extract the package to its own GitHub repo. SPEC-024 covers that.
- This SPEC does NOT publish to GitHub Packages. SPEC-025 covers that.
- This SPEC does NOT implement the Ahrefs engine. SPEC-022 covers that.
- This SPEC does NOT migrate `scripts/youtube-thumbnail.mjs`. Not SEO.
- This SPEC does NOT add a web dashboard, an interactive prompt mode, or a plugin architecture for third-party engines.
- This SPEC does NOT change the snapshot JSON shape. Byte-level parity (on structure) is a must-have.

## Design

### Package layout

```
tooling/periscope/
  package.json              # name "@anthonycoffey/periscope", private, bin { periscope: "dist/cli.js" }
  tsconfig.json
  tsup.config.ts            # ESM + .d.ts, target node22
  README.md
  src/
    cli.ts                  # commander entry
    commands/
      snapshot.ts
      diff.ts
      audit-articles.ts
      discover-topics.ts
      validate-lps.ts
      probe.ts
    engines/
      gsc.ts
      ga4.ts
      bing.ts
      ads.ts                # the keyword-planner half of old google-ads.mjs
      ahrefs.ts             # stub
    lib/
      auth.ts               # service-account JWT, was google-ads.mjs:getAdsAuth
      bucket.ts             # BUCKET_ORDER, bucketLabel, bucketRank
      colors.ts             # unified ANSI helper
      markdown.ts           # was scripts/lib/snapshot-markdown.mjs
      config.ts             # zod schema, file loader (.ts via tsx or compiled, .mjs via import(), .json via fs)
      paths.ts              # resolve consumer repo root + project-relative paths
      snapshot-store.ts     # loadLatestSnapshot, isSnapshotStale
      frontmatter.ts        # hand-rolled parser (kept; gray-matter is overkill)
    types/
      snapshot.ts           # the JSON snapshot contract
      config.ts             # zod schema + inferred TS type
  examples/
    blog-site.config.ts
    local-services.config.ts
  tests/
    unit/
      bucket.test.ts
      config.test.ts
      frontmatter.test.ts
      colors.test.ts
    smoke/
      cli-help.test.ts      # spawn the built CLI, assert --help works
      diff-fixture.test.ts  # diff two committed fixture snapshots
```

### Config schema (zod)

```ts
import { z } from 'zod';

export const PeriscopeConfigSchema = z.object({
  siteUrl: z.string().min(1),                       // 'sc-domain:coffey.codes'
  ga4PropertyId: z.string().optional(),
  outputDir: z.string().default('docs/strategy/data'),
  articles: z.object({
    dir: z.string(),
    frontmatterFields: z.object({
      title: z.string().default('title'),
      summary: z.string().default('summary'),
      tags: z.string().default('tags'),
      category: z.string().default('category'),
    }).default({}),
  }).optional(),
  landingPages: z.object({
    dir: z.string(),
    pageFile: z.string().default('page.tsx'),
    brandSuffix: z.string().optional(),
  }).optional(),
  ads: z.object({
    languageCode: z.string().default('languageConstants/1000'),
    geoTargets: z.array(z.string()).default(['geoTargetConstants/2840']),
  }).default({}),
  ga4: z.object({
    botRegions: z.array(z.string()).default(['China', 'Singapore']),
  }).default({}),
  categories: z.array(z.string()).default([]),
});

export type PeriscopeConfig = z.infer<typeof PeriscopeConfigSchema>;
```

### CLI surface (`commander`)

```
periscope snapshot [--engines=gsc,ga4,bing,keywords] [--window=N] [--asof=YYYY-MM-DD] [--dry-run]
periscope diff <older.json> <newer.json>
periscope audit articles
periscope discover topics
periscope validate lps
periscope probe <url>
periscope --help
periscope <cmd> --help
```

All subcommands accept `--config <path>` (nice-to-have).

### Snapshot JSON contract

Captured as TS types in `src/types/snapshot.ts`. Existing shape preserved exactly. The types document what the old scripts produced implicitly. No JSON schema migrations.

### Coffey.codes consumption (during Phase A)

`package.json` (coffey.codes root) gains:

```json
"scripts": {
  "seo": "node tooling/periscope/dist/cli.js",
  "seo:snapshot": "npm run seo -- snapshot",
  "seo:diff": "npm run seo -- diff",
  "seo:audit-articles": "npm run seo -- audit articles",
  "seo:discover-topics": "npm run seo -- discover topics",
  "seo:validate-lps": "npm run seo -- validate lps",
  "seo:probe": "npm run seo -- probe"
}
```

`periscope.config.ts` lives at the coffey.codes root with the coffey-shaped config.

A `tooling/periscope/package.json` is its own `npm install` target (separate `node_modules/`). The root `package.json` does NOT depend on `@anthonycoffey/periscope` yet (that happens in Phase C).

## Edge cases

- [ ] **Config file is missing.** Exit code 2, message: "no periscope.config.{ts,mjs,json} found at <cwd>; create one or pass --config".
- [ ] **Config file has a typo / wrong type.** zod's error path naming surfaces the field with the problem. Print the zod error message verbatim.
- [ ] **`audit articles` invoked but config has no `articles.dir`.** Exit code 2, message: "audit articles requires `articles.dir` in periscope.config".
- [ ] **`validate lps` invoked but config has no `landingPages.dir`.** Same shape, named differently.
- [ ] **Snapshot output dir does not exist.** Auto-create with `mkdir -p`-style behavior, log a one-liner.
- [ ] **Build artifacts (`dist/`) are checked in vs. gitignored.** Gitignore them. Consumers run `npm run build` in `tooling/periscope/` once after pulling.
- [ ] **`node_modules/` inside `tooling/periscope/` collides with root.** Separate `node_modules/`, separate lockfile. Document in README that the package is its own workspace island during Phase A.
- [ ] **Windows path separators.** All paths go through `path.join` and `path.resolve`. Tests run on Windows-shaped fixtures.
- [ ] **`googleapis` dep size.** Verify the built `dist/` only pulls the GSC and GA4 surfaces. Document the bundle size in the README after the first build.

## Acceptance criteria

1. `cd tooling/periscope && npm install && npm run build` succeeds, produces `dist/cli.js` and `dist/*.d.ts`.
2. `node tooling/periscope/dist/cli.js --help` lists all six subcommands.
3. `node tooling/periscope/dist/cli.js snapshot --dry-run` prints the same engine list as `node scripts/seo-snapshot.mjs --dry-run`.
4. `node tooling/periscope/dist/cli.js snapshot --engines=gsc --window=30` produces a snapshot JSON byte-identical in structure (top-level keys, GSC sub-shape, metadata fields) to a same-day snapshot from the old script.
5. `node tooling/periscope/dist/cli.js diff <pre> <post>` runs without error and reports zero structural drift between two same-day snapshots.
6. `node tooling/periscope/dist/cli.js audit articles` produces a Markdown report whose section structure matches the old script.
7. `node tooling/periscope/dist/cli.js probe <url>` produces the same top-30 keyword list as the old script (modulo natural Ads API jitter).
8. `cd tooling/periscope && npm test` — all vitest unit + smoke tests pass.
9. `npm run lint` at the coffey.codes root still passes (no eslint config drift).
10. The new `npm run seo:snapshot` (and siblings) from the coffey.codes root produce the same output as direct CLI invocation.
11. After 1-10 pass, the old `scripts/seo-*.mjs` and `scripts/keyword-*.mjs` files are deleted; `scripts/youtube-thumbnail.mjs` remains.

## Constraints

- Node 22+ (matches the rest of coffey.codes).
- New deps in the package: `commander`, `zod`, `tsup`, `typescript`, `vitest`. Comes with: `googleapis`, `@google-analytics/data` (already in coffey.codes root, also vendored into the package).
- No native deps. No build-time codegen.
- Output files (snapshots, reports) stay committed to git as they are today.
- Voice rules apply to all rendered output (Markdown reports, diff output, help text, error messages): no em-dashes, no marketing tricolons, no closing flourishes.
- Windows-clean paths. Tested in this worktree which is Windows.
- The `tooling/periscope/` directory is excluded from the root `tsconfig.json` and the root `vitest.config.ts` — the package has its own.

## Tasks

- [ ] Scaffold `tooling/periscope/` with `package.json`, `tsconfig.json`, `tsup.config.ts`, `.gitignore`, minimal `src/cli.ts` with commander stubs for all six commands, minimal vitest config.
- [ ] Port `scripts/lib/google-ads.mjs` → split into `src/engines/ads.ts`, `src/lib/auth.ts`, `src/lib/bucket.ts`, `src/lib/snapshot-store.ts`.
- [ ] Port `scripts/lib/snapshot-markdown.mjs` → `src/lib/markdown.ts`.
- [ ] Port `scripts/seo-snapshot.mjs` → `src/commands/snapshot.ts` plus `src/engines/{gsc,ga4,bing}.ts`.
- [ ] Port `scripts/seo-snapshot-diff.mjs` → `src/commands/diff.ts`. Consolidate the ANSI helper into `src/lib/colors.ts`.
- [ ] Port `scripts/keyword-audit-articles.mjs` → `src/commands/audit-articles.ts`.
- [ ] Port `scripts/keyword-discover-topics.mjs` → `src/commands/discover-topics.ts`.
- [ ] Port `scripts/keyword-validate-lps.mjs` → `src/commands/validate-lps.ts`.
- [ ] Port `scripts/keyword-probe-url.mjs` → `src/commands/probe.ts`.
- [ ] Implement `src/lib/config.ts` with zod schema and multi-format loader.
- [ ] Implement `src/lib/frontmatter.ts` with the hand-rolled parser, behind the config's `frontmatterFields` map.
- [ ] Add `src/engines/ahrefs.ts` as a `NotImplementedError`-throwing stub.
- [ ] Write `periscope.config.ts` at the coffey.codes root with the current coffey-shaped config.
- [ ] Add `seo:*` scripts to the root `package.json`.
- [ ] Write vitest unit tests for bucket math, config loader, frontmatter parser, colors.
- [ ] Write vitest smoke tests for `--help` and diff-against-fixture.
- [ ] Add example configs `examples/blog-site.config.ts` and `examples/local-services.config.ts`.
- [ ] Write `tooling/periscope/README.md` covering: what it is, install, config, CLI reference, contribution.
- [ ] Run parity validation against the live coffey.codes account. Commit the post-migration snapshot.
- [ ] Diff pre- and post-migration snapshots, confirm zero structural drift.
- [ ] Delete old `scripts/seo-*.mjs`, `scripts/keyword-*.mjs`, `scripts/lib/google-ads.mjs`, `scripts/lib/snapshot-markdown.mjs`.
- [ ] Update `docs/documentation/guides/seo-snapshot-setup.md` with new command syntax.
- [ ] Update `docs/documentation/guides/seo-tooling-inventory.md` with the periscope CLI surface.
- [ ] Update `docs/documentation/agents/coffey-codes.md` SEO pipeline section.
- [ ] Update `docs/specs/active/SPEC-022-ahrefs-snapshot-engine.md` to point at periscope's `src/engines/ahrefs.ts` instead of the old `scripts/lib/`.

## Notes

- **Why a sibling directory in this repo, not a separate repo immediately.** Iterating in-place against a real consumer (this repo) is faster than the Phase B "extract first, debug across two repos" path. Once parity is proven, the extract becomes mechanical.
- **Why `tsup` over `tsc` directly.** Zero-config, fast, ESM+`.d.ts` in one shot. The bundle is small enough that we don't need fine-grained control over output.
- **Why `commander` over `yargs` or hand-rolled.** Industry standard, well-typed, mature subcommand support. The current scripts hand-roll argv parsing; consolidating to commander removes that variance.
- **Why `zod` for config validation.** Better error messages than ad-hoc validation, types come for free, the runtime validation is the point.
- **Frontmatter parser stays hand-rolled.** The current parser handles coffey.codes frontmatter correctly and is ~30 lines. Bringing in `gray-matter` adds a dep for marginal benefit; the hand-rolled version is portable as-is.
- **Related specs:**
  - SPEC-022 (Ahrefs engine, active draft): consumes the periscope engine slot.
  - SPEC-024 (extraction to its own repo, future): follow-up to Phase B.
  - SPEC-025 (GitHub Packages publish, future): follow-up to Phase C.
  - SPEC-018, SPEC-019, SPEC-020 (archived): the work being repackaged.

## Open questions

1. Should the package vendor `@google-analytics/data` (currently a coffey.codes dep) or just declare it as a `peerDependency`? Lean toward direct dependency — the package owns the GA4 surface, the consumer should not have to know.
2. Should `periscope init` (the nice-to-have scaffolder) ship in Phase A or defer to Phase B/C? Lean toward defer; not blocking.
3. Should the `--asof` flag move from `snapshot` to a top-level CLI flag so it can affect output filename consistently across commands? Defer; current per-command flag works.
