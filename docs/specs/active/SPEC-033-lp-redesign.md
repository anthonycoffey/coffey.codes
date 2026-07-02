---
id: SPEC-033
title: 'Landing-page redesign and copy rewrite (/lp)'
status: ready
created: 2026-07-02
author: 'Anthony Coffey'
reviewers: []
affected_repos: [coffey-codes]
---

## Reviewer Notes

<!-- Leave empty until code review. -->

---

# Feature: Landing-page redesign and copy rewrite (/lp)

## Problem

The four `/lp` ad landing pages share one dated layout (a plain hero + two-column benefits/form box + a bare Calendly link) and copy written months ago by a weaker model. They do not use the site's design system (`RetroWindow`, `Button`, `Testimonials`, `LogoGrid`, the accent/retro tokens), carry no social proof, and duplicate ~90% of their markup across four files. Before running paid ads to them, they need a modern, conversion-focused structure and sharp per-ICP copy.

## Requirements

### Must have

1. Redesign the `/lp` pages into a conversion flow: hero (promise + primary CTA + credibility) with the lead form above the fold, a benefits section, a proof section (tech `LogoGrid` + `Testimonials` + featured case studies), and a closing CTA.
2. Reuse the existing design system: `components/ui/RetroWindow`, `components/ui/Button`, `components/Testimonials`, `components/LogoGrid`, Heroicons, and the Tailwind tokens/fonts. Modernize within the current system; do not introduce a divergent visual language.
3. Extract shared, content-driven section components under `components/lp/` so each `page.tsx` composes them from a content object instead of duplicating markup.
4. Rewrite each page's copy per its ICP using [`landing-page-copywriting.md`](../../documentation/guides/marketing/landing-page-copywriting.md) and [`icp-landing-page-map.md`](../../documentation/guides/marketing/icp-landing-page-map.md), obeying the [`voice-and-style.md`](../../documentation/guides/voice-and-style.md) rules (no em-dashes, no tricolons, no AI slop, specific over general) and the Rule 6 landing-page carve-out.
5. Keep each page's `LeadForm` with its existing per-page `formName`, and keep per-page `metadata` and `JsonLd`.

### Nice to have

- Message-match hooks: each hero headline stays consistent with the ad copy in the ad-creative docs.
- A compact credibility strip (12+ years, senior engineer, Austin) near the form.

### Non-goals

- Does NOT change the `LeadForm` fields or submit behavior (SPEC-032).
- Does NOT touch the backend, tracking, or ad setup (Phase 3).
- Does NOT change the `/lp` route paths or `formName` values.

## Design

Shared section components (server components; `LeadForm` remains the only client island):

- `components/lp/LpHero.tsx` — eyebrow, H1, subhead, primary CTA (anchors to the form), a short credibility list, and the form column (a `RetroWindow` wrapping `LeadForm`).
- `components/lp/LpBenefits.tsx` — heading, intro, and an icon+title+body grid (`items` prop).
- `components/lp/LpProof.tsx` — tech `LogoGrid`, `Testimonials`, and featured case-study links (`/case-study/postgis-fleet-optimization`, `/case-study/data-driven-seo-pipeline`) + a portfolio link.
- `components/lp/LpFinalCta.tsx` — heading, body, and the Calendly `Button`.

Each `app/lp/*/page.tsx` keeps its metadata + `JsonLd`, defines a content object (eyebrow, title, subhead, benefits, form heading, final CTA), and composes the sections.

## Edge cases

- [ ] Duplicate accessible link names: the proof section adds case-study/portfolio links, so the lead-form e2e must scope its "case studies"/"portfolio" `target=_blank` assertions to the form to avoid strict-mode multiple matches.
- [ ] `LeadForm` is a client component; section wrappers stay server components and render it as a child.
- [ ] Form-in-hero makes the hero tall; acceptable for LP conversion.

## Acceptance criteria

1. All four `/lp` pages render the new sections with per-ICP copy and their correct `formName`.
2. Shared components live under `components/lp/` and are covered by at least one unit test (e.g. `LpBenefits` renders its items).
3. The lead-form e2e still passes against `/lp/practical-ai` (form submit + validation + new-tab links).
4. `npm run lint`, `typecheck`, `test:coverage`, and the lead-form e2e are green.

## Constraints

- Reuse existing components and tokens; follow TDD and the repo conventions.
- Keep coverage thresholds green.

## Tasks

- [ ] Build `components/lp/` section components.
- [ ] Migrate the four `app/lp/*/page.tsx` files with rewritten copy.
- [ ] Add a unit test for the LP components; scope the lead-form e2e link assertions.
- [ ] Run lint, typecheck, unit, e2e.

## Notes

Phase 2 of the landing-page funnel overhaul. Design direction (decided in planning): modernize within the current design system. Phase 3 (ads setup) follows separately.
