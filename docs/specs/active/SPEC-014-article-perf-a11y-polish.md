---
id: SPEC-014
title: 'Article perf + a11y polish — Lighthouse mobile 75 → 90+'
status: draft
created: 2026-05-10
author: Anthony Coffey
reviewers: []
affected_repos: [coffey.codes]
---

## Reviewer Notes

<!-- Leave empty until code review. When requesting changes, reviewer adds feedback here: -->

---

# Feature: Article perf + a11y polish

## Problem

PageSpeed Insights mobile audit on `/articles/production-grade-ci-cd-with-nextjs-vercel-and-github-actions` scores **75/100** with the following flagged issues:

1. **Uncrawlable links** — `components/GoBack.tsx` renders `<a onClick={() => history.back()}>` with no `href`. Search engines can't crawl it and it's semantically wrong (should be a `<button>` since it triggers JS, not navigation). The crawlability flag affects SEO discoverability of internally-linked content.
2. **Insufficient color contrast** — one or more text/background pairs fail WCAG AA. Specific offenders not yet identified; lighthouse audit highlights them in the rendered DOM.
3. **Unused JavaScript** — bytes shipped that aren't used on the page. Likely culprits given the article-page bundle: parts of `motion`/`framer-motion`, `mermaid` (only used in some posts), `@visx/*` (case-study charts), and possibly portions of `@react-three/*` if any code path inadvertently pulls them in for articles.
4. **Image delivery** — modern formats (AVIF/WebP) and right-sized variants. Next/Image already handles a lot of this; gap is likely missing `priority` on the article hero, or missing `sizes` on MDX inline images.
5. **Render-blocking requests** — CSS or scripts in the critical path delaying first paint. The SASS bundle imported in `app/layout.tsx`, plus any third-party CSS, are the prime suspects.
6. **Forced reflow** — JavaScript reading layout properties (`offsetWidth`, `getBoundingClientRect`, etc.) after writing to the DOM, forcing the browser to recompute layout synchronously. Usually shows up in animation/scroll handlers.

This is the post-SPEC-013 follow-up: GSC's structured data, redirects, and pagination concerns are resolved; this spec closes the remaining performance and accessibility gaps that PSI surfaces alongside GSC.

## Requirements

### Must have

1. WHEN the article page renders, the "Back" affordance SHALL be a `<button>` (or a real `<a href>` if it represents navigable history) with no `<a onClick>` without `href` patterns anywhere in the codebase.
2. WHEN every article page is audited with axe / lighthouse a11y, all text/background color pairs SHALL meet WCAG 2.2 AA contrast (4.5:1 for body text, 3:1 for large text).
3. WHEN the article page is audited by Lighthouse mobile, the **Performance** score SHALL be ≥ 90 and the **Accessibility** score SHALL be 100.
4. WHEN bundle analysis is run on the article route, no module SHALL be present that's not actually used on that page (no `mermaid`, no `@visx/*`, no `@react-three/*` unless the page uses them).
5. WHEN an article is loaded cold on a throttled "Slow 4G" connection, no render-blocking request SHALL exceed 100ms of critical-path delay (Lighthouse "Eliminate render-blocking resources" audit shows zero opportunities).
6. WHEN scroll/resize handlers run, they SHALL NOT trigger forced reflow (Performance panel "Forced reflow" warnings are zero on a 10s scroll-through of an article).

### Nice to have

- Add a global axe-core CI check (or a vitest a11y test) so contrast regressions can't ship.
- Surface the bundle analyzer (`@next/bundle-analyzer`) as an `npm run analyze` script for future audits.
- Add a `priority` prop to the article hero image (if any) so it becomes the LCP candidate explicitly.
- Inline critical CSS for above-the-fold content if Lighthouse still flags render-blocking after the SASS bundle is trimmed.

### Non-goals (what this does NOT do)

- This spec does NOT change the homepage 3D scene (covered by SPEC-012, already complete).
- This spec does NOT migrate from `framer-motion`/`motion` to a lighter animation library — bundle reductions will come from code-splitting and tree-shaking, not library swaps.
- This spec does NOT re-skin the site's color palette (per standing memory: dark/vibrant/psychedelic stays). Contrast fixes adjust specific token values, not the overall direction.
- This spec does NOT target Lighthouse 100/100 across all categories — pragmatic 90+ is the goal.

## Design

### 1. GoBack — fix uncrawlable link

`components/GoBack.tsx` currently renders:

```tsx
<a className="..." onClick={() => history.back()}>
  <span><ArrowLongLeftIcon className="h-4 w-4 mr-2" /></span>
  Back
</a>
```

Change to a `<button>` with appropriate styling, since the action is JavaScript-driven (not a link to a URL):

```tsx
<button
  type="button"
  className="..."
  onClick={() => history.back()}
>
  <ArrowLongLeftIcon className="h-4 w-4 mr-2" aria-hidden="true" />
  Back
</button>
```

Resolves PSI's "Links are not crawlable" flag and aligns with WAI-ARIA semantics. No SEO downside since the original link had no `href` for crawlers anyway.

### 2. Color contrast

Approach:
- Run `axe-core` against a deployed article URL (or via Playwright + `@axe-core/playwright`) to identify the specific token pairs that fail.
- Adjust the offending color tokens in `styles/global.sass` (or wherever they're defined) so they hit ≥ 4.5:1 for body text against the surface they sit on. Common suspects: `text-c-muted` on `bg-surface`, footer/secondary text.
- Add a Vitest snapshot or Playwright a11y test that runs axe on the article layout and asserts zero violations.

### 3. Unused JavaScript — bundle audit

- Add `@next/bundle-analyzer` as a dev dep, plumbed through an `analyze` script.
- Run analyzer on the article route specifically. Identify imports being pulled in transitively that aren't used.
- For each surplus module:
  - If always-unused on articles → make it `dynamic()` with `ssr: false`, deferred behind an interaction or scroll trigger.
  - If conditionally used (e.g. mermaid only on posts that include diagrams) → already done via `components/mdx-clients.tsx`; verify and tighten.
- Re-run analyzer; first-load JS should drop measurably.

### 4. Image delivery

- Audit `app/(site)/articles/[slug]/page.tsx` and `components/mdx.tsx` (`RoundedImage`) to ensure:
  - All `<Image>` components use proper `width`/`height` or `fill` + aspect-ratio container.
  - The article's hero/header image (if any) has `priority` set so it becomes the LCP candidate.
  - All `<Image>` declares `sizes` for the layout it lives in (similar treatment to the LogoGrid/Portfolio fixes from SPEC-013).
- Verify `next.config.js` isn't disabling AVIF/WebP (defaults are fine; just confirm).

### 5. Render-blocking requests

- Audit the critical path: SASS bundle (`styles/global.sass` imported at `app/layout.tsx:2`), font CSS from `next/font`, third-party CSS.
- For SASS: split global styles into a smaller "critical" bundle and a "deferred" bundle if possible. Or: review how much of `global.sass` actually applies to article pages.
- For fonts: confirm `display: 'swap'` is set on all `next/font` declarations (per SPEC-011 work).
- For third-party scripts: confirm `lazyOnload` strategy is in place (per SPEC-011) and the GTM preconnect is the only critical-path third-party reference.

### 6. Forced reflow

- Profile a typical article scroll session in Chrome Performance panel; Lighthouse names the offending function in the "Avoid long main-thread tasks" audit.
- Likely candidates:
  - `ScrollContainer` GSAP scroll handlers reading `getBoundingClientRect` per frame.
  - `Testimonials` or `LogoGrid` `useInView` callbacks doing measurement on mount.
  - The Comments lazy-mount intersection observer.
- Fix by batching reads before writes (`requestAnimationFrame` patterns) or caching layout values.

## Edge cases

- [ ] If the GoBack `<button>` triggers `history.back()` on a page entered via a direct link (no history), the back action is a no-op. Add a fallback: if `history.length <= 1`, navigate to `/articles` instead. Same UX as before but explicit.
- [ ] Color contrast fixes must respect the `data-theme="dark"` attribute on `<body>` and dark-mode token overrides — fix both light and dark variants.
- [ ] axe-core may flag false-positive contrast issues on text over images (testimonial backgrounds, OG generator). Verify each flagged finding before mutating tokens.
- [ ] Bundle analyzer may show modules pulled in by Next.js framework code itself; only chase modules under `app/`, `components/`, and project deps.
- [ ] Forced reflow fixes must not regress the existing scroll/animation feel — visual QA on the homepage scroll sequence is required after touching `ScrollContainer`.

## Acceptance criteria

1. PSI mobile score on `/articles/production-grade-ci-cd-with-nextjs-vercel-and-github-actions` is **≥ 90 Performance, 100 Accessibility, 100 SEO**.
2. PSI mobile score on at least 3 other article URLs (representative set) is **≥ 90 Performance**.
3. `grep -r "<a[^>]*onClick" components/ app/` returns zero matches outside of legitimate `<a href onClick>` enhancement patterns.
4. `npx playwright test e2e/a11y.spec.ts` (or equivalent axe check) passes with zero violations on at least the article page, homepage, and one case-study page.
5. `npm run analyze` (added by this spec) shows the article route's first-load JS reduced versus the SPEC-013 baseline by a measurable, documented amount.
6. Chrome Performance panel recording of a 10s scroll on an article shows zero "Forced reflow" warnings.

## Constraints

- Single PR, branch `fix/article-perf-a11y-polish`, per the project's PR-scoping convention.
- No new third-party frameworks (axe-core and bundle-analyzer count as tooling, not framework changes).
- Per existing memory: dark/vibrant palette stays — contrast fixes adjust offending token values only, not the overall design direction.
- All changes must preserve passing of the 247-test suite (no test-coverage regressions).
- Audit `e2e/` for affected selectors before pushing (per project standing feedback).

## Tasks

- [ ] Refactor `components/GoBack.tsx` — `<a onClick>` → `<button>` with history-length fallback
- [ ] Add `@axe-core/playwright` (or vitest equivalent); write `e2e/a11y.spec.ts` covering article + homepage + case-study
- [ ] Run axe locally; identify failing color-contrast token pairs; fix in `styles/global.sass` or token sources for both light and dark themes
- [ ] Add `@next/bundle-analyzer` + `npm run analyze` script; run baseline on article route
- [ ] Identify unused JS on the article route (mermaid, visx, three.js leakage); refactor imports / tighten dynamic boundaries
- [ ] Audit article-page `<Image>` usage; add `priority` to LCP image, confirm `sizes` on all
- [ ] Inspect critical-path CSS; reduce or split `styles/global.sass` if it ships unused rules to article pages
- [ ] Profile scroll handlers; eliminate forced-reflow warnings by batching DOM reads/writes
- [ ] Re-run PSI mobile on article URL; document score delta
- [ ] Update `docs/documentation/repos/coffey-codes.md` if any architecture changed (e.g. CSS strategy)
- [ ] Audit `e2e/` for affected selectors before pushing

## Notes

- **Source PSI run**: `https://coffey.codes/articles/production-grade-ci-cd-with-nextjs-vercel-and-github-actions`, mobile, 75/100 perf at audit time on 2026-05-10.
- **Builds on**: SPEC-011 (mobile vitals foundation), SPEC-012 (homepage 3D mobile tier), SPEC-013 (GSC issues — redirects, structured data, pagination, OG hardening, image `sizes`/aspect-ratio fixes).
- **Reference docs**:
  - [PageSpeed Insights — uncrawlable link](https://developer.chrome.com/docs/lighthouse/seo/crawlable-anchors/)
  - [WCAG 2.2 contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
  - [web.dev — Reduce JavaScript payloads](https://web.dev/articles/reduce-javascript-payloads-with-code-splitting)
  - [web.dev — Avoid forced synchronous layouts](https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing)
- **Out of scope (intentional)**: site-wide redesign, accessibility audit beyond contrast (keyboard navigation, screen-reader landmarks could be a separate spec if PSI flags them), homepage performance (SPEC-012 territory).
