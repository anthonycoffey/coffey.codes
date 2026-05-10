---
id: SPEC-011
title: 'Mobile web-vitals recovery for articles, case studies, and global chrome'
status: complete
created: 2026-05-04
author: 'Anthony Coffey'
reviewers: []
affected_repos: ['coffey.codes']
---

## Reviewer Notes

<!-- Leave empty until code review. When requesting changes, reviewer adds feedback here: -->

---

# Feature: Mobile web-vitals recovery — articles, case studies, and global chrome

## Problem

Google PageSpeed Insights mobile audit on 2026-05-04:

| Page                                                  | Score | LCP   | TBT       |
| ----------------------------------------------------- | ----- | ----- | --------- |
| Article: `production-grade-ci-cd-with-nextjs-…`       | 66    | 8.9s  | 120 ms    |
| Case study: `oodjet/fleet-optimization`               | 62    | 3.3s  | 2,030 ms  |
| Homepage (`/`)                                        | 32    | 7.5s  | 34,180 ms |

The article and case study pages are essentially text content yet ship enormous JS payloads (491 KiB and 2,014 KiB unused JS respectively). Three layout-level and bundling-level root causes account for most of the loss; this spec addresses them. The homepage 3D-scene tier is covered by a separate spec (SPEC-012).

Root causes addressed by this spec:

1. **`components/LayoutShell.tsx` is `'use client'`** ([LayoutShell.tsx:1](../../../components/LayoutShell.tsx)) and statically imports `ThemeProvider`, `ConsentManager`, `GoogleAnalyticsClient`, `Navbar`, `LandingPageHeader`, `Footer`. Every route ships all of them.
2. **`components/mdx.tsx` statically imports `ThreeScene`, `FishbowlScene`, `SceneExplorer`, `MermaidChart`** ([mdx.tsx:7-10](../../../components/mdx.tsx)). Mermaid (~600 KiB) and three.js (~300 KiB) are pulled into every article whether used or not.
3. **`CaseStudyStory.tsx:2` statically imports `BarChart`** (visx) into every case study, even ones with no chart blocks.

Secondary contributors:

- `ConsentManager` and `GoogleAnalyticsClient` hydrate on first paint instead of being deferred until idle.
- `next.config.js` has only `transpilePackages: ['next-mdx-remote']` — no `optimizePackageImports` for `@visx/*`, `@heroicons/react`, `@react-three/drei`.
- No `.browserslistrc` — Lighthouse flags ~14 KiB of legacy JS site-wide.
- `Comments.tsx` (Giscus) mounts immediately on every article load even though it is below the fold.

## Requirements

### Must have

1. WHEN a reader visits any non-homepage, non-landing-page route, the system SHALL render `Navbar` and `Footer` from a Server Component layout (`app/(site)/layout.tsx`), with no `'use client'` boundary at the layout level.
2. WHEN a reader visits a landing page (`/lp/*`), the system SHALL render `LandingPageHeader` from `app/lp/layout.tsx` and SHALL NOT include `Navbar` or `Footer` in the route's JS bundle.
3. WHEN a reader visits the homepage (`/`), the system SHALL render the existing transparent-overlay `Navbar` inline and SHALL NOT include `Footer` or `LandingPageHeader` in the route's JS bundle.
4. WHEN a reader visits an article that does not use `<ThreeScene>`, `<FishbowlScene>`, `<SceneExplorer>`, or a Mermaid code block, the route's main JS chunk SHALL NOT include three.js, `@react-three/fiber`, `@react-three/drei`, or `mermaid`.
5. WHEN a reader visits a case study whose `story` blocks contain no `chart` block, the route's main JS chunk SHALL NOT include any `@visx/*` package.
6. WHEN a reader visits an article, the Giscus comments widget SHALL load only after the reader scrolls near it (intersection-based mount), not on initial paint.
7. WHEN a reader visits any page, `ConsentManager` and `GoogleAnalyticsClient` SHALL be deferred (mounted on idle / `lazyOnload` strategy) and SHALL NOT block the critical render path.
8. WHEN the production build runs, Next.js SHALL apply `optimizePackageImports` for `@heroicons/react`, all `@visx/*` packages, and `@react-three/drei`.
9. The repository SHALL include a `.browserslistrc` targeting modern browsers so SWC does not emit ES5 fallbacks.

### Nice to have

- Add `<link rel="preconnect" href="https://www.googletagmanager.com">` to `app/layout.tsx` to shave the GTM connection RTT.
- Verify `next/font/google` already emits a `preconnect` for `fonts.gstatic.com`; if not, add manually.
- Install `@next/bundle-analyzer` as a dev dependency to confirm code-splitting wins.

### Non-goals (what this does NOT do)

- This spec does NOT change the homepage 3D scene rendering, frameloop, or post-processing — that is SPEC-012.
- This spec does NOT migrate off `next-mdx-remote` to build-time MDX (`@next/mdx`).
- This spec does NOT replace Mermaid, visx, or three.js with lighter alternatives.
- This spec does NOT add a static-image fallback for the homepage hero on mobile.
- This spec does NOT change article or case-study URLs (route groups preserve URLs).
- This spec does NOT modify the existing data layer for case studies or article frontmatter.

## Design

### Phase 1a — Route group restructure

Introduce `app/(site)/` route group. Files inside the group keep their existing URL paths (parens directories don't appear in URLs).

**New files:**
- `app/(site)/layout.tsx` (Server Component): renders `<Navbar />` + `{children}` + `<Footer />`. No `'use client'`.
- `app/lp/layout.tsx` (Server Component): renders `<LandingPageHeader />` + `{children}`.

**Moved into `app/(site)/`** (URLs preserved):
- `app/articles/` → `app/(site)/articles/`
- `app/case-study/` → `app/(site)/case-study/`
- `app/case-studies/` → `app/(site)/case-studies/`
- `app/contact/` → `app/(site)/contact/`
- `app/portfolio/` → `app/(site)/portfolio/` (if present)
- Any other top-level non-homepage, non-LP routes (verify via `git ls-files app/` before moving)

**Modified:**
- `app/layout.tsx`: remove `<LayoutShell>` wrapper. Wrap `{children}` with the site-wide globals only:
  - `<ThemeProvider>` (next-themes — stays a `'use client'` component, but it's a small leaf module).
  - `<ConsentManagerLazy />` (new — see 1b).
  - `<GoogleAnalyticsLazy />` (new — see 1b).
- `app/page.tsx` (homepage): renders its own `<Navbar />` inline (transparent overlay variant). The homepage already special-cased this via the `isOverlay` flag in `Navbar`, so no `Navbar` change is needed; just import and render.

**Deleted:**
- `components/LayoutShell.tsx`

### Phase 1b — Defer analytics + consent

**`components/ConsentManager.tsx`:**
- Wrap with a small parent that uses `next/dynamic(() => import('./ConsentManager'), { ssr: false })`. Mount via `requestIdleCallback` (with `setTimeout(…, 1500)` fallback). New file: `components/ConsentManagerLazy.tsx`.

**`components/GoogleAnalyticsClient.tsx`:**
- Currently uses `<GoogleTagManager>` from `@next/third-parties/google`, which defaults to `afterInteractive`. Switch to a manual `<Script src="…" strategy="lazyOnload">` mount via `next/script`, OR wrap the existing component in idle-callback mounting (matching ConsentManager pattern). Verify GTM still fires events by inspecting `window.dataLayer` after load.

### Phase 1c — `next.config.js`

```js
const nextConfig = {
  // … existing config …
  experimental: {
    optimizePackageImports: [
      '@heroicons/react',
      '@visx/axis', '@visx/event', '@visx/gradient', '@visx/group',
      '@visx/responsive', '@visx/scale', '@visx/shape', '@visx/text',
      '@visx/tooltip',
      '@react-three/drei',
    ],
  },
};
```

### Phase 1d — `.browserslistrc`

New file at repo root:

```
> 0.5%
last 2 versions
not dead
not IE 11
```

### Phase 1e — Resource hints

In `app/layout.tsx` (or the relevant `<head>` outlet), add:

```tsx
<link rel="preconnect" href="https://www.googletagmanager.com" />
```

Verify `next/font/google` already injects `preconnect` for `fonts.gstatic.com` (it does by default in recent Next.js); only add manually if missing.

### Phase 2a — Lazy MDX components

`components/mdx.tsx`:

```tsx
import dynamic from 'next/dynamic';

const ThreeScene    = dynamic(() => import('./ThreeScene'),    { ssr: false });
const FishbowlScene = dynamic(() => import('./FishbowlScene'), { ssr: false });
const SceneExplorer = dynamic(() => import('./SceneExplorer'), { ssr: false });
const MermaidChart  = dynamic(() => import('./MermaidChart'),  { ssr: false });
```

`MermaidChart` is referenced from inside the `Code` component when ` ```mermaid ` is detected — already a runtime branch, so dynamic import is safe.

### Phase 2b — Code-split visx in CaseStudyStory

**New file:** `app/(site)/case-study/[slug]/CaseStudyChartBlock.tsx` — a `'use client'` component that imports and renders `BarChart`.

**Modified:** `app/(site)/case-study/[slug]/CaseStudyStory.tsx`:

```tsx
import dynamic from 'next/dynamic';
const CaseStudyChartBlock = dynamic(() => import('./CaseStudyChartBlock'), { ssr: false });
// …
case 'chart':
  return <CaseStudyChartBlock key={idx} {...block} />;
```

Note: `CaseStudyStory` is currently a Server Component. `next/dynamic` with `{ ssr: false }` is a Client-only API. Either (a) make `CaseStudyStory` a client component (small file, low cost), or (b) keep it server and use a thin client wrapper around the chart case. Option (a) is simpler.

### Phase 2c — Lazy-mount Comments

**Modified:** `components/Comments.tsx`:

- Wrap the `<Giscus>` mount in a `useInView` (or simple `IntersectionObserver`) hook with `rootMargin: '200px 0px'`. Render an empty `<section>` placeholder until the user scrolls near.

OR

**New:** `components/CommentsLazy.tsx` — exports `next/dynamic(() => import('./Comments'), { ssr: false })` plus the intersection guard. Update `app/(site)/articles/[slug]/page.tsx` to import `CommentsLazy` instead.

## Edge cases

- [ ] Route-group move must not break the `case-study-migration.md` legacy spec doc references — verify it doesn't link to specific file paths.
- [ ] `app/articles/utils.ts` (used by `getAllBlogPosts`) reads MDX from `app/articles/posts/`. Confirm it still resolves after the move (the function reads from a hardcoded path; update if needed).
- [ ] Sitemap (`app/sitemap.ts`) walks file routes; verify it still picks up routes from `app/(site)/`.
- [ ] OG image route `app/og/route.tsx` should remain at the original path (not in the route group).
- [ ] `Navbar` uses `usePathname` to detect `/` — the homepage path stays `/` in URL even though `app/page.tsx` may now render Navbar inline; behavior unchanged.
- [ ] `ThemeProvider` is a client component but should remain at the root layout (a thin client boundary is fine for context).
- [ ] When `GoogleAnalyticsClient` is deferred, page-load events fired before mount may be missed. Confirm `window.dataLayer` queue captures them OR fire an explicit `pageview` after mount.
- [ ] Articles that *do* use `<ThreeScene>`, `<MermaidChart>` etc. should still render correctly — dynamic import only changes when the chunk loads, not whether it loads.
- [ ] Case studies with multiple chart blocks should still render all charts.

## Acceptance criteria

1. `npm run build` succeeds with no new warnings or errors.
2. `npm run lint` passes.
3. Per-route JS sizes (printed by `npm run build`) on `/articles/<slug>` and `/case-study/<slug>` decrease by ≥ 200 KiB compared to baseline `main` (specifically: text-only article and Oodjet case study).
4. PageSpeed Insights mobile run on a Vercel preview deployment of this branch, against the same article and Oodjet case study URLs:
   - Article score ≥ 90 (target 95+), LCP ≤ 2.5s.
   - Case study score ≥ 90 (target 95+), TBT ≤ 200ms.
5. Theme toggle, cookie consent banner, GTM events, and existing article/case-study rendering all work in manual smoke tests (see Verification).
6. Homepage perf score is unchanged or better (this spec doesn't optimize the 3D scene, but it should not regress).

## Constraints

- Must follow trunk-based workflow per CLAUDE.md: short-lived feature branch off `main`, conventional commits.
- Must not break URL paths for any existing route (route groups preserve URLs).
- Must not regress any active spec in flight (none currently target the same files; verify before merging).
- Must keep Node.js >= 22 compatibility (already enforced).

## Tasks

- [ ] Phase 1a: Create `app/(site)/layout.tsx` and `app/lp/layout.tsx` (Server Components)
- [ ] Phase 1a: `git mv` non-homepage, non-LP routes into `app/(site)/`
- [ ] Phase 1a: Update `app/layout.tsx` to remove `LayoutShell`; render `ThemeProvider` + lazy globals only
- [ ] Phase 1a: Update `app/page.tsx` to render `Navbar` inline
- [ ] Phase 1a: Delete `components/LayoutShell.tsx`
- [ ] Phase 1b: Create `components/ConsentManagerLazy.tsx`; wire into `app/layout.tsx`
- [ ] Phase 1b: Defer `GoogleAnalyticsClient` (lazyOnload or idle-callback mount)
- [ ] Phase 1c: Add `experimental.optimizePackageImports` to `next.config.js`
- [ ] Phase 1d: Add `.browserslistrc` to repo root
- [ ] Phase 1e: Add GTM `preconnect` link in `app/layout.tsx` if missing
- [ ] Phase 2a: Convert four MDX heavyweight components to `next/dynamic` in `components/mdx.tsx`
- [ ] Phase 2b: Extract `CaseStudyChartBlock` and dynamic-import it in `CaseStudyStory.tsx`
- [ ] Phase 2c: Lazy-mount `Comments` via intersection / `next/dynamic`
- [ ] Run `npm run build` and confirm per-route JS sizes drop
- [ ] Run `npm run lint`
- [ ] Manual smoke test (theme, consent, GTM, MDX, charts)
- [ ] Deploy preview branch and re-run PageSpeed Insights against the same URLs
- [ ] Update agent brief (`docs/documentation/agents/coffey-codes.md`) to note the new route-group structure
- [ ] Move spec to `archive/` after merge; status → `complete`

## Notes

- Plan file: `C:\Users\coffe\.claude\plans\homepage-articles-and-case-glittery-dusk.md`
- Companion spec: SPEC-012 (homepage 3D mobile tier) — drafted separately because the work is independently scoped and shippable.
- Baseline PageSpeed reports captured 2026-05-04 12:18–12:19 AM (homepage, case study, article) — see plan file for screenshots.
- Bundle analyzer is optional but strongly recommended to attribute wins to specific changes.
