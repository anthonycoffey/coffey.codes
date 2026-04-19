---
id: ADR-004
title: "Fix Mobile Scroll Animation by Re-enabling GSAP ScrollTrigger"
status: proposed
date: 2026-04-18
deciders: [coffey]
supersedes: ""
superseded_by: ""
---

# ADR-004: Fix Mobile Scroll Animation by Re-enabling GSAP ScrollTrigger

## Status

`proposed`

## Context

The homepage relies on a continuous 3D cinematic scene (`WorldCanvas`) and text overlays (`HUDOverlay`) driven entirely by a shared `scrollProgress` ref, updated via GSAP's `ScrollTrigger`. In the initial implementation (as defined in ADR-001), a line of code inside `components/ScrollContainer.tsx` explicitly bypassed GSAP on viewports narrower than 768px:

```tsx
// Mobile: CSS handles vertical snap scroll — skip GSAP
if (window.innerWidth < 768) return
```

While this was historically valid for an earlier design using discrete CSS snap-scroll panels, it broke the new continuous 3D experience. Since GSAP was skipped on mobile, the `scrollProgress` value remained stuck at `0`, meaning mobile users experienced a static scene with no animations. Furthermore, mobile browsers present unique challenges for scroll-linked animations due to dynamically resizing address bars, which repeatedly alter the value of `100vh` and force costly layout recalculations.

## Decision

1. **Removed the Mobile Bypass:** Deleted the `if (window.innerWidth < 768) return` statement inside `components/ScrollContainer.tsx` to allow GSAP to track scroll progress on mobile viewports.
2. **Configured GSAP for Mobile Stability:** Added `ScrollTrigger.config({ ignoreMobileResize: true })` before initializing `ScrollTrigger`. This prevents GSAP from recalculating start/end positions every time the mobile browser's address bar collapses or expands during scrolling, which causes jitter.
3. **Switched to Dynamic Viewport Heights (`dvh`):** Replaced `100vh` with `100dvh` in `app/page.module.sass` and the inline styles of `ScrollContainer.tsx`. The `dvh` unit adapts dynamically to the appearance/disappearance of the mobile browser UI, ensuring the canvas always fully covers the visible viewport without causing scroll-jumps.

## Consequences

### Positive

- The 3D cinematic scroll animation and HUD overlays now function correctly on mobile devices.
- Ignoring mobile resize events in GSAP stabilizes the animation during address bar transitions.
- Utilizing `100dvh` ensures the canvas accurately covers the viewport without unwanted vertical overflow or dead space when the browser UI shifts.

### Negative / Trade-offs

- Running GSAP and the full 3D rendering loop on mobile scroll entails a higher performance budget than a static page or CSS-only snap scrolling.
- Mobile devices may experience faster battery drain while actively scrolling through the homepage scene.

### Neutral

- Unit tests for `ScrollContainer` required updates to mock `ScrollTrigger.config` properly, as it is now being explicitly called.

## Alternatives Considered

### Option A: Maintain CSS Snap Scrolling on Mobile
- **Description:** Leave GSAP disabled on mobile, and somehow rewrite the `HUDOverlay` text and `WorldCanvas` logic to react to native CSS snap-scroll events or Intersection Observers instead of `scrollProgress`.
- **Pros:** Reduces Javascript overhead.
- **Cons:** Fractures the architecture. It would require maintaining two completely distinct interaction paradigms (GSAP for desktop, Intersection Observers for mobile) and would strip the 3D timeline-driven cinematic feel from mobile devices entirely.
- **Why rejected:** The cinematic scroll is the primary aesthetic goal of the homepage.

## Notes

- Modifies `components/ScrollContainer.tsx` and `app/page.module.sass`.
- Relevant specs: `docs/specs/active/SPEC-001-homepage-content-rewrite.md`.
- Builds upon architectural decisions defined in `ADR-001`.
