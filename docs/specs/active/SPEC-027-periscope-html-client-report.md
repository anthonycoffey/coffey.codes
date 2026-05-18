---
id: SPEC-027
title: 'Periscope HTML client-report deliverable'
status: draft
created: 2026-05-17
author: Anthony Coffey
reviewers: []
affected_repos: [periscope, coffey.codes]
---

## Reviewer Notes

<!-- Leave empty until code review. -->

---

# Feature: HTML report variant for client-facing deliverables

## Problem

Periscope's markdown outputs are excellent for machines (LLMs, diffs, git history) and for technical operators. They are not what you hand a client at month-end. A client wants a polished, branded, single-file HTML document they can open in a browser, scroll, and share with their team.

This SPEC adds an HTML rendering layer that consumes the existing markdown reports and produces a styled, self-contained HTML deliverable. Markdown stays canonical; HTML is a derivative.

## Requirements

### Must have

1. WHEN `periscope report <markdown-file>` runs, it SHALL produce `<basename>.html` next to the input, rendering the markdown with: client logo, brand colors, table styling, badge styling for verdicts, embedded fonts (no external CDN dependencies), and a print-friendly stylesheet.
2. WHEN `--all` is passed, the command SHALL render every `.md` in `<outputDir>` to `.html`.
3. The HTML SHALL be a single self-contained file (CSS inline, no JS unless explicitly needed for charts, fonts base64-embedded or web-safe fallback).
4. Per-property brand customization (logo path, primary color, font choice) SHALL come from the multi-property config introduced in SPEC-024.
5. Verdict badges (`STRIKING_DISTANCE`, `CANNIBALIZATION`, `TITLE_QUERY_DRIFT`, `WELL_TARGETED`, `GHOST`) SHALL render as colored pill badges matching their conceptual severity.

### Nice to have

- Inline SVG sparklines for movement reports (no JS library — pure SVG paths).
- PDF export via headless chromium (`@sparticuz/chromium` on vercel-style envs, or `puppeteer` locally).
- Auto-generated table of contents for long reports.

### Non-goals

- Not a dashboard. Static documents only.
- No interactive widgets, no client-side data fetching, no analytics tracking.

## Design

Use `remark` + `rehype` pipeline (already a Next.js-adjacent ecosystem in coffey.codes):
- `remark-parse` → `remark-rehype` → `rehype-stringify`
- Custom rehype plugin to wrap verdict-token strings (e.g. `**WELL_TARGETED**`) in styled `<span class="badge badge-ok">` elements.
- CSS inlined via `juice` or hand-written to a `<style>` block.

Critical files:
- `src/commands/report.ts` (new) — entry point.
- `src/lib/render-html.ts` (new) — markdown → HTML transformer + style injection.
- `src/assets/report-styles.css` (new) — bundled at build time as a string constant.
- `src/cli.ts` — register `report` subcommand.
- Per-property config (SPEC-024) gains `branding: { logoPath, primaryColor, fontFamily }`.

## Acceptance criteria

1. `periscope report docs/strategy/data/keyword-audit-articles-2026-05-18.md` produces a styled, self-contained HTML file viewable offline.
2. Opening the HTML file in a browser shows verdict badges, properly styled tables, and the configured client brand.
3. Print preview (Cmd+P) shows a print-friendly layout (no unnecessary chrome, page breaks respected).
4. `periscope report --all` renders every markdown in `outputDir`.
5. Unit tests on the rendering pipeline verify badge classification, table styling, and self-containment (no external network references in output).

## Constraints

- Single-file output (no separate CSS/JS files).
- No external CDN dependencies at runtime (must work offline).
- HTML output must validate against W3C HTML5.

## Tasks

- [ ] Set up remark/rehype pipeline.
- [ ] Author the report stylesheet (bundle as string).
- [ ] Implement badge-wrapping rehype plugin.
- [ ] Per-property branding config (depends on SPEC-024 multi-property shape).
- [ ] `report` command + CLI registration.
- [ ] Tests on rendering correctness + self-containment.
- [ ] PDF export (nice-to-have) gated behind `--pdf` flag.

## Notes

The deliverable conversation is closely tied to the $100/mo question. A client paying $100/mo expects something they can show their CEO. Markdown is not that thing; styled HTML is. PDF is the natural follow-up but isn't on the critical path.
