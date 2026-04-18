---
id: SPEC-004
title: "Articles & Taxonomy Test Coverage"
status: review-pending
created: 2026-04-18
author: "Anthony Coffey"
reviewers: []
affected_repos: []
---

## Reviewer Notes

<!-- Leave empty until code review. When requesting changes, reviewer adds feedback here: -->

---

# Feature: Articles & Taxonomy Test Coverage

## Problem

The articles system (blog index, tag/category filtering, search, pagination, date formatting, MDX utils) has no unit tests. Regressions in any of these areas would be silent — a broken tag filter, incorrect pagination math, or a malformed date would only be caught manually or in production.

This spec establishes a regression-prevention test suite for all article and taxonomy logic, using the same Vitest + Testing Library stack established in SPEC-003.

## Requirements

### Must have

1. WHEN `utils/date.ts` is called, the system SHALL return correctly formatted absolute dates and relative time strings across all boundary cases.
2. WHEN `app/articles/utils.ts` utility functions are called, the system SHALL correctly parse frontmatter, filter posts by tag/category (case-insensitively), sort by date descending, paginate results, and deduplicate tags/categories.
3. WHEN `app/api/search/route.ts` receives a GET request, the system SHALL search across title, summary, content, tags, and category fields (case-insensitive), return an empty array for missing query params, and return a 500 on error.
4. WHEN `hooks/usePagination.ts` is rendered, the system SHALL correctly compute pagination state, enforce page boundaries, sync page number to/from URL search params, and delete the `?page` param when returning to page 1.
5. WHEN `app/articles/search/page.tsx` mounts, the system SHALL parse the `?q` URL param, call the search API with the encoded query, paginate results client-side, and respond to the custom `search-query-updated` event.
6. WHEN `app/articles/page.tsx` renders, the system SHALL pass the correct page number from searchParams and correctly populate tag and category sidebar data.
7. WHEN `app/articles/tag/[tag]/page.tsx` and `app/articles/category/[category]/page.tsx` render, the system SHALL decode URL params, apply case-insensitive filtering, call `notFound()` when no posts match, and exclude the active tag/category from the sidebar list.

### Nice to have

- Snapshot tests for `app/articles/layout.tsx`, `app/articles/tags/page.tsx`, and `app/articles/categories/page.tsx` to catch unintended markup changes.
- Integration-style test that renders the full articles index page with mock data and asserts rendered post titles appear in the DOM.

### Non-goals (what this does NOT do)

- This spec does NOT add tests for MDX rendering itself (that is the responsibility of `next-mdx-remote`).
- This spec does NOT test Vercel deployment or network-layer behavior.
- This spec does NOT add tests for `app/articles/[slug]/page.tsx` rendering (MDX content output).

## Design

### Test framework & conventions

Two complementary layers:

| Layer | Framework | Runs against | Location |
|---|---|---|---|
| Unit / integration | Vitest v4 + jsdom | Mocked modules | `__tests__/` |
| E2E | Playwright v1.59 | Live dev server | `e2e/` |

- **Unit mocking:** `vi.mock()` for `fs`, `path`, `next/navigation`, `next/headers`
- **File naming (unit):** `__tests__/<area>/<filename>.test.ts[x]`
- **File naming (E2E):** `e2e/articles.spec.ts`
- **Pattern:** `describe` → `it` / `test` → `expect` (matches existing test files)

### Test file layout

```
__tests__/
  utils/
    date.test.ts
  articles/
    utils.test.ts
    page.test.tsx
    layout.test.tsx
    tags-page.test.tsx
    categories-page.test.tsx
    tag-page.test.tsx
    category-page.test.tsx
    search-page.test.tsx
  hooks/
    usePagination.test.tsx
  api/
    search.test.ts

e2e/
  articles.spec.ts       ← NEW
```

### Mocking strategy for server components / file I/O

`app/articles/utils.ts` reads from the filesystem (`fs.readdirSync`, `fs.readFileSync`). Tests must mock `fs` and `path` to inject controlled fixture data (a small set of synthetic `.mdx` files with known frontmatter). This keeps tests hermetic and fast.

Next.js server-component dependencies (`next/navigation`, `next/headers`, `notFound`) must be mocked via `vi.mock()`.

### Key test cases per file

#### `utils/date.ts`
- Returns correctly formatted absolute date string
- Appends `T00:00:00` when no time component is present
- Returns "Today" for same-day dates (when `includeRelative=true`)
- Returns "Xd ago" for recent past dates
- Returns "Xmo ago" for dates ~1–11 months back
- Returns "Xy ago" for dates ≥ 1 year back
- Does not append relative string when `includeRelative=false` (default)

#### `app/articles/utils.ts`
- `parseFrontmatter`: parses valid frontmatter, throws on missing required fields, strips surrounding quotes
- `getAllBlogPosts`: returns all posts sorted by `publishedAt` descending
- `getPaginatedBlogPosts`: returns correct slice for page 1, 2, N; computes `totalPages` correctly; handles `page < 1` and `page > totalPages` gracefully
- `getPaginatedBlogPostsByTag`: filters case-insensitively; returns empty array when no match
- `getPaginatedBlogPostsByCategory`: filters case-insensitively; returns empty array when no match
- `getAllTags`: returns deduplicated, sorted tag list
- `getAllCategories`: returns deduplicated, sorted category list
- `capitalizeWords`: capitalizes first letter of each word; handles empty string, single word, multiple spaces

#### `app/api/search/route.ts`
- Returns `[]` when `?q` param is absent
- Returns `[]` when query matches nothing
- Matches on `title` field (case-insensitive)
- Matches on `summary` field (case-insensitive)
- Matches on `tags` field (case-insensitive)
- Matches on `category` field (case-insensitive)
- Returns 500 status when `getAllBlogPosts` throws

#### `hooks/usePagination.ts`
- Defaults to page 1 when no `?page` param is present
- Reads initial page from `?page` search param
- Clamps invalid page numbers to valid range
- `isFirstPage` is `true` when on page 1, `false` otherwise
- `hasNextPage` is `false` on the last page, `true` otherwise
- `setPage` removes `?page` param when navigating to page 1
- `setPage` sets `?page=N` when navigating to page N > 1

#### `app/articles/search/page.tsx`
- Parses `?q` param from URL on mount and triggers API call
- Renders loading state during fetch
- Renders "no results" message when API returns empty array
- Renders result list when API returns matches
- Paginates results (5 per page) correctly
- Responds to custom `search-query-updated` event and re-fetches
- Cleans up event listener on unmount

#### `app/articles/page.tsx`
- Passes `page=1` when searchParams has no `?page`
- Passes correct page number when `?page=3`
- Renders category list in sidebar
- Renders at most 24 tags in sidebar

#### `app/articles/tag/[tag]/page.tsx`
- Decodes URL-encoded tag param (`%20` → space)
- Calls `notFound()` when no posts match the tag
- Excludes the active tag from the "Popular Tags" sidebar list

#### `app/articles/category/[category]/page.tsx`
- Decodes URL-encoded category param
- Calls `notFound()` when no posts match the category
- Excludes the active category from the "Other Categories" sidebar list

## Edge cases

- [ ] `date.ts`: future dates (relative time returns positive number — define expected behavior)
- [ ] `utils.ts`: MDX file with no frontmatter separator (`---`) throws a clear error
- [ ] `usePagination.ts`: `totalPages=0` does not produce division-by-zero or invalid state
- [ ] `search/page.tsx`: network error during fetch sets error state without crashing
- [ ] `api/search/route.ts`: query with special regex characters does not throw

## Acceptance criteria

1. All test files pass with `npm test` (zero failures).
2. `utils/date.ts` has ≥ 90% branch coverage.
3. `app/articles/utils.ts` has ≥ 90% branch coverage.
4. `app/api/search/route.ts` has ≥ 90% branch coverage.
5. `hooks/usePagination.ts` has ≥ 80% branch coverage.
6. `app/articles/search/page.tsx` covers loading, results, no-results, and event-listener states.
7. Tag and category page tests assert that `notFound()` is called for unmatched params.
8. `e2e/articles.spec.ts` passes in Chromium and Firefox against the dev server.
9. No existing tests are broken by this work.

### E2E test cases — `e2e/articles.spec.ts`

The E2E suite exercises the live articles routes end-to-end in a real browser (Chromium + Firefox per existing `playwright.config.ts`). Two focused scenarios:

**Articles index loads and paginates**
- Navigate to `/articles`
- Assert the page heading is visible
- Assert at least one article card is rendered
- If a pagination control is visible, click "Next" and assert the URL contains `?page=2` and a new set of articles is shown

**Tag filter returns relevant results**
- Navigate to `/articles/tags`
- Click the first tag chip
- Assert the URL matches `/articles/tag/<tag>`
- Assert at least one article card is rendered
- Assert none of the rendered cards display a tag that contradicts the active tag (i.e., the active tag appears on each card's tag list)

These two scenarios cover the critical happy paths without over-specifying UI markup.

## Constraints

- Unit/integration tests must use Vitest + Testing Library; no new test frameworks.
- E2E tests must use the existing Playwright config (`playwright.config.ts`) and live under `e2e/`.
- Server component pages must be tested by mocking `fs`, `path`, and `next/*` modules in unit tests — not by spinning up a Next.js server.
- Fixture MDX frontmatter must be inlined in unit test files (no external fixture files).

## Tasks

- [ ] Write `__tests__/utils/date.test.ts`
- [ ] Write `__tests__/articles/utils.test.ts` (mock `fs`/`path`)
- [ ] Write `__tests__/api/search.test.ts` (mock `getAllBlogPosts`)
- [ ] Write `__tests__/hooks/usePagination.test.tsx` (mock `next/navigation`)
- [ ] Write `__tests__/articles/search-page.test.tsx` (mock `fetch`, `next/navigation`)
- [ ] Write `__tests__/articles/page.test.tsx` (mock utils, next/navigation)
- [ ] Write `__tests__/articles/tag-page.test.tsx` (mock utils, `next/navigation`, `next/navigation#notFound`)
- [ ] Write `__tests__/articles/category-page.test.tsx` (mock utils, `next/navigation`, `next/navigation#notFound`)
- [ ] Write `__tests__/articles/layout.test.tsx` (snapshot)
- [ ] Write `__tests__/articles/tags-page.test.tsx` (mock utils, snapshot/state)
- [ ] Write `__tests__/articles/categories-page.test.tsx` (mock utils, snapshot/state)
- [ ] Write `e2e/articles.spec.ts` (articles index pagination + tag filter happy paths)
- [ ] Run full unit test suite (`npm test`) and fix any failures
- [ ] Run E2E suite (`npm run test:e2e`) against dev server and fix any failures
- [ ] Update `docs/documentation/agents/coffey-codes.md` to note Vitest + Playwright coverage of articles/taxonomy

## Notes

- Related spec: SPEC-003 (homepage canvas test coverage) — established Vitest infrastructure and mocking patterns; reuse those conventions.
- `next/navigation` mock must handle `useRouter`, `useSearchParams`, and `notFound` — see SPEC-003 patterns for reference.
- The `search-query-updated` custom event in `search/page.tsx` is a non-standard browser event; tests should dispatch it via `window.dispatchEvent(new CustomEvent(...))`.
