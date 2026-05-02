# SPEC-002: Case Study Web Migration

**Status:** `in-progress`  
**Author:** AI Agent (Cline)  
**Date:** 2026-05-01

## 1. Problem Statement
The current case study "PostGIS in Action" is only available as a PDF download. This is suboptimal for SEO, user experience, and accessibility. We need a dynamic web-based template that can render case studies directly in the browser, supporting different storytelling layouts and interactive data visualizations.

## 2. Requirements
- Centralized JSON-driven data source for case studies (`app/case-studies/case-studies.ts`).
- Support for two layout types:
    - `styleA`: Brief / Classic (Challenge, Solution, Impact).
    - `styleB`: Storytelling (Narrative blocks, stats, charts).
- Individual case study pages accessible via `/case-study/:slug`.
- Integration of `visx` for data visualization (charts).
- Main `/case-studies` page must link to individual web pages instead of PDF downloads.
- Compliance with Next.js 16 async params requirement.

## 3. Technical Design
- **Data Schema**:
    ```typescript
    interface CaseStudyData {
      slug: string;
      title: string;
      description: string;
      layout: 'styleA' | 'styleB';
      tags: string[];
      // ... content blocks for Style B or structured fields for Style A
    }
    ```
- **Routing**: Dynamic route `app/case-study/[slug]/page.tsx` with `generateStaticParams`.
- **Charting**: Use `@visx/visx` for custom SVG charts inside the storytelling blocks.
- **Testing**: Playwright E2E test to verify navigation and content rendering.

## 4. Implementation Plan
1. Create branch `feature/case-study-migration`.
2. Write this spec.
3. Write failing E2E test.
4. Install `@visx/*` packages.
5. Create `app/case-studies/case-studies.ts`.
6. Update `app/case-studies/page.tsx` list view.
7. Implement `app/case-study/[slug]/page.tsx` with layout rendering logic.
8. Verify tests pass.

## 5. Success Criteria
- [ ] `/case-study/postgis-fleet-optimization` renders successfully.
- [ ] Visx charts are visible and responsive on the page.
- [ ] Navigation from `/case-studies` works correctly.
- [ ] Page passes accessibility and SEO checks.
