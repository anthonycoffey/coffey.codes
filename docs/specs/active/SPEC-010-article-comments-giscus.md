---
id: SPEC-010
title: 'Add Giscus comments to articles'
status: review-pending
created: 2026-04-29
author: 'Anthony Coffey'
reviewers: []
affected_repos: ['coffey.codes']
---

## Reviewer Notes

<!-- Leave empty until code review. When requesting changes, reviewer adds feedback here: -->

---

# Feature: Add Giscus comments to articles

## Problem

Articles on coffey.codes are read-only. Readers have no in-page way to ask questions, point out errors, or react to a post — the only feedback channels are off-site (email, social). This blocks low-friction engagement and means corrections from readers rarely make it back to the author.

A comments system creates a feedback channel directly on the article page. Giscus is the chosen provider because it is backed by GitHub Discussions (the target audience is largely developers who are already authenticated with GitHub), uses no third-party cookies (so it does not need to be gated behind the existing `ConsentManager`), supports dark/light theme switching to match the site's `next-themes` setup, and is free.

## Requirements

### Must have

1. WHEN a reader visits any article page (`app/articles/[slug]`), the system SHALL render a Giscus comments widget below the article body and above the "Go back" link.
2. WHEN the site theme changes (light ↔ dark via `next-themes`), the Giscus widget SHALL update its theme to match without a page reload.
3. WHEN a reader posts a comment via Giscus, it SHALL appear as a reply in the corresponding GitHub Discussion thread for that article on the `anthonycoffey/coffey.codes` repository.
4. The widget SHALL load lazily (after article content) so it does not block LCP for the article body.

### Nice to have

- Map each article slug → a stable Discussion title via `data-mapping="pathname"` so URL changes do not orphan comment threads.
- Support a feature flag via env var (`NEXT_PUBLIC_GISCUS_ENABLED`) so comments can be disabled site-wide without a code change.

### Non-goals (what this does NOT do)

- This spec does NOT add comments to non-article pages (landing pages, the home page, project pages, etc.).
- This spec does NOT add a per-post `comments: false` frontmatter toggle. Decision: every article gets comments.
- This spec does NOT extend the existing `ConsentManager` — Giscus uses no third-party cookies.
- This spec does NOT migrate any existing comments (there are none).
- This spec does NOT cover comment moderation tooling beyond what GitHub Discussions provides natively.

## Design

### New files

- **`components/Comments.tsx`** — `'use client'` component. Wraps the official `@giscus/react` `<Giscus />` component. Reads the active theme from `next-themes` via `useTheme()` and passes `theme="light" | "dark"`. Reads `data-repo`, `data-repo-id`, and `data-category-id` from `NEXT_PUBLIC_GISCUS_*` env vars. If env vars are missing, returns `null` (with a dev-only `console.warn`). Mapping: `data-mapping="pathname"`. Reactions enabled, input position `bottom`, lang `en`.
- **`e2e/comments.spec.ts`** — Playwright spec asserting the Giscus iframe (`iframe.giscus-frame`) appears on an article page after content loads. RED phase per TDD.

### Modified files

- **`app/articles/[slug]/page.tsx`** — render `<Comments />` between the closing `</article>` (~line 212) and `<GoBack />`. Parent stays a Server Component; `Comments` is the client boundary.

### Configuration (out of band)

1. Enable GitHub Discussions on `anthonycoffey/coffey.codes`.
2. Install the Giscus GitHub App on the repo.
3. Use https://giscus.app to generate `data-repo-id` and `data-category-id` for the chosen Discussion category (e.g. "Comments").
4. Store as Vercel environment variables (Production + Preview):
   - `NEXT_PUBLIC_GISCUS_REPO=anthonycoffey/coffey.codes`
   - `NEXT_PUBLIC_GISCUS_REPO_ID=<from giscus.app>`
   - `NEXT_PUBLIC_GISCUS_CATEGORY=Comments`
   - `NEXT_PUBLIC_GISCUS_CATEGORY_ID=<from giscus.app>`

### Library choice

Use `@giscus/react` (the official React wrapper). It handles SSR safety and reactive theme/lang props out of the box. The hand-rolled `<script>` approach is rejected because re-theming requires posting a message to the iframe — the wrapper already does this.

## Edge cases

- [ ] Theme toggled mid-page → wrapper re-themes the iframe via `postMessage` (no reload).
- [ ] First paint before `next-themes` hydrates → fall back to `theme="light"`; accept a single re-theme flicker after hydration.
- [ ] GitHub Discussions API unavailable → Giscus renders its own error state. No app-level handling needed.
- [ ] Env vars missing → `<Comments />` returns `null`; in dev, log a `console.warn` once.
- [ ] Article slug renamed → the previous Discussion thread is orphaned (acceptable; renames are rare).

## Acceptance criteria

1. Visiting any `/articles/<slug>` URL renders a Giscus iframe below the article body and above the "Go back" link.
2. Authenticating with GitHub via the Giscus widget and posting a comment creates a reply in the matching Discussion on `anthonycoffey/coffey.codes`. The reply is visible in the embed without page reload.
3. Toggling the OS/system theme (which `next-themes` mirrors) updates the Giscus iframe theme within ~1s without a page reload.
4. Lighthouse performance score on an article page does not regress by more than 3 points compared to the score immediately before this change.
5. The Playwright e2e spec for comments passes locally and in CI; existing unit/integration suites stay green.

## Constraints

- Must not modify or extend `components/ConsentManager.tsx` — Giscus is cookieless.
- Must not block article LCP. The widget loads after main content.
- Must remain compatible with Next.js 16 App Router, React 19, and `next-themes`.
- Must not add any new third-party cookies. (Giscus stores no cookies; GitHub auth happens in a popup on github.com.)

## Tasks

Following the RED → GREEN → REFACTOR cycle:

- [ ] **RED** — Add `e2e/comments.spec.ts` asserting the Giscus iframe renders on a known article slug. Confirm it fails.
- [ ] **GREEN** — Add the `@giscus/react` dependency.
- [ ] **GREEN** — Implement `components/Comments.tsx` with `useTheme()` integration and env-var reads.
- [ ] **GREEN** — Render `<Comments />` in `app/articles/[slug]/page.tsx` after the article body.
- [ ] **GREEN** — Configure GitHub Discussions + install Giscus app + set Vercel env vars.
- [ ] **GREEN** — Verify the e2e spec passes locally and in CI.
- [ ] **REFACTOR** — Extract any duplication; confirm no `ConsentManager` regressions; check Lighthouse delta.
- [ ] **DOCS** — Add a one-line note in `docs/documentation/repos/coffey-codes.md` describing the Comments component.
- [ ] **STATUS** — Move spec `draft` → `ready` once approved, then `in-progress` when work starts.

## Notes

- Giscus configuration UI: https://giscus.app
- React wrapper: https://github.com/giscus/giscus-component
- Article page entry: `app/articles/[slug]/page.tsx` — `<Comments />` slots in directly after the closing `</article>` tag (~line 212), before `<GoBack />`.
- MDX registry (`components/mdx.tsx`) is **not** modified; comments are not an MDX-embeddable component.
- The existing `components/ConsentManager.tsx` is untouched. It only governs Google Analytics consent.
