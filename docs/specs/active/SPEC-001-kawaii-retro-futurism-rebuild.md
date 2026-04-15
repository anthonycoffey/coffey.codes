---
id: SPEC-001
title: "Kawaii Retro-Futurism Full Rebuild"
status: ready
created: 2026-04-14
author: "Anthony Coffey"
reviewers: []
affected_repos: ["coffey.codes"]
---

## Reviewer Notes

<!-- Leave empty until code review. -->

---

# Feature: Kawaii Retro-Futurism Full Rebuild

## Problem

The current site has two compounding problems:

1. **Visual identity** — The design is generic "corporate tech": blue-600 primary, white/gray-900 backgrounds, Geist sans-serif throughout. It does not reflect the personal brand or stand out among software engineering portfolios.

2. **Maintainability** — The home page is built on a `ClientSections` array-of-configs pattern where section content is passed as JSX props through a runtime map. This makes layouts hard to read, impossible to statically analyze, and awkward to extend. Landing pages and other routes show similar ad-hoc structure with hardcoded dark-mode classes scattered across dozens of components.

Additionally, there is no formalized theme system, so any color change requires hunting through dozens of Tailwind class strings across many files.

## Requirements

### Must have

1. WHEN the site loads, it SHALL display a "Kawaii Retro-Futurism" aesthetic: cream/off-white backgrounds (`#FAF9F6`), mint (`#A1D4B1`), lavender (`#E6E6FA`), and kawaii pink (`#FFC0CB`) accents, Fraunces serif headings, and Nunito sans-serif body text.
2. WHEN a user toggles the theme, the site SHALL switch between `light` and `dark` modes with all colors resolved from CSS custom properties — no hardcoded Tailwind dark-mode classes in component markup.
3. WHEN a developer wants to add a new theme (e.g., Christmas), they SHALL only need to add one CSS block of custom property overrides in `global.sass` — no component code changes required.
4. WHEN viewing the home page, it SHALL consist of clearly named `<section>` elements rendered directly in `app/page.tsx` — no `ClientSections`/`AnimatedSection` array-of-configs indirection.
5. WHEN viewing portfolio, project cards SHALL display as polaroid-style cards with a subtle tilt and a VHS-glitch color-channel effect on hover.
6. WHEN viewing a portfolio card modal, the project image SHALL be wrapped in a `RetroWindow` component styled like a 90s OS window frame.
7. WHEN viewing the contact page, each contact info item (phone, email, location, Calendly) SHALL be presented inside individual `RetroWindow` frames, and the form SHALL be wrapped in a `RetroWindow` titled `send-message.txt`.
8. WHEN viewing any page, the navbar SHALL use pill-shaped active link indicators, a clean cream/themed background, and include a theme toggle button.
9. WHEN viewing any page, the footer SHALL be a clean three-column layout (logo+social / nav links / CTA) — no heavy CTA banner.
10. WHEN the blog/articles system is used, all MDX machinery SHALL remain mechanically untouched — only visual styles (class strings, prose overrides) are updated.
11. WHEN the site is built, `npm run build` SHALL complete with zero TypeScript errors and zero lint errors.
12. WHEN `npm run dev` is running, switching between `light` and `dark` themes SHALL produce no flash of unstyled content (FOUC).

### Nice to have

- Retro OS window decorations (colored dots) on `RetroWindow` are animated with a subtle pulse on hover.
- Portfolio polaroid cards have varying tilt angles per card (stored as a `--card-tilt` CSS custom property set inline).
- Code blocks in blog articles use pastel syntax highlighting colors matching the active theme.

### Non-goals (what this does NOT do)

- This spec does NOT add new animations (Framer Motion work is deferred to Phase 2).
- This spec does NOT implement a VibeToggle (Paper/Neon separate from light/dark) — standard light/dark toggle only.
- This spec does NOT add a custom cursor or console easter egg.
- This spec does NOT change the MDX article content, frontmatter schema, search API, RSS feed, sitemap, or OG image generation.
- This spec does NOT redesign the landing pages (`/lp/*`) beyond updating class strings to use theme tokens.
- This spec does NOT add new pages or routes.

## Design

### Theme System

All colors are CSS custom properties defined per named theme in `styles/global.sass`. `next-themes` is reconfigured to apply `data-theme` on `<html>` (instead of `class`). Tailwind tokens map to these vars:

```sass
// styles/global.sass
[data-theme="light"]
  --color-bg:            #FAF9F6
  --color-bg-alt:        #F5F3C7
  --color-surface:       #FFFFFF
  --color-surface-hover: #F0EEE0
  --color-border:        #C8C8F0
  --color-text:          #1a1a1a
  --color-text-muted:    #5a5a7a
  --color-heading:       #1a1a1a
  --color-accent-1:      #A1D4B1   // mint
  --color-accent-2:      #E6E6FA   // lavender
  --color-accent-3:      #FFC0CB   // kawaii pink
  --color-accent-1-dark: #4DA068
  --color-link:          #4DA068
  --color-code-bg:       #F0EEE0

[data-theme="dark"]
  --color-bg:            #0f0f1a
  --color-bg-alt:        #14142B
  --color-surface:       #1a1a2e
  --color-surface-hover: #22223e
  --color-border:        #2A2A4A
  --color-text:          #E8E8FF
  --color-text-muted:    #8888AA
  --color-heading:       #F0F0FF
  --color-accent-1:      #A1D4B1
  --color-accent-2:      #9090D8
  --color-accent-3:      #FF8FA3
  --color-accent-1-dark: #76BF8A
  --color-link:          #A1D4B1
  --color-code-bg:       #14142B
```

```js
// tailwind.config.js — theme token mapping
colors: {
  bg:              'var(--color-bg)',
  'bg-alt':        'var(--color-bg-alt)',
  surface:         'var(--color-surface)',
  'surface-hover': 'var(--color-surface-hover)',
  border:          'var(--color-border)',
  'c-text':        'var(--color-text)',
  'c-muted':       'var(--color-text-muted)',
  'c-heading':     'var(--color-heading)',
  accent1:         'var(--color-accent-1)',
  accent2:         'var(--color-accent-2)',
  accent3:         'var(--color-accent-3)',
  link:            'var(--color-link)',
}
```

Adding a holiday theme later requires only a new `[data-theme="christmas"]` block in `global.sass`.

### Typography

| Role | Font | Tailwind Class |
|---|---|---|
| Headings (h1–h6) | Fraunces (Google Fonts) | `font-fraunces` |
| Body / UI | Nunito (Google Fonts) | `font-nunito` |
| Code / Mono | Geist Mono (existing) | `font-mono` |

Fonts declared in `lib/fonts.ts` (server-compatible module), CSS variables applied to `<html>` in `app/layout.tsx`.

### Component Architecture

```
app/
  layout.tsx            ← rewritten: data-theme ThemeProvider, new fonts
  page.tsx              ← rewritten: flat <section> elements, no array-of-configs
  portfolio/page.tsx    ← rewritten: polaroid grid + modal
  contact/page.tsx      ← rewritten: two-column RetroWindow layout
  articles/page.tsx     ← restyled only (logic untouched)
  case-studies/page.tsx ← restyled only
  lp/*/page.tsx         ← class strings updated to theme tokens only

components/
  Navbar.tsx            ← new (replaces nav.tsx)
  Footer.tsx            ← new (replaces footer.tsx)
  ThemeToggle.tsx       ← new
  ui/
    RetroWindow.tsx     ← new
    Button.tsx          ← new
    Chip.tsx            ← new
  ContactForm.tsx       ← class strings updated only
  Testimonials.tsx      ← hardcoded dark colors replaced with theme vars
  LogoGrid.tsx          ← wrapper class strings updated only
  posts.tsx             ← restyle only

lib/
  fonts.ts              ← new

styles/
  global.sass           ← rewritten from scratch

docs/
  coding-standards.md   ← new
```

### Key SASS Utilities (defined in `styles/global.sass`)

```sass
// Polaroid card
.polaroid-card
  background: var(--color-surface)
  border: 1px solid var(--color-border)
  box-shadow: 4px 4px 0px rgba(0,0,0,0.12)
  border-radius: 4px
  padding: 10px 10px 32px
  transform: rotate(var(--card-tilt, -1deg))
  transition: transform 0.3s ease, box-shadow 0.3s ease
  &:hover
    transform: rotate(0deg) scale(1.02)
    box-shadow: 6px 6px 0px rgba(0,0,0,0.2)

// VHS glitch overlay (applied alongside .polaroid-card)
.vhs-card
  position: relative
  overflow: hidden
  &::before, &::after
    content: ''
    position: absolute
    inset: 0
    pointer-events: none
    opacity: 0
    background: inherit
  &:hover::before
    opacity: 1
    animation: glitch 0.4s infinite linear alternate-reverse
    background: rgba(255,45,120,0.15)
    mix-blend-mode: color-dodge
  &:hover::after
    opacity: 1
    animation: glitch 0.4s 0.1s infinite linear alternate-reverse
    background: rgba(0,229,255,0.15)
    mix-blend-mode: color-dodge

// 90s OS window frame
.retro-window
  border: 2px solid var(--color-border)
  border-radius: 8px
  overflow: hidden
  box-shadow: 4px 4px 0px rgba(0,0,0,0.12)
  .retro-window-bar
    display: flex
    align-items: center
    gap: 8px
    padding: 8px 12px
    background: var(--color-accent-2)
    border-bottom: 2px solid var(--color-border)
    .retro-dot
      width: 12px
      height: 12px
      border-radius: 50%
      border: 1.5px solid rgba(0,0,0,0.15)
    .retro-dot-red    { background: #FF5F57 }
    .retro-dot-yellow { background: #FFBD2E }
    .retro-dot-green  { background: #28CA41 }
```

### `@keyframes glitch` (in `tailwind.config.js`)

```js
glitch: {
  '0%':   { clipPath: 'inset(40% 0 61% 0)', transform: 'translate(-2px,0)' },
  '20%':  { clipPath: 'inset(92% 0 1% 0)',  transform: 'translate(2px,0)' },
  '40%':  { clipPath: 'inset(43% 0 1% 0)',  transform: 'translate(-2px,0)' },
  '60%':  { clipPath: 'inset(25% 0 58% 0)', transform: 'translate(2px,0)' },
  '80%':  { clipPath: 'inset(54% 0 7% 0)',  transform: 'translate(-2px,0)' },
  '100%': { clipPath: 'inset(58% 0 43% 0)', transform: 'translate(2px,0)' },
}
```

### Page Layouts

**Home (`app/page.tsx`)** — Six direct `<section>` elements:
1. **Hero** — Large Fraunces heading, Nunito subtext, pill CTA buttons, headshot inside a `RetroWindow` frame
2. **Services** — 3×2 bento grid of service cards (`bg-surface border-border rounded-2xl`)
3. **Engineering Principles** — `RetroWindow` containing a 2-col checklist; background `bg-bg-alt`
4. **Tech Stack** — Existing `LogoGrid` wrapped in `bg-bg-alt rounded-2xl border-border`
5. **Testimonials** — Existing `Testimonials` with hardcoded dark colors replaced by theme vars
6. **CTA Strip** — `bg-accent2 border-y-2 border-border`, Fraunces heading, two buttons

**Portfolio (`app/portfolio/page.tsx`)** — Polaroid grid (2-col), each card: `.polaroid-card .vhs-card` with inline `--card-tilt`. Modal: centered overlay with `RetroWindow` wrapping the project image.

**Contact (`app/contact/page.tsx`)** — Two-column desktop layout. Left: 4 stacked `RetroWindow` boxes (phone, email, location, Calendly). Right: `RetroWindow title="send-message.txt"` wrapping `ContactForm`.

**Navbar (`components/Navbar.tsx`)** — Sticky, `border-b-2 border-border bg-bg`. Nav links: `rounded-full px-3 py-1.5`, active state `bg-accent2`. Includes `ThemeToggle` and mobile hamburger menu.

**Footer (`components/Footer.tsx`)** — `bg-bg-alt border-t-2 border-border`. Three columns: logo+tagline+social icons / navigation links / "Ready to build something?" CTA.

### Files to Delete

| File | Reason |
|---|---|
| `components/nav.tsx` | Replaced by `components/Navbar.tsx` |
| `components/footer.tsx` | Replaced by `components/Footer.tsx` |

## Edge cases

- [ ] **FOUC on theme load** — `next-themes` with `attribute="data-theme"` may briefly show unstyled content. Mitigated by defaulting `data-theme="light"` on the server-rendered `<html>` tag and using `suppressHydrationWarning`.
- [ ] **Portfolio modal scroll lock** — When the modal is open on mobile, body scroll must be locked (`overflow-hidden` on `<body>`).
- [ ] **VHS glitch on dark theme** — `mix-blend-mode: color-dodge` renders differently on dark backgrounds. Test both themes and adjust opacity if needed.
- [ ] **CSS var opacity modifiers** — Tailwind classes like `bg-accent1/10` require the CSS var to be in `rgb()` format to support alpha. If opacity modifiers don't work, fall back to hardcoded `rgba()` values in those specific cases.
- [ ] **`next/font/google` in client layout** — `app/layout.tsx` uses `'use client'` (due to `usePathname`). Font configs must be declared in `lib/fonts.ts` (module level) and imported — not declared inside the client component.
- [ ] **Unused components** — `ClientSections.tsx` and `AnimatedSection.tsx` remain on disk but are no longer used by `app/page.tsx`. Leave them for Phase 2 cleanup; do not delete in this pass.

## Acceptance criteria

1. Navigating to `/` shows a cream (`#FAF9F6`) background, Fraunces headings, Nunito body text, and mint/lavender/pink accent elements.
2. Clicking the theme toggle switches all colors site-wide instantly with no page reload and no FOUC.
3. Adding only a new `[data-theme="christmas"] { ... }` block to `global.sass` produces a functional Christmas theme.
4. `app/page.tsx` contains direct `<section>` JSX only — no imports of `ClientSections` or `AnimatedSection`.
5. Hovering a portfolio card triggers a visible VHS-glitch color-channel (red/cyan double-exposure) effect.
6. The portfolio modal renders a `RetroWindow` frame (colored dot buttons + title bar) around the project image.
7. The contact page shows 4 stacked `RetroWindow` boxes (left column) and a `RetroWindow`-framed form (right column) on desktop.
8. `npm run build` exits with code 0.
9. `npm run lint` exits with code 0.
10. All existing blog articles render correctly at `/articles/[slug]` with updated prose styles and syntax highlighting.

## Constraints

- **No new npm packages** — all required libraries are already installed (`next`, `tailwindcss`, `sass`, `next-themes`, `motion`, `@heroicons/react`; `next/font/google` is built-in).
- **Package manager is `npm`** — do not use `bun` commands anywhere.
- **Phase 1 only** — no Framer Motion animations, no custom cursor, no console easter egg.
- **MDX machinery is read-only** — article content, utils, search API, RSS, sitemap, and OG image route are not modified.
- **TypeScript strict** — all new components must have fully typed props interfaces.
- **SASS preferred** — all custom/component styles are written in SASS syntax in `global.sass`; Tailwind handles layout utilities.

## Tasks

- [ ] Create `docs/coding-standards.md` — formalize project coding standards
- [ ] Create `lib/fonts.ts` — Fraunces + Nunito font declarations
- [ ] Update `tailwind.config.js` — CSS-var color tokens, font families, retro box shadows, glitch/blink/float keyframes
- [ ] Rewrite `styles/global.sass` — theme custom properties, base styles, prose overrides, pastel syntax highlighting, `.polaroid-card`, `.vhs-card`, `.retro-window`, scrollbar, selection color
- [ ] Rewrite `app/layout.tsx` — new fonts, `data-theme` ThemeProvider, updated body classes
- [ ] Create `components/ThemeToggle.tsx`
- [ ] Create `components/Navbar.tsx` — sticky nav, pill active states, mobile menu, ThemeToggle
- [ ] Create `components/Footer.tsx` — three-column layout, logo+social / nav / CTA
- [ ] Create `components/ui/RetroWindow.tsx`
- [ ] Create `components/ui/Button.tsx` — primary / secondary / ghost variants
- [ ] Create `components/ui/Chip.tsx`
- [ ] Rewrite `app/page.tsx` — flat sections: hero, services bento, principles, tech stack, testimonials, CTA strip
- [ ] Rewrite `app/portfolio/page.tsx` — polaroid grid, VHS hover, RetroWindow modal
- [ ] Rewrite `app/contact/page.tsx` — two-column, RetroWindow info boxes + form wrapper
- [ ] Update `components/ContactForm.tsx` — theme-token class strings
- [ ] Update `app/articles/page.tsx` — theme-token class strings, all logic preserved
- [ ] Update `components/posts.tsx` — theme-token class strings
- [ ] Update `components/Testimonials.tsx` — replace hardcoded dark colors with theme vars
- [ ] Update `components/LogoGrid.tsx` — wrapper class strings
- [ ] Update `app/case-studies/page.tsx` — RetroWindow card, theme-token classes
- [ ] Update `app/lp/*/page.tsx` and `components/LandingPageHeader.tsx` — theme-token class strings
- [ ] Delete `components/nav.tsx` and `components/footer.tsx`
- [ ] Run `npm run build` — verify zero errors
- [ ] Run `npm run lint` — verify zero errors
- [ ] Manually verify light ↔ dark toggle on all main routes

## Notes

- All existing content (copy, project data, testimonials, work history, contact info, tech logos) is preserved verbatim — only presentation changes.
- `ClientSections.tsx` and `AnimatedSection.tsx` are left on disk but unused after the home page rewrite. They will be deleted in a future Phase 2 cleanup pass when animations are planned.
- Future holiday/seasonal themes require three steps: (1) add a `[data-theme="christmas"]` CSS block to `global.sass`, (2) add the name to the `themes` array in `ThemeProvider`, (3) add a toggle option in `ThemeToggle.tsx`. Zero component changes needed.
- Design concept reference: "Kawaii Retro-Futurism" — cream bases, mint/lavender/pink accents, Fraunces bubbly-serif headings, 90s OS window frames, polaroid-style project cards with VHS-glitch hover.
