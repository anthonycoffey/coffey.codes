---
id: SPEC-008
title: 'Article & taxonomy page typography and theming overhaul'
status: review-pending
created: 2026-04-26
author: anthonycoffey
reviewers: [anthonycoffey]
affected_repos: [coffey.codes]
---

## Reviewer Notes

<!-- Leave empty until code review. -->

---

# Feature: Article & taxonomy page typography and theming overhaul

## Problem

The Tailwind Typography (`prose`) migration on `feature/general-updates` left
the article reading experience inconsistent with the rest of the site. Two
classes of regression are visible in both light and dark mode:

1. **Color tokens are bypassed.** The articles _index_ page
   (`app/articles/page.tsx`) was migrated to the CSS-variable token system
   (`text-c-heading`, `bg-surface`, `border-border`, `text-link`, …), but the
   article _detail_ page (`app/articles/[slug]/page.tsx`) and every taxonomy
   route (`category/[category]`, `tag/[tag]`, `categories`, `tags`) still use
   raw Tailwind palette classes (`text-blue-500`, `bg-white dark:bg-neutral-900`,
   `border-gray-200 dark:border-neutral-800`, `bg-blue-100 dark:bg-blue-900`,
   `dark:text-white`, etc.). The result: chips, sidebars, headings, and links
   ignore the curated palette, so light mode looks like generic Tailwind blue
   on white, and dark mode reads as cold neutral grey instead of the site's
   theme.

2. **Typography is not tuned for long-form reading.** Body copy currently uses
   Outfit (a geometric sans) at default `prose` sizing. There is no editorial
   rhythm, no measured line-length, no considered link/blockquote/code
   treatment. The recent commits show the codebase has flip-flopped between
   serif and sans (`31ce4e5` → `f1a19ca`) without a deliberate spec, leaving
   the reading surface feeling provisional.

A secondary suspicion to verify: `tailwind.config.js` declares
`darkMode: ['attribute', 'data-theme']` with no value. Tailwind v3's
`attribute` strategy expects `['variant', '<selector>']` (e.g.
`['selector', '[data-theme="dark"]']`). The current form likely matches
`[data-theme]` whenever the attribute is present — meaning `dark:` variants
fire under both `data-theme="light"` and `data-theme="dark"`. If true, this
explains why "the colors aren't right for either mode" on the same components.

## Requirements

### Must have

1. WHEN a user views any article detail or taxonomy page in light mode, the
   system SHALL render headings, body, links, chips, sidebars, borders, and
   surfaces using the design tokens defined in `styles/global.sass`
   (`--color-text`, `--color-heading`, `--color-link`, `--color-surface`,
   `--color-bg-alt`, `--color-border`, `--color-accent-*`). No `text-blue-*`,
   `text-gray-*`, `bg-white`, `bg-neutral-*`, `border-gray-*`, or `dark:*`
   palette utilities should remain.

2. WHEN a user views the same pages in dark mode, the system SHALL flip via
   the token swap on `[data-theme="dark"]` only — `dark:` Tailwind variants
   shall not be the mechanism. Tailwind's `darkMode` config shall be corrected
   to a working selector form so that `dark:` variants (used by
   `prose-invert` and any unavoidable plugin output) activate _only_ under
   `[data-theme="dark"]`.

3. WHEN long-form article content (`<article class="prose">`) renders, the
   system SHALL apply an editorial type stack tuned for reading:

   - Body type: a serif optimised for screens (proposal: Source Serif 4 or
     Charter via system stack) at ~18px / 1.65 line-height.
   - Display type: same serif (or a deliberate sans counterpoint, see Design)
     for h1–h4 with strong weight contrast and tight tracking.
   - Measure capped at `max-w-prose` (~65–72ch).
   - Treatments for blockquote (left rule + italic), inline code (subtle
     surface, no border), figures/captions (muted, smaller), and hr (hairline)
     all derive from tokens.

4. WHEN the article header (title, author, date, category chip, tag chips,
   divider) renders, the system SHALL use the same token-driven palette as
   the detail body, with no hard-coded blue/gray colors.

5. WHEN the user toggles between system light/dark (via OS preference, since
   `next-themes` is system-only), all four route classes (detail, category,
   tag, list-of-categories, list-of-tags) SHALL transition cleanly with no
   element retaining stale colours.

6. WHEN `<Callout>` (`components/Callout.tsx`) renders inside MDX content,
   the system SHALL preserve its current visual personality (four type
   variants — info / tip / warning / danger — with subtle tinted
   background, matching border, and tinted foreground text), but the
   color values SHALL be sourced from CSS variables (either existing
   tokens or new `--color-callout-*-{bg,border,text}` tokens added in
   `global.sass`). No raw `bg-blue-50`, `border-yellow-200`, etc. shall
   remain in the component.

7. WHEN any chrome surface stacks over another (nav over body, article
   page over body, sidebar card over page), the system SHALL produce
   visible elevation — the surfaces SHALL NOT all share `--color-bg`.
   The article reading container in particular SHALL sit on
   `--color-surface` (light: white, dark: #1C2128) so that the body text
   has a "page-on-canvas" relationship to the surrounding viewport.

### Nice to have

- Drop-cap on the first paragraph of each article.
- Pull-quote MDX component variant.
- Per-article reading-time estimate in the header.
- A `Callout` re-skin pass to match the new editorial tone (its colors were
  recently tweaked in `544c624` — verify it still fits).

### Non-goals (what this does NOT do)

- This spec does NOT introduce a manual theme toggle (`next-themes` stays
  system-only per CLAUDE.md).
- This spec does NOT redesign the homepage scene, contact page, or
  landing pages under `app/lp/`.
- This spec does NOT change the design tokens themselves — they stay as-is.
  Only their _application_ to article surfaces changes. (If a token is
  missing for a need — e.g. an editorial accent — it will be added in
  `global.sass` as part of the work, not changed.)
- This spec does NOT migrate MDX prose internals (lists, tables, etc.)
  beyond what `prose` + the new tuning provides; richer MDX components are
  out of scope.

## Design

### Token application strategy

Use the articles _index_ page (`app/articles/page.tsx`) as the canonical
example — it already uses `text-c-heading`, `text-c-muted`, `bg-surface`,
`bg-bg-alt`, `border-border`, `text-link`, `text-accent1-dark`. Mirror that
style on:

| File | Current state | Target |
|---|---|---|
| `app/articles/[slug]/page.tsx` | Raw `text-blue-*`, `dark:text-white`, `bg-blue-100 dark:bg-blue-900`, `border-gray-200 dark:border-neutral-800` | Tokens only — title `text-c-heading`, meta `text-c-muted`, category/tag chips reuse the existing `.Chip` component class from `global.sass` (which already uses `--color-accent-2` / `--color-heading`) |
| `app/articles/category/[category]/page.tsx` | Heavy `dark:` raw palette in sidebars and chips | Same tokens as the index — `bg-surface`, `border-border`, `text-c-heading`, `text-c-muted`, `text-link`, `bg-bg-alt` |
| `app/articles/tag/[tag]/page.tsx` | Same as above | Same as above |
| `app/articles/categories/page.tsx` | `bg-blue-100 dark:bg-blue-900`, `text-blue-800 dark:text-blue-200` chips | `.Chip` component class |
| `app/articles/tags/page.tsx` | `bg-gray-100 dark:bg-neutral-800` chips | `.Chip` component class (or a `.Chip--muted` variant if visual hierarchy demands it) |

### Dark-mode strategy fix

Investigate and correct `tailwind.config.js`:

```js
// Current — likely buggy
darkMode: ['attribute', 'data-theme'],

// Target — Tailwind v3 selector strategy with explicit value
darkMode: ['selector', '[data-theme="dark"]'],
```

Verify the change against:

- Light mode: no `dark:` variant should apply.
- Dark mode: `dark:prose-invert` on `<article>` should activate.
- Snapshot test for `BlogLayout` (`__tests__/articles/__snapshots__/`) —
  confirm no class output regression.

### Typography tuning — decided

**Serif headings only. Sans-serif body. No exceptions.** Confirmed by
author (2026-04-26). The serif typeface is applied **only** to:

- `.prose h1, h2, h3, h4` (in-article headings)
- The article-detail page title (`<h1 class="title">`)
- Optionally the taxonomy page H1s (e.g. "Articles in category 'X'")
  — reviewer call during T9.

Everything else — running paragraphs, lists, blockquotes, captions,
table cells, sidebars, chips, breadcrumbs, nav, footer, buttons — stays
in Outfit (sans).

Rationale: the article corpus contains substantial inline code and
fenced code blocks (e.g. `react-19-features-and-design-patterns.mdx`,
the SST/AWS write-ups). Code is mono — embedding it inside a serif
running body produces an awkward optical handoff between paragraph
text and code spans. A sans body keeps that handoff clean while still
reserving the serif as the editorial signal at the section/title
level. Serif on display + sans on body is also the explicit
"long-form-with-code" pattern (Stripe Press, GitHub blog, Vercel blog
all do variants of this).

**Type stack**

- Display (`.prose h1, h2, h3, h4` and the page title heading on the
  detail/taxonomy pages): screen-tuned serif via `next/font/google`.
  Primary candidate: **Source Serif 4** (open source, hinted for
  screen, weight range 400–800 covers our needs). Fallback stack:
  `Charter, 'Iowan Old Style', Georgia, serif`. Exposed as
  `--font-editorial`.
- Body (`.prose` running text, lists, blockquotes, captions): Outfit
  via the existing `--font-outfit` variable. No change to the loader.
- UI chrome (sidebars, chips, breadcrumbs, nav, footer, taxonomy page
  H1s _outside_ `.prose`): Outfit, as today.

**Letter-spacing — explicit reversal of the current `tracking-tighter`**

Tight tracking on a screen serif looks visually wrong, especially at
display sizes — the letterforms collide. Direction:

| Selector | Current | Target |
|---|---|---|
| `.prose h1` (article body H1, rare) | `tracking-tight` | `letter-spacing: 0` (default) |
| `.prose h2` | `tracking-tight` | `letter-spacing: 0.005em` (slight positive) |
| `.prose h3, h4` | `tracking-tight` | `letter-spacing: 0` |
| Article title (the `<h1 class="title">` on the detail page) | `tracking-tighter` | `letter-spacing: 0.005em` |
| Taxonomy page H1s (Outfit, sans) | `tracking-tighter` | unchanged — sans display is fine tight |

Rule of thumb encoded in the spec: **serif display ≥ 0; sans display
may be tight.** Reviewer can fine-tune by eye during T9.

**Concrete `global.sass` changes (sketch — not final code)**

```sass
// New CSS var (loaded in app/layout.tsx via next/font/google)
:root, [data-theme="light"], [data-theme="dark"]
  --font-editorial: var(--font-source-serif), Charter, 'Iowan Old Style', Georgia, serif

.prose
  // body stays Outfit — drop any prose-level font-family override
  font-size: 1.0625rem     // 17px — tune in T9
  line-height: 1.65
  color: var(--color-text)
  max-width: 68ch

.prose h1
  font-family: var(--font-editorial)
  font-weight: 700
  letter-spacing: 0

.prose h2
  font-family: var(--font-editorial)
  font-weight: 700
  letter-spacing: 0.005em

.prose h3, .prose h4
  font-family: var(--font-editorial)
  font-weight: 600
  letter-spacing: 0
```

Drop the existing `.prose h1/h2/h3/h4 { font-family: var(--font-outfit) }`
overrides; the new `--font-editorial` cascade replaces them.

The article-detail page title (`<h1 class="title">` outside `.prose`)
also moves to `--font-editorial` with `letter-spacing: 0.005em` —
swap `tracking-tighter` for an editorial-tracking utility, or apply
inline `style={{ letterSpacing: '0.005em' }}` if utility-only proves
awkward.

Blockquote / inline code / hr / figures: re-derive from tokens
(`var(--color-border)` for the blockquote rule, `var(--color-code-bg)` and
`var(--color-text)` for inline code — already present, just verify).

### Elevation & "page-on-canvas" layering

**Problem.** Today the nav, the `<body>`, and most page wrappers all
resolve to `--color-bg` (#F7F8FA in light, #0D1117 in dark). The
article reading surface itself has no background — it inherits the
body bg. Result: every horizontal band of the viewport is the same
flat colour, so the eye never registers "I am reading a document"
versus "I am navigating the site." Footer is the only chrome with a
distinct `--color-bg-alt`.

**Target hierarchy** (light-mode swatches; dark mode mirrors via
existing tokens):

| Layer | Token | Light value | Role |
|---|---|---|---|
| Canvas (body, outer viewport) | `--color-bg` | `#F7F8FA` | The "desk" everything sits on. |
| Chrome (nav, footer, page-section bands) | `--color-bg-alt` | `#EDEEF2` | Establishes that this strip is _not_ content — it is structure. |
| Page (article reading container, taxonomy page wrapper, sidebar cards) | `--color-surface` | `#FFFFFF` | The "paper". Anything the user is meant to read or interact with sits here. |
| Hover / nested interactive | `--color-surface-hover` | `#E4E6EC` | Already in use for hover states; no change. |

**Concrete changes**

1. **Navbar** (`components/Navbar.tsx`, currently `bg-bg`) — change the
   non-overlay state to `bg-bg-alt` with the existing
   `border-b-2 border-border`. The fixed/overlay state on the homepage
   stays transparent. Verify the homepage scene background still feels
   right against the new nav colour when scrolling reaches a non-overlay
   section.

2. **Article detail page** (`app/articles/[slug]/page.tsx`) — wrap the
   entire content (`<section>`) in a `bg-surface` container with
   `border border-border`, generous padding, and rounded corners. The
   header, body, and `GoBack` all sit on this paper. The body's
   `bg-bg` shows through at the gutters, producing the page-on-canvas
   effect. Suggested utility:
   `bg-surface border border-border rounded-lg shadow-sm px-6 sm:px-10 py-8 sm:py-12`.
   Width capped by the existing `max-w-4xl` on `BlogLayout`.

3. **Taxonomy pages** (`category/[category]`, `tag/[tag]`,
   `categories`, `tags`) — the sidebar cards already use `bg-surface`.
   The main content column on the category and tag detail pages
   currently has no surface — wrap `<BlogPosts>` in a matching
   `bg-surface` card so the result column reads as a page-equivalent
   surface. The `categories` and `tags` index pages can stay open
   (chip grids on canvas) or get the same treatment if visually
   warranted — reviewer call.

4. **Footer** — already on `bg-bg-alt`. Leave alone.

5. **Dark-mode verification.** In dark mode the three layers are
   `#0D1117` < `#161B22` < `#1C2128`. Confirm the deltas read as
   visible separation on a calibrated display; if the difference is
   too subtle, propose a single token-value tweak (out of scope by
   default — flag, do not change unilaterally).

### Callout migration (visual-preserving)

`components/Callout.tsx` currently hard-codes four `bg-*-50 border-*-200
text-*-800` palettes. Per requirement #6 these become CSS variables.
Visual personality stays identical — same hue family, same lightness
relationship, same iconography.

**Approach.** Add four named callout token sets in `global.sass`:

```sass
:root, [data-theme="light"]
  --callout-info-bg:      #EFF6FF   // ~ blue-50
  --callout-info-border:  #BFDBFE   // ~ blue-200
  --callout-info-text:    #1E40AF   // ~ blue-800

  --callout-tip-bg:       #F0FDF4   // ~ green-50
  --callout-tip-border:   #BBF7D0   // ~ green-200
  --callout-tip-text:     #166534   // ~ green-800

  --callout-warning-bg:     #FEFCE8 // ~ yellow-50
  --callout-warning-border: #FEF08A // ~ yellow-200
  --callout-warning-text:   #854D0E // ~ yellow-800

  --callout-danger-bg:      #FEF2F2 // ~ red-50
  --callout-danger-border:  #FECACA // ~ red-200
  --callout-danger-text:    #991B1B // ~ red-800

[data-theme="dark"]
  // Inverted: deeper tinted bg, brighter text, mid border
  --callout-info-bg:      #0E1F3A
  --callout-info-border:  #1E3A8A
  --callout-info-text:    #BFDBFE
  // …same pattern for tip / warning / danger
```

`Callout.tsx` then uses inline `style={{ background: 'var(--callout-info-bg)', ... }}`
or — preferred — switch from a class lookup map to a CSS-only solution
using `data-callout-type="info|tip|warning|danger"` and resolve the
three vars in `global.sass`. The latter keeps the React component
free of styling logic and makes the dark-mode swap automatic.

### Chip consolidation

There are currently four near-identical chip implementations (on the
detail page, the two taxonomy index pages, and the `BlogPosts` card list)
each with different `bg-blue-100 / bg-gray-100` variants. The
`global.sass` file already defines a `.Chip` component class. Consolidate
all chips to either `.Chip` (accent variant for categories) or a new
`.Chip--muted` (for tags), both token-driven. This collapses 5 spots of
divergent dark-mode handling into one source of truth.

## Edge cases

- [ ] FOUC: `:root` already mirrors light theme tokens; verify the new
      `--font-editorial` is also declared at `:root` so unstyled flash uses
      the right family.
- [ ] If `dark:prose-invert` stops working after the `darkMode` selector
      fix, fall back to writing inverted prose styles directly against
      `[data-theme="dark"] .prose` in `global.sass` — already the pattern
      used elsewhere in the file.
- [ ] Code block syntax highlighting (`--sh-*` vars) is already
      theme-aware; no change needed but verify in a post containing code.
- [ ] Mermaid charts (`.mermaid-chart-container`) — verify they still
      render legibly in both themes after the body color shift.
- [ ] Long article titles in the header — confirm `text-wrap: balance`
      (already on `.title`) holds with the new heading font.
- [ ] Tables (`prose table`) inside MDX — verify against
      `react-19-features-and-design-patterns.mdx` which has tables.

## Acceptance criteria

1. Searching the article detail, all four taxonomy route files, **and
   `components/Callout.tsx`** for `dark:`, `text-blue-`, `text-gray-`,
   `bg-blue-`, `bg-gray-`, `bg-neutral-`, `bg-white`, `bg-yellow-`,
   `bg-red-`, `bg-green-`, `border-gray-`, `border-neutral-`,
   `border-blue-`, `border-yellow-`, `border-red-`, `border-green-`
   returns zero matches.
2. `npm run test` passes (vitest snapshot for `BlogLayout` may need a
   refreshed `--update`; that is acceptable when reviewed).
3. `npm run test:e2e` passes — articles + taxonomy specs continue to
   resolve their assertions (most are structural, not visual, so should
   not regress).
4. Manual visual QA in both `prefers-color-scheme: light` and `: dark`:
   - Article detail at `/articles/<any-slug>`
   - An article containing every Callout variant (info / tip / warning
     / danger) — confirm visual personality matches today's screenshot
     in light mode, and reads correctly in dark mode.
   - Category at `/articles/category/<any>`
   - Tag at `/articles/tag/<any>`
   - `/articles/categories` and `/articles/tags`
   - Confirm: no element retains the wrong-mode palette after toggling
     OS theme; chips, links, sidebars, borders all use the curated
     tokens; prose body remains in **Outfit (sans-serif)** and only
     headings use the serif; the article content visibly sits on a
     `--color-surface` page that is distinct from the
     `--color-bg-alt` nav and the `--color-bg` canvas.
5. Lighthouse / axe contrast check on the article detail in both themes
   (body text vs. background, link vs. background, muted vs. background)
   passes WCAG AA at minimum.

## Constraints

- No manual theme toggle — `next-themes` stays in system-only mode.
- No new runtime dependencies. Source Serif 4 (if chosen) loads via
  `next/font/google`, matching the existing Outfit / GeistMono pattern in
  `app/layout.tsx`.
- Must preserve current `.prose` snapshot semantics enough that
  `__tests__/articles/__snapshots__/layout.test.tsx.snap` either still
  matches or is updated with reviewer approval.
- All work on `feature/general-updates` (current branch) — atomic commits
  per `docs/documentation/development-standards.md`.

## Tasks

- [x] **T1** — Fix `tailwind.config.js` `darkMode` selector. Done in
      `58474f9`.
- [x] **T2** — Migrate `app/articles/[slug]/page.tsx` header markup +
      `Breadcrumbs` to design tokens. Done in `d295e82`.
- [x] **T3** — Migrate `app/articles/category/[category]/page.tsx`.
      Done in `e834dfd`.
- [x] **T4** — Migrate `app/articles/tag/[tag]/page.tsx`. Done in
      `e834dfd`.
- [x] **T5** — Migrate `app/articles/categories/page.tsx` and
      `app/articles/tags/page.tsx`. Done in `d08c917`.
- [ ] **T6** — `.Chip--muted` variant. **Skipped** during
      implementation — visual distinction between category and tag
      chips comes from `bg-accent2` vs `bg-bg-alt` reused from
      `BlogPosts`, no new component class needed. Reviewer can
      reopen if a stronger visual delta is wanted.
- [x] **T7** — Typography decision recorded.
- [x] **T8** — Source Serif 4 wired via `next/font/google` and exposed
      as `--font-editorial` and `font-editorial` Tailwind utility.
      Done in `6f545bc`.
- [x] **T9** — Serif applied to `.prose h1-h4` and the article-detail
      `<h1 class="title">`. Tracking reversed per the Design table.
      Heading weights bumped to 700/700/600/600. Body size /
      line-height / measure intentionally **not** tuned in this
      pass — `prose prose-lg xl:prose-xl` defaults are kept; revisit
      after visual QA. Done in `167b5df`.
- [x] **T10** — Verified during T1: `dark:prose-invert` activates
      correctly under `[data-theme="dark"]` after the `darkMode`
      selector fix. No replacement needed.
- [x] **T11** — `BlogLayout` snapshot refreshed (`4ea8a32`) — was stale
      from upstream commit `9bd0d4f`, unrelated to this spec but
      blocked the test suite.
- [x] **T12** — Navbar non-overlay → `bg-bg-alt`; article-detail
      wrapped in `bg-surface` card; taxonomy result columns already
      surfaced via `BlogPosts` cards. Done in `f34e39c`.
- [x] **T13** — `--callout-*` tokens added (light + dark);
      `Callout.tsx` uses `data-callout-type`. Visual output unchanged
      in light mode. Done in `74642c6`.
- [ ] **T14** — Visual QA pass — **handed back to reviewer.** Test
      surface: `/articles/<slug>`, all four taxonomy routes, an MDX
      post containing every Callout variant. Both light and dark.

## Out of scope (flagged for follow-up)

- `app/articles/search/page.tsx` still uses raw palette utilities
  (`text-blue-*`, `bg-white`, `border-gray-*`, etc.). Spec scope was
  explicit (detail + 4 taxonomy + Callout) and the search route was
  not listed. Same migration pattern applies — should be its own
  follow-up spec.
- A handful of MDX post files (`app/articles/posts/*.mdx`) embed
  raw Tailwind palette classes in author-written JSX. Treated as
  content, not chrome.
- Pre-existing lint error in `tailwind.config.js` line 70
  (`require()` for the `@tailwindcss/typography` plugin) — predates
  this branch and is unrelated to SPEC-008.

## Notes

- The most recent typography commits — `31ce4e5` (sans → serif),
  `f1a19ca` (serif → sans), `5f1a579` (`max-w-prose` revert),
  `0a008cf` (divider tweak) — together suggest several incremental
  attempts to tune the reading surface without a unified plan. This spec
  is that plan.
- The existing `.Chip` class in `global.sass` already uses the right
  tokens (`--color-accent-2` background, `--color-heading` text). It is
  underused — chips are reimplemented inline on five different pages.
  Consolidating around `.Chip` is a free correctness win.
- Reference: `docs/documentation/development-standards.md` for the spec
  lifecycle. This file enters at status `draft`; promote to `ready` once
  the typography option (A vs. B) is confirmed. Do not begin
  implementation while status is `draft`.
