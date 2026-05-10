---
id: SPEC-013
title: GSC Issue Remediation
status: complete
created: 2026-05-10
author: Anthony Coffey
reviewers: []
affected_repos: []
---

## Reviewer Notes

<!-- Leave empty until code review. When requesting changes, reviewer adds feedback here: -->

---

# Feature: GSC Issue Remediation

## Problem

Google Search Console is surfacing multiple issues for coffey.codes. A code audit (no GSC API access on the current Ahrefs plan) identified the most likely culprits:

1. **3-hop redirect chain** in `next.config.js` (`/articles/console-log-nested-object-in-javascript` → ... → `/articles`) — produces "Page with redirect" entries in GSC's "Why pages aren't indexed" report and wastes link equity.
2. **Article structured-data warning**: `BlogPosting.publisher` is typed as `Person`. Google's Article rich-results require `Organization` with a `logo` (`ImageObject`). The current shape produces warnings in GSC's Article enhancement report.
3. **CLS risk** on Testimonials carousel (variable card height during autoplay), `LogoGrid`, and portfolio thumbnails (missing `sizes`, no aspect-ratio reservation).
4. **Bundle bloat**: `motion` is in `package.json` but unused in source (codebase imports `framer-motion` and `gsap`). Removing it shaves ~80 KiB off every route.
5. **Sitemap pagination**: `/articles?page=2…` and category/tag pagination are crawlable but not declared, which can show as "Crawled - currently not indexed."
6. **OG endpoint hardening**: `app/og/route.tsx` lacks input validation; long titles can break the 1200×630 layout, producing fetch errors in GSC.
7. **OG image fallbacks**: portfolio, contact, LP, and taxonomy pages fall back to the generic root OG image (not a GSC error, but weak social signal).

Out of scope (handled elsewhere): homepage CWV (LCP/INP from 3D scene) — covered by SPEC-012. Article search page is already `noindex`.

## Requirements

### Must have

1. WHEN a request hits a deprecated article URL listed in `next.config.js`, the system SHALL redirect to the final destination in **one** 308 hop (no chained redirects).
2. WHEN an article page is rendered, the emitted `BlogPosting` JSON-LD SHALL include a `publisher` of type `Organization` with `name: 'coffey.codes'` and a `logo.url` pointing to a raster brand mark.
3. WHEN the Testimonials carousel autoplays, the visible card SHALL maintain a fixed minimum height so transitioning entries do not shift surrounding layout (CLS = 0 for the autoplay cycle).
4. WHEN the homepage and portfolio pages render `<Image>` components in `LogoGrid` and the portfolio thumbnail/modal grids, those images SHALL declare `sizes` and the wrapping container SHALL reserve aspect-ratio space.
5. ~~WHEN `npm run build` runs, the bundle SHALL not include the `motion` package (removed from `package.json`).~~ — **NOT VIABLE**, see Design > Remove `motion` section. The `motion` package is the renamed `framer-motion` and is actually used.
6. WHEN a user requests `/articles?page=2` (or any paginated category/tag URL), the page SHALL emit `<meta name="robots" content="noindex, follow">`.
7. WHEN `/og?title=<long-string>` is requested, the endpoint SHALL truncate the title to a safe length and SHALL NOT return a 500.

### Nice to have

- `dateModified` on `BlogPosting` derived from MDX file `mtime` (currently equals `datePublished`).
- Per-page `openGraph.images` for portfolio, contact, LP pages, and taxonomy hubs (instead of falling back to root `/og-image.jpg`).
- Add `sameAs` to the new `Organization` publisher (linking GitHub/LinkedIn at the brand level).

### Non-goals (what this does NOT do)

- This spec does NOT optimize homepage Core Web Vitals — covered by SPEC-012.
- This spec does NOT change the search page (`/articles/search`) which is already correctly `noindex`.
- This spec does NOT migrate from the Person schema in `app/layout.tsx` — that stays as-is to represent Anthony as an entity, separate from the publishing brand.
- This spec does NOT introduce paginated sitemap entries (Option A: `noindex` paginated views, rather than declaring them).

## Design

### Redirect flattening — `next.config.js`

Rewrite `redirects()` so every entry resolves in one hop:

| Source | Current target | New target |
|---|---|---|
| `/articles/console-log-nested-object-in-javascript` | `/articles/unveiling-nested-objects-...` (chain) | `/articles` |
| `/articles/unveiling-nested-objects-enhanced-console-logging-node-js` | `/articles/logging-deep-nested-objects-in-nodejs` (chain) | `/articles` |
| `/articles/gradient-background-for-post-thumbnails` | `/articles/using-css-gradients-...` (chain) | `/articles` |
| All other entries | already 1-hop | unchanged |

`/articles/avoiding-unnecessary-re-renders-in-react-apps` → `/articles/preventing-unnecessary-re-renders-in-react-apps` is verified as a single hop to a live MDX post; keep as-is.

### Publisher Organization schema

Replace the `publisher: { '@type': 'Person', ... }` block in `app/(site)/articles/[slug]/page.tsx` (~line 94) with:

```ts
publisher: {
  '@type': 'Organization',
  name: 'coffey.codes',
  url: baseUrl,
  logo: {
    '@type': 'ImageObject',
    url: `${baseUrl}/publisher-logo.png`,
    width: 601,
    height: 601,
  },
}
```

Apply the same shape to `app/(site)/case-study/[slug]/page.tsx` if it has a comparable JSON-LD block.

**Logo asset**: `public/publisher-logo.png` — square 601×601 PNG (40.7 KB), fully opaque, cyan logomark on `#231F20` near-black background. Square aspect is the most flexible across Google's rich-result surfaces. PNG over SVG because Google's Article rich-result support for SVG logos is occasionally inconsistent. Dark-card-on-white-SERP is a deliberate design choice and aligns with the site's overall brand presentation.

**Asset status**: final logomark in place. Verified opaque (no transparency artifacts on white SERP) and within Google's 1:1–10:1 aspect-ratio range.

### CLS fixes

- `components/Testimonials.tsx` — set a `min-height` on the testimonial card (e.g. `min-h-[180px] md:min-h-[140px]`) sized to the longest realistic testimonial.
- `components/LogoGrid.tsx` — add `sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"` to the logo `<Image>`s.
- `app/(site)/portfolio/page.tsx` — add `sizes` to thumbnail and modal images; wrap thumbnails in an `aspect-[16/9]` (or matching) container.

### Pagination noindex

In each list page's `generateMetadata`, return `{ robots: { index: false, follow: true } }` when `searchParams.page` is set:
- `app/(site)/articles/page.tsx`
- `app/(site)/articles/category/[category]/page.tsx`
- `app/(site)/articles/tag/[tag]/page.tsx`

### `/og` route hardening — `app/og/route.tsx`

- Slice `title` to `120` chars max.
- Wrap `ImageResponse` construction in `try/catch`; on error return a fixed fallback image (e.g. the static `/og-image.jpg`) rather than a 500.

### ~~Remove `motion`~~ (REVERTED — was a false positive)

Initially planned to remove the `motion` package from `package.json` based on the audit's claim that no source file imports `from 'motion'`. **This is true literally but misleading** — the `motion` package (v12+) is the renamed `framer-motion`, and provides both `motion` and `framer-motion` module paths for backwards compatibility. The codebase imports `from 'framer-motion'` in 3+ components (`AnimatedSection`, `LogoGrid`, `Testimonials`), and those resolve through the `motion` package.

Build fails (`Cannot find module 'framer-motion'`) when `motion` is removed. Removal would require migrating all imports from `'framer-motion'` to `'motion/react'` per the [motion migration guide](https://motion.dev/docs/migrate-from-framer-motion). Out of scope for this spec — track separately if revisited.

## Edge cases

- [ ] If Google has not recrawled an old article URL since redirect flattening, "Page with redirect" entries persist in GSC for 1–2 weeks — request reindex on `/articles` to nudge.
- [x] `publisher-logo.png` must use a non-transparent background that reads on Google's white SERP card — verified opaque (`#231F20` solid background, no alpha leakage).
- [ ] `noindex` on paginated views is `noindex, follow` (not `noindex, nofollow`) so link equity continues to flow to article pages.
- [ ] Testimonials `min-height` must accommodate the longest testimonial in the source data; verify by setting a tall placeholder during dev.
- [ ] If `case-study/[slug]/page.tsx` does **not** have its own `BlogPosting`/`Article` JSON-LD, skip the publisher fix there (no warning to suppress).

## Acceptance criteria

1. `curl -sIL http://localhost:3000/articles/console-log-nested-object-in-javascript` shows exactly one 308 hop to `/articles` (and same for the gradient URL).
2. Pasting a rendered article page's HTML into the Rich Results Test shows "Article" detected with **no** `publisher` warning, and BreadcrumbList still passes.
3. Chrome DevTools Performance recording on `/` (mobile emulation) shows CLS = 0 across a full Testimonials autoplay cycle and a `/portfolio` modal open/close.
4. `.next/analyze` (or first-load JS in build output) shows a measurable drop versus `main` after `motion` removal.
5. `/sitemap.xml` contains no `?page=` URLs; visiting `/articles?page=2` shows `<meta name="robots" content="noindex, follow">` in the rendered HTML.
6. `curl "http://localhost:3000/og?title=$(printf 'x%.0s' {1..500})"` returns HTTP 200 with a valid PNG.
7. Two weeks post-deploy: GSC's "Why pages aren't indexed" report shows fewer "Page with redirect" entries; the Article enhancement report shows zero `publisher` warnings on newly recrawled articles.

## Constraints

- Single PR, branch `fix/gsc-issue-remediation`, per the project's PR scoping convention (small related changes folded together; spec ID is bookkeeping, the PR is the review unit).
- No new dependencies.
- `npm run lint` and `npm run build` must pass; existing Playwright e2e (per `e2e/`) must pass — review e2e selectors for Testimonials, LogoGrid, and Portfolio modal before pushing in case fixed-height containers or aspect-ratio wrappers invalidate them.

## Tasks

- [ ] Flatten redirect chains in `next.config.js`
- [x] Add final `public/publisher-logo.png` (601×601, opaque, logomark on dark background)
- [ ] Update `publisher` to `Organization` in `app/(site)/articles/[slug]/page.tsx`
- [ ] Apply same publisher fix in `app/(site)/case-study/[slug]/page.tsx` if applicable
- [ ] Add `min-height` to `components/Testimonials.tsx` cards
- [ ] Add `sizes` to `<Image>`s in `components/LogoGrid.tsx`
- [ ] Add `sizes` + aspect-ratio wrapper to `app/(site)/portfolio/page.tsx`
- [ ] Add `noindex, follow` to paginated list pages (`articles`, `category/[category]`, `tag/[tag]`)
- [ ] Harden `app/og/route.tsx` (title length guard + try/catch fallback)
- [~] ~~Remove `motion` from `package.json`~~ — reverted; package is the renamed `framer-motion` and is actually used
- [ ] (Nice-to-have) Add per-page `openGraph.images` to portfolio/contact/LP/taxonomy pages
- [ ] (Nice-to-have) Add `dateModified` to `BlogPosting` JSON-LD
- [x] Audit `e2e/` for affected selectors before pushing — clean (no e2e tests touched the affected components/files)
- [x] Add retroactive test coverage (RED→GREEN verified for redirect topology, publisher schema, /og truncation):
  - `__tests__/config/redirects.test.ts` — guards against future redirect chains; asserts all redirects are 308
  - `__tests__/articles/slug-page.test.tsx` — asserts BlogPosting publisher is Organization with logo
  - `__tests__/case-studies/slug-page.test.tsx` — asserts case-study Article publisher is Organization with logo
  - `__tests__/og/route.test.ts` — asserts default title, title param honoured, 120-char truncation, fallback redirect on error
  - `__tests__/components/LogoGrid.test.tsx` — asserts every Image has a `sizes` attr and explicit dimensions
  - `__tests__/components/Testimonials.test.tsx` — asserts CLS-reservation `min-h-[Npx]` is set on slide wrapper at both mobile and md+
  - `__tests__/portfolio/page.test.tsx` (new "CWV image hygiene" suite) — asserts polaroid thumbs have `sizes`, modal main image has aspect-ratio wrapper, modal thumbs have `sizes`
  - `__tests__/articles/pagination-noindex.test.ts` — asserts `?page=2+` returns `robots: { index: false, follow: true }` for /articles, /articles/category/[c], /articles/tag/[t]
- [ ] Run Rich Results Test on a deployed article URL post-merge
- [ ] Request reindex on `/articles` in GSC after deploy

## Notes

- **Plan source**: `C:\Users\coffe\.claude\plans\i-checked-my-site-greedy-cloud.md` (audit + decisions)
- **Related specs**:
  - SPEC-011 (mobile Core Web Vitals) — already merged; this spec builds on its perf foundation
  - SPEC-012 (homepage 3D mobile tier) — pending; will address the remaining homepage CWV; do **not** duplicate that work here
- **Reference docs**:
  - `docs/documentation/deep-dives/onpage-seo-strategy.md` — title/description strategy already implemented
  - [Google Article rich-results requirements](https://developers.google.com/search/docs/appearance/structured-data/article)
  - [Google Article logo guidelines](https://developers.google.com/search/docs/appearance/structured-data/article#logo-guidelines)
- **GSC data source**: code audit only; Ahrefs MCP is gated to the $129/mo plan and the user is on a lower tier. If/when GSC API access is available, validate findings against the actual report.
