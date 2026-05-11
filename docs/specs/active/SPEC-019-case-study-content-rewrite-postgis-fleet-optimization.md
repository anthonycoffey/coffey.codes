---
id: SPEC-019
title: 'Case Study Content Rewrite: PostGIS Fleet Optimization'
status: ready
created: 2026-05-14
author: Anthony Coffey
reviewers: []
affected_repos: [coffey.codes]
---

## Reviewer Notes

<!-- Leave empty until code review. When requesting changes, reviewer adds feedback here: -->

---

# Feature: Case Study Content Rewrite: PostGIS Fleet Optimization

## Problem

The existing PostGIS fleet optimization case study was migrated from PDF to web in SPEC-002 but the narrative content is weak. It does not accurately represent the scope of the engagement — specifically, the client had **zero location intelligence capability** before this project. The current copy undersells the work and would not hold up to scrutiny from a technical buyer (CTO, VP Eng).

## Requirements

- Rewrite the case study narrative in `app/(site)/case-studies/case-studies.ts` for the `postgis-fleet-optimization` slug.
- The "before" state must accurately reflect that **no location-querying capability existed** prior to this engagement — not a performance problem, a capability gap.
- Highlight the architectural decisions made: `GEOGRAPHY` data type (chosen over `GEOMETRY` for earth-curvature correctness), `GIST` indexing, and nearest-technician spatial queries resolved at the database layer.
- Replace existing stats and chart blocks with capability-score visuals (0–5 self-audit, before vs after) — no performance numbers claimed.
- Remove the "Data Migration & Backward Compatibility" text block; final narrative is Challenge → Solution → Impact.
- Remove the PDF download CTA from the case study page. The original PDF predates the web version and the web narrative is now the canonical artifact; a download button competes with the on-page content and adds maintenance surface for a stale asset.
- Tone: senior engineer's voice. Specific, decision-oriented. No vague outcomes.
- No fake metrics. Specificity of technical decisions and capability scores carries the credibility.

## Design

### Content changes (narrative only — no schema or layout changes)

**Story block sequence (final):**

1. `text` — "The Challenge"
2. `text` — "The Solution"
3. `stats` — architecture decisions fact sheet
4. `chart` — capability score: before
5. `chart` — capability score: after
6. `text` — "The Impact"

(Removed: the existing "Data Migration & Backward Compatibility" text block.)

**The Challenge:**
> The client's dispatch system had no ability to match technicians to jobs by location. Assignment logic was manual or proximity-blind.

**The Solution:**
> Designed and implemented a PostGIS spatial layer from scratch. Selected the `GEOGRAPHY` data type over `GEOMETRY` to handle earth-curvature math natively without managing projections. Added `GIST` indexes on technician and job location columns. Nearest-technician lookups — previously impossible — now resolve in a single indexed spatial query.

**Stats block (architecture decisions):**
- Data type: `GEOGRAPHY`
- Spatial index: `GIST`
- Projection management: none required
- Nearest-tech query: single indexed SQL

**Capability score charts (0–5 scale, before vs after):**

Dimensions to score (5–7 total; final list during implementation):
- Geospatial query support
- Nearest-technician lookup
- Earth-curvature correctness
- Index-backed proximity search
- Geocoded job sites
- Dispatcher cognitive load (inverted: lower is better)

Before: all dimensions near 0. After: all dimensions at 4–5.

**The Impact:**
> Delivered a capability the system never had. Dispatch can now query available technicians by proximity to any geocoded job site in real time.

### Files touched

- `app/(site)/case-studies/case-studies.ts` — `story` array entries for `postgis-fleet-optimization`; remove the `pdfPath` field and the `pdfPath?: string` member of `CaseStudyData`
- `app/(site)/case-study/[slug]/page.tsx` — drop the `CaseStudyPdfCta` import and conditional render
- `components/CaseStudyPdfCta.tsx` — deleted (no other consumers)
- `public/case-studies/` — deleted, including the PostGIS PDF asset
- `__tests__/case-studies/slug-page.test.tsx` — drop the `CaseStudyPdfCta` vi.mock
- `e2e/case-studies.spec.ts` — drop the PDF CTA assertion; update the Challenge-text assertion to match the new copy
- No layout, schema, or other component changes required.

## Tasks

- [x] Rewrite the three text blocks (Challenge, Solution, Impact) in `case-studies.ts` per design above
- [x] Remove the "Data Migration & Backward Compatibility" text block
- [x] Replace stats block content with architecture-decisions fact sheet
- [x] Replace both chart blocks with capability-score (0–5) before/after data
- [x] Remove the PDF download CTA: drop `pdfPath` field + interface member, delete `components/CaseStudyPdfCta.tsx`, delete `public/case-studies/` (and PDF asset), drop the related vi.mock and e2e assertion
- [x] Update the e2e Challenge-text assertion to match the new copy
- [ ] Verify `/case-study/postgis-fleet-optimization` renders correctly in dev
- [ ] Spot-check mobile layout — no truncation issues on stats/charts
- [ ] Move spec to `docs/specs/archive/` when merged

## Out of scope

- Performance metrics or quantitative outcomes (none available; capability scores stand in)
- Layout or component changes
- Other case studies
- Updates to `description` field unless rewrite reveals it's misleading
