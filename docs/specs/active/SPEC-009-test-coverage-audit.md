---
id: SPEC-009
title: 'Test suite audit — push to 99% coverage with CI gate'
status: ready
created: 2026-04-27
author: Anthony Coffey
reviewers: []
affected_repos: []
---

## Reviewer Notes

<!-- Leave empty until code review. When requesting changes, reviewer adds feedback here: -->

---

# Feature: Test suite audit — push to 99% coverage with CI gate

## Problem

Vitest and Playwright are wired up with 35 unit test files and 2 e2e specs (most of that delivered by the now-merged SPEC-003 and SPEC-004), but:

- **No coverage reporter is configured.** We have no objective view of which files or branches are exercised.
- **No coverage bar is codified.** Future PRs can silently land code with no tests and we'd never know.
- **The tested surface is uneven.** Canvas, articles, and overlays are well-covered; large chunks of `components/`, `app/` routes, `app/lp/` landing pages, and miscellaneous utilities have no dedicated tests.

We want to take stock, lock a regression-prevention bar into CI immediately, and then ratchet that bar upward toward 99% over a series of follow-up PRs.

## Strategy: incremental ratchet

Hitting 99% in one PR would mean ~40 new test files and 8–15 hours of work. Instead this spec ships in two phases:

- **Phase 1 (this PR):** Add tooling, gate CI at the current baseline floor, archive SPEC-003/004. Locks in a regression-prevention bar today.
- **Phase 2 (follow-up PRs):** Ratchet thresholds up incrementally as each area gets tests. Target ladder: **40/30/35/40 → 60 → 80 → 95 → 99**. Each ratchet PR fills one area (canvas, components, app routes, ui, etc.) and bumps thresholds in `vitest.config.ts`. 99% remains the destination.

### Baseline (recorded 2026-04-27 on `main`)

| Metric | Baseline | Phase 1 floor | Final target |
|---|---|---|---|
| Statements | 44.05% | 40 | 99 |
| Branches | 31.49% | 30 | 99 |
| Functions | 39.6% | 35 | 99 |
| Lines | 44% | 40 | 99 |

## Requirements

### Must have (Phase 1 — this PR)

1. WHEN `npm run test:coverage` is run locally, the system SHALL produce a v8 coverage report (text + html + lcov) covering `app/`, `components/`, `utils/`, and `hooks/`.
2. WHEN a PR is opened against `main`, CI SHALL run coverage and SHALL fail the job if any of the four metrics drops below the Phase 1 floor (lines 40 / branches 30 / functions 35 / statements 40).
3. WHEN coverage runs in CI, the `coverage/lcov.info` artifact SHALL be uploaded to the workflow run for downstream inspection.
4. WHEN a source file is genuinely untestable (e.g., bare `requestAnimationFrame` loop bodies, three.js render-frame internals), it SHALL be excluded via `/* v8 ignore */` with a one-line WHY comment, OR via the global `coverage.exclude` glob list — not by lowering the threshold.
5. WHEN Phase 1 ships, SPEC-003 and SPEC-004 SHALL be moved to `docs/specs/archive/` with `status: complete`.

### Must have (Phase 2 — follow-up PRs, tracked separately)

6. Each follow-up ratchet PR SHALL fill one area of the gap list and SHALL raise thresholds in `vitest.config.ts` to the next ladder rung.
7. Final state: lines / branches / functions / statements all ≥ 99% on the included surface.

### Nice to have

- HTML report served via a `test:coverage:ui` script for local triage.
- A short table in the PR description listing per-area coverage before/after.

### Non-goals (what this does NOT do)

- This spec does NOT add new product features.
- This spec does NOT rework e2e (Playwright) coverage — Playwright stays scoped to user journeys; the 99% bar is unit-only.
- This spec does NOT replace the existing Vitest setup or migrate frameworks.
- This spec does NOT cover `app/og/**` (dynamic OG image routes), `*.d.ts`, route `layout.tsx` / `loading.tsx` / `not-found.tsx` files — these are explicitly excluded.

## Design

### Coverage tooling

Add `@vitest/coverage-v8` as a devDependency. Extend `vitest.config.ts` with a `test.coverage` block:

```ts
coverage: {
  provider: 'v8',
  reporter: ['text', 'html', 'lcov'],
  include: ['app/**', 'components/**', 'utils/**', 'hooks/**'],
  exclude: [
    '**/*.d.ts',
    '**/layout.tsx',
    '**/loading.tsx',
    '**/not-found.tsx',
    '**/types.ts',
    'app/og/**',
    '**/__tests__/**',
    'e2e/**',
  ],
  thresholds: { lines: 99, branches: 99, functions: 99, statements: 99 },
}
```

Add npm scripts:

- `test:coverage` — `vitest run --coverage`
- `test:coverage:ui` — opens the HTML report

### Gap-fill strategy

Run baseline once on `main`, then work file-by-file. Reuse existing test patterns rather than inventing new ones:

| Area | Pattern to mirror |
|---|---|
| Pure utils / hooks | `__tests__/utils/`, `__tests__/hooks/usePagination.test.ts` |
| Server components / pages | `__tests__/articles/` (mocks `next/navigation`) |
| Client components with state | `__tests__/overlay/` |
| Three.js / R3F components | `__tests__/canvas/` (paired with `vitest.setup.ts` console filtering) |
| API route handlers | `__tests__/api/search.test.ts` |

### CI gate

Edit `.github/workflows/ci.yml`: replace (or add alongside) the existing Vitest job with one that runs `npm run test:coverage`. v8 threshold failure naturally fails the step. Upload `coverage/lcov.info` as an artifact.

### Spec lifecycle housekeeping

As part of this PR, also flip SPEC-003 and SPEC-004 status `review-pending` → `complete` and move them to `docs/specs/archive/` per the lifecycle in `docs/documentation/development-standards.md`. They are merged but were never archived.

## Edge cases

- [ ] **Three.js animation loops** — `useFrame` bodies that mutate refs each frame can't be meaningfully line-covered without simulating frames. Where existing canvas tests already drive `useFrame` via the established pattern, that's enough; remaining unreachable lines get scoped `v8 ignore` comments.
- [ ] **Server-only files calling `headers()` / `cookies()`** — mock at the test boundary the same way `__tests__/articles/` already does.
- [ ] **Files that exist only to re-export** (barrel files) — typically 100% by virtue of any import; if v8 reports them as 0%, add to the exclude glob.
- [ ] **Generated/dynamic routes** (`app/og/**`) — excluded globally; not counted toward the 99% bar.
- [ ] **Threshold dips during work-in-progress** — the CI gate fires only on PR; local coverage runs report numbers without blocking.

## Acceptance criteria (Phase 1)

1. `npm run test:coverage` exits 0 locally with all four metrics ≥ Phase 1 floor on the included surface.
2. `coverage/index.html` opens and shows per-file detail.
3. PR's CI `unit` job runs coverage and would fail if a metric drops below the floor.
4. `coverage/lcov.info` is downloadable from the GitHub Actions run.
5. SPEC-003 and SPEC-004 are `status: complete` and live under `docs/specs/archive/`.
6. This spec stays `active` (not complete) until the Phase 2 ratchet sequence reaches 99%.

## Constraints

- Stack is fixed: Vitest 4 + jsdom + Playwright 1.59 + Next.js 16 / React 19. No framework swap.
- Node ≥ 22 (already enforced).
- Trunk-based: one short-lived `feature/test-coverage-audit` branch, one PR.

## Tasks

### Phase 1 (this PR)

- [x] Install `@vitest/coverage-v8`; extend `vitest.config.ts` with the `coverage` block.
- [x] Add `test:coverage` and `test:coverage:ui` scripts to `package.json`.
- [x] Run baseline `npm run test:coverage` on `main`; record numbers in this spec.
- [x] Update `.github/workflows/ci.yml` to run coverage with Phase 1 floor thresholds; upload `lcov.info` artifact.
- [ ] Move SPEC-003 and SPEC-004 to `complete` status in `docs/specs/archive/`.

### Phase 2 (follow-up PRs, one per area)

- [ ] Ratchet PR: components/canvas/objects (Galaxy, Planet, Satellite, Spaceship, TumblingRock, UFO) → bump thresholds to next rung.
- [ ] Ratchet PR: top-level `components/` (Footer, Navbar, ContactForm, SearchBox, Pagination, etc.) → bump thresholds.
- [ ] Ratchet PR: `app/` routes (page, sitemap, robots, rss, articles/[slug]) + `app/lp/*` landing pages → bump thresholds.
- [ ] Ratchet PR: `components/ui/` + remaining stragglers → reach 99% on all four metrics.
- [ ] Move SPEC-009 to `complete` status in `docs/specs/archive/` once 99% is locked in.

## Notes

- Builds on SPEC-003 (homepage canvas tests) and SPEC-004 (articles & taxonomy tests).
- The work also organically exercises the recently-reworked Vercel preview + e2e CI workflow (`d60055f`, `1cf51ff`, `4cedc30`, `1f2bca1`, `ee53b66`) by virtue of being a non-trivial PR — no special handling needed for that.
