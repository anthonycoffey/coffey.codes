---
id: SPEC-002
title: "Homepage Rebuild — Immersive Interactive Storytelling Layout"
status: complete
created: 2026-04-15
author: Anthony Coffey
reviewers: []
affected_repos: ["coffey.codes"]
---

## Reviewer Notes

<!-- Leave empty until code review. -->

---

# Feature: Homepage Rebuild — Immersive Interactive Storytelling Layout

## Problem

SPEC-001 delivered a reskin. The fonts changed, the CSS vars are cleaner, and the theme system is solid infrastructure — but the homepage is still the same thing it's always been: a long vertical stack of sections that someone scrolls past without feeling anything. Services list. Logo grid. Testimonials. A button that says "Start Your Project." It's not a homepage. It's a brochure.

The visual direction (kawaii pastel — cream, mint, lavender, pink) also fundamentally missed the mark on personality. It was pleasant and inoffensive, which is exactly the problem. Anthony is not pleasant and inoffensive.

Two things need to change simultaneously:

1. **Layout & interaction model** — Blow up the vertical scroll page entirely. Replace it with a full-screen immersive experience: horizontal scroll + pinned panels driven by GSAP ScrollTrigger, with Three.js WebGL moments woven into the scenes. The homepage should feel like entering something, not reading something.

2. **Content & copy** — Strip every corporate word. No services, no principles, no "reliable and scalable," no "Start Your Project." Replace with personality-first content that sounds like the actual human who built the site: outgoing, rebellious, artistic, psychedelic, snarky, weird, dark, mysterious, playful, and fun — simultaneously.

## Requirements

### Must have

1. WHEN a user visits the homepage, it SHALL render as a full-viewport experience — no visible page scroll on load, no traditional top-to-bottom layout
2. WHEN a user scrolls, GSAP ScrollTrigger SHALL pin the page and drive horizontal movement through a series of full-screen scenes
3. WHEN transitioning between scenes, animations SHALL feel deliberate and cinematic — not janky tab-through, but a real narrative arc
4. WHEN Three.js moments are used, they SHALL be embedded as canvas elements within specific scenes (not overlaid on the whole page) and SHALL enhance the storytelling rather than serve as decoration
5. WHEN copy is written, it SHALL contain zero corporate buzzwords — no "scalable," "reliable," "cutting-edge," "production-ready," "solutions," "expertise," "specialize," "deliverables," or "synergy"
6. WHEN the hero scene renders, it SHALL introduce Anthony as a person with actual voice — weird, direct, funny — not as a service provider
7. WHEN the services section is evaluated, it SHALL be removed entirely — it is not the message
8. WHEN the engineering principles section is evaluated, it SHALL be removed entirely
9. WHEN the page has a CTA, it SHALL feel like an invitation, not a sales funnel
10. WHEN the page is built, `npm run build` SHALL complete with zero TypeScript and zero lint errors
11. WHEN the page is viewed on mobile, it SHALL degrade gracefully — horizontal scroll experience adapted for touch or simplified to a snapping vertical layout

### Nice to have

- A "now" scene: what Anthony is currently building, obsessing over, listening to — updated as a JSON/MDX file without code changes
- Subtle parallax depth on scene backgrounds using Three.js or CSS 3D transforms
- A scene that's just a piece of art or animation — no copy, just vibe
- Easter eggs: a hidden interaction, a console message, something weird for the curious
- Particle or noise field in the hero using Three.js that reacts to mouse position
- Scene progress indicator (dots, a scrubber, or a custom progress bar) so the user knows where they are in the story

### Non-goals (what this does NOT do)

- This spec does NOT redesign the articles, contact, portfolio, or any other page — homepage only
- This spec does NOT build a new customer acquisition funnel or SEO content strategy
- This spec does NOT require keeping any existing homepage section in any form
- This spec does NOT replace the theme system (CSS vars, dark/light toggle) built in SPEC-001 — those stay; only the palette changes

## Design

### Color Palette — New Direction

The kawaii pastel palette is gone. The new palette should feel dark, vibrant, and psychedelic — like a rave poster designed by someone who also reads philosophy. Think: deep blacks and near-blacks as the base, punchy saturated neon/electric accents, a warm orange, and something weird and unexpected.

**Direction (not final hex values — needs design iteration):**
```
bg:        deep inky black / dark navy        (~#09090F or #0B0B1A)
surface:   slightly lighter dark             (~#13131F)
accent-1:  electric blue / cyan              (~#00D4FF or #3B82F6 pushed vibrant)
accent-2:  hot orange / flame               (~#FF6B00 or #FF4500)
accent-3:  acid purple / violet             (~#9333EA or #7C3AED)
accent-4:  hot pink (NOT pastel)            (~#FF0080 or #E91E8C)
text:      off-white / light                (~#F0F0FF)
muted:     dim purple-gray                  (~#6B6B8A)
```

The final palette should feel cohesive and intentional — not "all the neons at once." Choose 1-2 dominant accents and use the others as punctuation. This is design work that happens during implementation, not beforehand.

### Interaction Model — Horizontal Scroll + Pinned Panels

The core layout technique uses GSAP ScrollTrigger to pin the page container and translate it horizontally as the user scrolls. Each "scene" occupies 100vw × 100vh. The scroll-to-x mapping gives the feeling of moving through space rather than reading down a page.

```
Scroll ↓ → Page translates ← (horizontally through scenes)
```

Structure:
```
<main id="scroll-container">          ← fixed height triggers scroll
  <div id="scroll-track">            ← translates horizontally via GSAP
    <scene id="intro" />             ← 100vw × 100vh
    <scene id="about" />             ← 100vw × 100vh
    <scene id="craft" />             ← 100vw × 100vh
    <scene id="now" />               ← 100vw × 100vh (optional)
    <scene id="connect" />           ← 100vw × 100vh (CTA)
  </div>
</main>
```

GSAP ScrollTrigger configuration (conceptual):
```js
// Pin the track, scrub it horizontally based on scroll position
gsap.to("#scroll-track", {
  x: () => -(scrollTrack.scrollWidth - window.innerWidth),
  ease: "none",
  scrollTrigger: {
    trigger: "#scroll-container",
    pin: true,
    scrub: 1,
    end: () => "+=" + (scrollTrack.scrollWidth - window.innerWidth),
  }
})
```

Between or within scenes, additional ScrollTrigger instances handle:
- Per-scene entrance animations (text fades, staggered reveals)
- Three.js canvas moments triggered at specific scroll positions
- Parallax depth layers within individual scenes

### Scene Breakdown

| # | Scene ID | Content | Interaction |
|---|---|---|---|
| 1 | `intro` | Name + personality-first tagline. The "who are you?" moment. | Three.js particle/noise field on canvas reacting to mouse |
| 2 | `about` | Short weird honest bio. No bullet points. Just Anthony talking. | Text entrance with ScrollTrigger stagger |
| 3 | `craft` | What Anthony actually builds and how he thinks about it — opinionated, not listed | Optional Three.js or CSS visual |
| 4 | `now` | Currently: what he's building, reading, obsessing over | Simple card layout, data from JSON |
| 5 | `connect` | Invite-style CTA. Not "Start a Project." More like "say hi." | Big, weird, confident |

### Three.js Integration

Three.js is already installed. It should be used in 1-2 scenes maximum — overusing it turns it into gimmick. Best candidates:

- **Scene 1 (intro)**: Particle field or noise mesh as the background canvas that reacts to mouse movement — sets the tone immediately without needing to explain anything
- **Scene 3 (craft)** or ambient: Abstract 3D form that slowly rotates — something sculptural and mysterious

Three.js canvases render inside `<canvas>` elements positioned absolutely within their scene containers. They are initialized and destroyed using React lifecycle (`useEffect` cleanup) to avoid memory leaks when the component unmounts.

### Copy (approved — v1, subject to iteration)

Guiding philosophy: **Win Without Pitching** (Blair Enns). Present who you are, don't sell. Expert positioning — you select, you're not selected. No pursuit, no pitch. The homepage is a self-portrait, not a proposal.

**Scene 1 — Intro**
```
Art is the point.
Everything else is the medium.

Anthony Coffey  —  Austin, TX
```

**Scene 2 — About**
```
Musician. Director. Engineer. Actor.
Not a list — a life.

Austin, Texas. Studio wired for whatever comes next.
Art is the purpose. Code is one of the languages.
```

**Scene 3 — Craft**
```
The process is supposed to be messy.
The work isn't.

Chaos is fine. Clarity is the goal.
```

**Scene 4 — Now**
```
Right now —

Building businesses that run themselves.
Filming things that don't exist yet.
Writing songs for an album nobody's heard.
```

**Scene 5 — Connect**
```
I don't pitch.
I talk.

→  reach out
```

**Anti-patterns — explicitly banned in all copy:**
- "I specialize in..." / "I'm passionate about..."
- "With X years of experience..."
- "Let's build something together" / "Start your project"
- Any service list, skills list, or numbered principles
- Any word: scalable, reliable, cutting-edge, solutions, deliverables, expertise

### Components & Files

| Path | Action |
|---|---|
| `app/page.tsx` | Complete rewrite — horizontal scroll layout, scene components |
| `app/page.module.sass` (new) | Scene-specific styles, scroll container sizing |
| `components/scenes/IntroScene.tsx` (new) | Scene 1 — hero + Three.js canvas |
| `components/scenes/AboutScene.tsx` (new) | Scene 2 — bio copy |
| `components/scenes/CraftScene.tsx` (new) | Scene 3 — philosophy/craft |
| `components/scenes/NowScene.tsx` (new) | Scene 4 — "currently" content |
| `components/scenes/ConnectScene.tsx` (new) | Scene 5 — CTA |
| `components/canvas/ParticleField.tsx` (new) | Three.js particle/noise canvas for intro |
| `data/now.json` (new) | Editable "now" section content (no redeploy needed) |
| `components/Testimonials.tsx` | Remove from homepage (leave component on disk) |
| `components/LogoGrid.tsx` | Remove from homepage (leave component on disk) |
| `styles/global.sass` | Update palette CSS vars — new dark/vibrant direction |
| Page metadata | Rewrite title + description |

### Mobile Strategy

Full horizontal scroll pinning is desktop-first. On mobile:
- Detect via media query or `window.innerWidth`
- Fall back to vertical snap-scroll layout (CSS `scroll-snap-type: y mandatory` on each scene)
- GSAP still handles entrance animations per scene via `ScrollTrigger` with vertical config
- Three.js canvases remain but may be simplified or static on mobile

## Edge cases

- [ ] GSAP ScrollTrigger + Next.js App Router — ScrollTrigger must be initialized client-side only; wrap in `'use client'` components with `useEffect` and clean up with `ScrollTrigger.kill()` on unmount
- [ ] Three.js canvas resize — canvas must respond to `window.resize`; use a ResizeObserver or `window.addEventListener('resize', ...)` with cleanup
- [ ] Three.js memory leaks — dispose geometries, materials, and renderers in `useEffect` cleanup to avoid leaks between hot reloads and route transitions
- [ ] Scroll hijacking accessibility — horizontal scroll via keyboard (arrow keys) should be supported; consider adding a skip-to-content link
- [ ] Mobile touch scroll conflict — GSAP's scroll pinning can interfere with native touch scroll; test on real devices and use `touch-action: none` carefully
- [ ] SEO — the content lives inside client-rendered scene components; ensure key content (name, bio text, contact link) is either server-rendered or present in static markup for crawlers
- [ ] Internal links to `/#services` or `/#principles` — audit and remove/update any nav links pointing to removed sections
- [ ] `npm run build` with GSAP — GSAP and Three.js both reference `window`; any top-level imports that touch browser APIs will break SSR; use dynamic imports or `typeof window !== 'undefined'` guards

## Acceptance criteria

1. Landing on `/` shows a full-viewport dark scene — no above-the-fold scroll indicator, no header navigation over content, no visible page bottom
2. Scrolling (mouse wheel or trackpad) drives horizontal movement through at least 4 distinct scenes
3. A Three.js canvas element is present and animated in at least one scene
4. Zero corporate buzzwords appear anywhere in the page copy
5. Services section and Engineering Principles section do not exist anywhere in the new page
6. The CTA scene does not use: "project," "consultation," "schedule a meeting," "solutions," "expertise"
7. On a viewport narrower than 768px, content is accessible and readable (snap-scroll vertical fallback)
8. `npm run build` exits with code 0
9. `npm run lint` exits with code 0
10. Page title and meta description reflect personality, not contractor positioning

## Constraints

- GSAP and Three.js are already installed — no new packages needed for the core implementation
- The SPEC-001 theme infrastructure (CSS var system, dark/light toggle, Tailwind tokens) is kept as the foundation — only palette values change
- `'use client'` is required for all scene components (GSAP, Three.js, scroll behavior are browser-only)
- MDX machinery, articles, API routes, OG image, and all non-homepage routes are untouched
- TypeScript strict — all new components must have fully typed props
- TDD is mandatory per development standards — every phase begins RED (failing tests) before any implementation

## Tasks

### Phase 0 — Test infrastructure (prerequisite — nothing else starts without this)
- [ ] Install Vitest + React Testing Library (`vitest`, `@vitejs/plugin-react`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`)
- [ ] Configure `vitest.config.ts` — jsdom environment, path aliases matching `tsconfig`
- [ ] Install Playwright (`@playwright/test`) and run `npx playwright install`
- [ ] Configure `playwright.config.ts` — base URL `http://localhost:3000`, Chromium + Firefox
- [ ] Add `test` and `test:e2e` scripts to `package.json`
- [ ] Verify both runners execute with zero errors on an empty test suite

### Phase 1 — Scroll skeleton (RED → GREEN → REFACTOR)
- [ ] RED: Write Vitest unit tests — scroll container renders, track renders, 5 scene slots present in DOM
- [ ] RED: Write Playwright E2E test — scrolling drives horizontal translation, each scene enters viewport at expected scroll position
- [ ] GREEN: Rewrite `app/page.tsx` — scroll container + track, 5 placeholder scene components (colored divs, labeled)
- [ ] GREEN: Create `app/page.module.sass` — container height, track flex layout, scene sizing (100vw × 100vh)
- [ ] GREEN: Wire GSAP ScrollTrigger — pin container, scrub horizontal track translation
- [ ] GREEN: Make all Phase 1 tests pass
- [ ] REFACTOR: Clean up, verify tests still green

### Phase 2 — Scenes (RED → GREEN per scene)
- [ ] RED: Write tests for IntroScene — renders correct copy, contains canvas slot
- [ ] GREEN: Create `components/scenes/IntroScene.tsx` with approved Scene 1 copy
- [ ] RED: Write tests for AboutScene — renders correct copy
- [ ] GREEN: Create `components/scenes/AboutScene.tsx` with approved Scene 2 copy
- [ ] RED: Write tests for CraftScene — renders correct copy
- [ ] GREEN: Create `components/scenes/CraftScene.tsx` with approved Scene 3 copy
- [ ] RED: Write tests for NowScene — renders items from `data/now.json`
- [ ] GREEN: Create `data/now.json` + `components/scenes/NowScene.tsx`
- [ ] RED: Write tests for ConnectScene — renders CTA, contains contact link, zero banned words
- [ ] GREEN: Create `components/scenes/ConnectScene.tsx` with approved Scene 5 copy
- [ ] REFACTOR: All scene tests green

### Phase 3 — Three.js canvas (RED → GREEN → REFACTOR)
- [ ] RED: Write Vitest test — `ParticleField` mounts a `<canvas>` element, cleanup disposes renderer
- [ ] GREEN: Create `components/canvas/ParticleField.tsx` — Three.js particle/noise field with resize + dispose lifecycle
- [ ] GREEN: Integrate into IntroScene
- [ ] GREEN: Make Phase 3 tests pass
- [ ] REFACTOR: Verify no memory leaks, tests green

### Phase 4 — Entrance animations
- [ ] Add per-scene text stagger/fade via ScrollTrigger (visual — validated manually + Playwright viewport assertions)
- [ ] Verify `ScrollTrigger.kill()` called on unmount

### Phase 5 — Mobile fallback (RED → GREEN → REFACTOR)
- [ ] RED: Write Playwright E2E test — at 375px viewport, scenes stack vertically with snap behavior, no horizontal scroll
- [ ] GREEN: Implement CSS `scroll-snap-type: y mandatory` fallback for mobile, conditional GSAP config
- [ ] GREEN: Make Phase 5 tests pass
- [ ] REFACTOR

### Color & palette (runs alongside Phase 2)
- [ ] Define final dark/vibrant palette hex values
- [ ] Update CSS var values in `styles/global.sass` for both themes

### Verification
- [ ] Audit and remove internal links to `/#services`, `/#principles`
- [ ] Rewrite page `<title>` and `<meta description>`
- [ ] `npm run build` — zero errors
- [ ] `npm run lint` — zero errors
- [ ] `npm test` — all unit tests pass
- [ ] `npm run test:e2e` — all Playwright tests pass
- [ ] Manual scroll-through desktop (Chrome, Firefox)
- [ ] Manual test mobile viewport

## Notes

- SPEC-001 delivered good infrastructure (theme system, CSS vars, component patterns) — those are not throwaway work. The new homepage builds on that foundation with a completely different interaction model and palette.
- The copy is the soul of this page. Don't start coding scenes until the copy drafts feel right. Bad authentic copy is worse than bad corporate copy.
- Three.js canvas components need careful lifecycle management in Next.js App Router — look at existing Three.js usage in the codebase for patterns already established.
- Inspiration for interaction model: [Bruno Simon](https://bruno-simon.com), [activetheory.net](https://activetheory.net), [lusion.co](https://lusion.co) — not to copy, but to calibrate ambition level.
- Inspiration for personality-first copy: Julia Evans (b0rk.sh), Cassidy Williams, Devon Zuegel, Maggie Appleton.
- The "now" section (nownownow.com concept) is the lowest-effort highest-authenticity content idea on this page — prioritize it.
