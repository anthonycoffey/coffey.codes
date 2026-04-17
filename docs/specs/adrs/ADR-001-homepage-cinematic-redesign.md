---
id: ADR-001
title: "Homepage redesign as a scroll-driven 3D cinematic"
status: accepted
date: 2026-04-17
deciders: [coffey]
supersedes: ""
superseded_by: ""
---

# ADR-001: Homepage redesign as a scroll-driven 3D cinematic

## Status

`accepted`

## Context

The prior homepage was a vertical brochure — services list, logo grid, testimonials, corporate CTA. It was pleasant, forgettable, and indistinguishable from any other contractor site. The business goal is to attract higher-quality work by being *memorable and evidently skilled*, not by pitching. The decision to rebuild the homepage around a scroll-driven cinematic originates in `SPEC-002-homepage-content-rewrite.md` (now `complete`). This ADR records the architectural shape of the implementation as shipped on the `feature/homepage-cinematic-rebuild` branch, which diverges from the original spec in several ways.

## Decision

The homepage is a single continuous Three.js scene driven by vertical scroll. A GSAP `ScrollTrigger` watches a tall scroll-spacer div and publishes a normalized `scrollProgress` ref (0 → 1); the Three.js scene and a text HUD both consume that ref and evolve deterministically along its timeline. There is no pinning, no horizontal scroll, no per-scene React component tree. The entire experience is one `WorldCanvas`.

### Architecture

- `app/page.tsx` → `<ScrollContainer />`
- `ScrollContainer` renders a tall spacer (`600vh`) that provides scroll length, with a `position: fixed` inner layer at `100vw × 100vh` holding `<WorldCanvas>` and `<HUDOverlay>`. `ScrollTrigger` reports `self.progress` into a shared `scrollProgress` ref. This layout replaces GSAP's `pin: true` pattern to avoid React-reconciliation conflicts on route changes (see ADR-002 for the related particle-system redesign; the pin-removal decision is captured here).
- `WorldCanvas` is a dynamically-imported (`ssr: false`) R3F `<Canvas>` containing `CameraRig` + a fixed list of scene objects + an `EffectComposer` with `Bloom`.
- `HUDOverlay` is a React component (not WebGL) that fades text panels in and out based on `scrollProgress` thresholds.

### Scene graph (as shipped)

| Object | File | Role | Scroll window |
|---|---|---|---|
| `CameraRig` | `components/canvas/CameraRig.tsx` | Dolly through hand-authored keyframe path; camera never follows objects | 0 → 1 |
| Background stars | inline in `WorldCanvas.tsx` | 1500-point static field, sole ambient star source | always |
| `ParticleSystem` (Merkaba) | `WorldCanvas.tsx` | "Start" symbol; spins slowly, then explodes outward to the left and we fade opacity to 0 | 0 → 0.25 |
| `UFO` | `components/canvas/objects/UFO.tsx` | Enters right, hovers left-of-center, then sweeps up-and-right past the camera (rises above, passes into +Z) for a dramatic underside reveal | 0.15 → 0.52 |
| `Planet` | `components/canvas/objects/Planet.tsx` | Large sphere with atmospheric Fresnel glow; always rendered at `(0, -30, -50)`. Camera tilt reveals it into frame around 0.40–0.52; eclipse backlight intensity ramps 0→8 across 0.35–0.55 | always rendered; active reveal 0.35–0.55 |
| `Satellite` | `components/canvas/objects/Satellite.tsx` | Scroll-locked start, then orbits the Planet on a fixed angular velocity | 0.50 → end |
| `Spaceship` | `components/canvas/objects/Spaceship.tsx` | Rebel-style fighter with instanced-mesh thruster fire, flies past camera on a **time-based** path once scroll crosses its trigger | triggered at 0.62, then time-driven |
| `Galaxy` | `components/canvas/objects/Galaxy.tsx` | Spiral disc + core + three planets; always rendered, parked at `z=-220` (visible as a distant speck). Rushes to `z=-70` across 0.75–0.95, then closes to `z=-65` by 1.0, filling frame | always rendered; active motion 0.75–1.0 |
| `EffectComposer` / `Bloom` | `@react-three/postprocessing` | HDR bloom on emissive materials (engines, stars, galactic core) | always |

### Divergences from SPEC-002

The spec proposed a horizontal-scroll, five-pinned-panel layout with separate scene React components (`IntroScene`, `AboutScene`, `CraftScene`, `NowScene`, `ConnectScene`) and a particle-field canvas only in the intro. The shipped implementation is one continuous 3D scene with text overlays, not five discrete panels. The following specific changes were made during implementation:

- **No meteor.** The spec's meteor moment was cut.
- **No wormhole/gate.** Replaced with a solar-system sequence: a `Planet` in the foreground and a spiral `Galaxy` approaching from deep z late in the scroll.
- **Satellite retained but simplified.** The original "holograph" projection and its contents were cut (read poorly in testing). The satellite's path was rewritten from a static perch to a continuous orbit around the focal `Planet`, computed from a trigger-locked clock so it always starts at 3 o'clock when scroll first crosses 0.50.
- **Merkaba is a logo moment, not a morph.** Rather than forming and dissolving mid-scroll, the Merkaba renders as the opening brand symbol. The moment scroll begins, it spins with *exponential* angular velocity over a very short window — the visual reads as "spinning into pieces" — and then explodes outward and fully unmounts itself from the draw list. (Dispersal mechanics are the subject of ADR-002.)
- **UFO pathing re-authored.** The flyby was tightened to pass very close to the camera on a diagonal that reveals the underside lighting for maximum drama, rather than the wider arc originally planned.
- **Spaceship flyby added.** Not in SPEC-002. A rebel-fighter-style ship with an `InstancedMesh` thruster particle rig enters before the galaxy. Its trigger is scroll-position gated, but its motion is **time-driven** once triggered — it flies on its own clock regardless of further scroll input, so the sequence reads as a deliberate beat rather than a scrubbable animation.

## Consequences

### Positive

- The homepage is memorable: it is a *place*, not a page.
- A single shared `scrollProgress` ref is the only coupling between components; each object's behavior is a pure function of scroll progress (and in one case, elapsed time since a trigger). No cross-object state, no React re-renders driving the animation.
- The CSS-fixed + scroll-spacer layout avoids GSAP's `pin-spacer` DOM mutation, eliminating the class of reconciler-vs-DOM bugs that plagued the first pinning attempt.
- Scene composition is purely additive — adding a new object is a new file in `components/canvas/objects/` and one line in `WorldCanvas`.

### Negative / Trade-offs

- The homepage is WebGL-heavy. On low-end devices it will be more expensive than a traditional HTML page; the mitigation is `alpha: true` + `antialias: false` on the GL context and a small, bounded particle budget.
- SEO: the homepage has effectively no textual content in the server-rendered HTML; critical copy lives in the HUD overlays, which are client-rendered. Canonical identity and metadata still render server-side via `metadata` export, but search engines will not index the cinematic copy itself. Acceptable because the homepage is not the SEO entry point — articles are.
- The animation is authored, not generative. Adjusting the timeline means editing keyframe tables in `CameraRig.tsx` and per-object scroll thresholds; there is no shared timeline abstraction.
- Because one component's `triggered` state persists across scroll direction (the `Spaceship`'s time-based path), scrolling backward past its trigger does not cleanly "rewind" that object. Acceptable given the one-shot nature of the beat.

### Neutral

- Mobile falls back to native vertical snap-scroll via CSS media queries in `ScrollContainer`; GSAP is bypassed entirely on narrow viewports.
- The dark/vibrant palette direction from SPEC-002 (deep inky black base, neon accents) is realized in-scene through emissive materials + bloom rather than through CSS tokens alone.

## Alternatives Considered

### Option A: Ship the spec literally — horizontal scroll, five pinned scene panels

- **Description:** Implement the original SPEC-002 layout with five separate React scene components and horizontal translation under GSAP pinning.
- **Pros:** Familiar interaction pattern for "immersive portfolio" sites; clear per-scene separation of concerns.
- **Cons:** The per-scene architecture forces discrete cuts between moments. Our content is better told as a single continuous journey. Horizontal scroll pinning is also the exact GSAP configuration that produced the React-unmount `removeChild` error we later had to engineer around.
- **Why rejected:** The storytelling goal favored continuity; horizontal pinning did not survive contact with React 19 / Next.js App Router route transitions.

### Option B: Keep the vertical brochure, just refresh copy and palette

- **Description:** Leave the layout model alone, rewrite the corporate copy, repaint with the new palette.
- **Pros:** Cheapest; lowest risk; no new runtime dependencies exercised.
- **Cons:** Does not advance the core business goal (memorability, credibility-by-demonstration). The deliverable would still look like every other contractor site.
- **Why rejected:** Low ceiling. The point of the rebuild was to *be different*, not to tidy up.

### Option C (accepted): Single continuous 3D scene on a scroll timeline

- **Description:** One `WorldCanvas` containing all scene objects, driven by a single shared `scrollProgress` ref published by `ScrollTrigger`.
- **Pros:** Continuous narrative; trivial per-object extension; deterministic behavior; no pinning-related DOM conflicts.
- **Cons:** All-or-nothing WebGL dependency for the homepage; less conventional SEO posture.
- **Why accepted:** Best match for the storytelling goal and the lowest coupling architecture of the three.

## Notes

- Source spec: `docs/specs/active/SPEC-002-homepage-content-rewrite.md` (status: `complete`)
- Related ADR: `ADR-002` — the Merkaba particle system's dispersal redesign and its separation from the background star field.
- Implementation entry points:
  - `app/page.tsx`
  - `components/ScrollContainer.tsx`
  - `components/canvas/WorldCanvas.tsx`
  - `components/canvas/CameraRig.tsx`
  - `components/canvas/objects/` (per-object behaviors)
  - `components/overlay/HUDOverlay.tsx` (text beats)
