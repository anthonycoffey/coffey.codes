---
id: ADR-003
title: "Cinematic scene polish: UFO, Galaxy, and Satellite tuning"
status: accepted
date: 2026-04-18
deciders: [coffey]
supersedes: ""
superseded_by: ""
---

# ADR-003: Cinematic scene polish — UFO, Galaxy, and Satellite tuning

## Status
`accepted`

## Context
After ADR-001 (scroll-driven cinematic architecture) and ADR-002 (Merkaba dispersal / background-star split) landed, a follow-up polish sprint ran against the shipped homepage. The overall architecture is unchanged — one `WorldCanvas`, one shared `scrollProgress` ref, objects composed additively. What changed was the *behavior* of three scene objects after extended visual review revealed weak beats, scrubbing bugs, and a satellite whose entire purpose was invisible most of the time.
This ADR documents the tuning and small redesigns that produced the current look in `components/canvas/objects/UFO.tsx`, `components/canvas/objects/Galaxy.tsx`, and `components/canvas/objects/Satellite.tsx`, so future readers can follow the evolution from the original cinematic to the current one without having to diff git history.

## Decision
Three of the scene objects were retuned or redesigned in place. No new files, no changes to the scroll-progress plumbing or camera rig.

### UFO — faster spin, tighter bob, hotter belly glow
The UFO's S-curve flyby structure (enter right, hover left of center, sweep past the camera with underside reveal) is preserved exactly as in ADR-001. Only parameters and one light changed, to make the object read more clearly as a "classic" UFO during its on-screen window:
- `IDLE_SPIN` raised to `2` rad/s (from `0.8`) — ~2.5× faster yaw, the spin now reads as the defining feature.
- `HOVER_FREQ = 1.5`, `HOVER_AMP = 0.3` — a shorter-period, slightly bigger bob during Phase 1 hover.
- Belly `pointLight`: `#8b5cf6`, intensity `20`, distance `1`, position `[0, -0.3, 0]` — a very hot, very tight underside glow. Distance is deliberately small so the light does not leak onto surrounding geometry.
- Group `scale={2}` retained.
- Perimeter cyan/green perimeter `pointLight`s, phase choreography, persistent-spin branch structure, and S-curve flyby path are all unchanged.

### Galaxy — fewer, clearer stars, orbital lanes, and Kepler-differentiated planets
The Galaxy object in ADR-001 was always rendered and rushed in from deep z late in the scroll. The geometry and motion windows are preserved; the internal composition was reworked to look more like a real disc galaxy and to make the planet orbits legible on their own.
Star field changes:
- `GALAXY_COUNT`: `3000` → `1000`. The spiral reads as a spiral, not a soup, once the camera is close enough to resolve individual points.
- `CORE_GAP`: `3.2` → `6`. A substantially larger starless "eye" around the sun so the glowing core sphere never has stars drawn in front of it.
- `GALAXY_SPIN`: `0.24` → `0.2` rad/s.
- `STAR_MAX_R = 24` star-radius clamp retained; warm-inner/cool-outer per-vertex gradient (`#ffe3a6` → `#f7faff`) retained.
Orbital lanes (new):
- `LANE_RADII = [4, 13, 20]`, `LANE_HALF_WIDTH = 0.6`. The star generator rejection-samples (up to 12 attempts per star) any radius that falls within ±0.6 of a planet's orbital radius. The net effect is three narrow dust-clear bands in the disc at the planet orbital radii — visually reads as Cassini-style divisions, structurally guarantees planets never intersect a star.
- This unlocks Kepler-rate differential orbits (`ORBIT_DW_REF = 0.06` at `ORBIT_R_REF = 13`, scaled as `(ORBIT_R_REF / r)^1.5`) without any collision risk. Inner planets now visibly lap outer planets within a normal viewing window (~18 s, ~105 s, ~200 s laps for Planets 1/3/2).
Planet redesigns:
- Planet 1 (`r = 9` → `r = 4`, tight inner orbit inside the old core gap): icosahedron radius `0.6` → `0.4`; palette flipped from sage (`#7a8a5a`) to warm gold (`#D9B763`, emissive `#CD9E26`). Single pale moon retained.
- Planet 2 (`r = 17` → `r = 20`, outer gas giant): icosahedron radius `0.7` → `0.75`; emissive intensity `0.5` → `1`; moon pulled in `1.9` → `1.5` and recolored pale ice-blue (`#B8ECF6`) from tan; ring particle system (`RING_COUNT = 200`, inner `1.1`, outer `1.6`, Keplerian swirl) retained.
- Planet 3 (`r = 13`, middle terrestrial): icosahedron radius `0.5` retained; palette shifted from terracotta to deep forest green (`#3A6225`, emissive `#3A6225`); second moon removed — Planet 3 now has a single moon (size `0.15`, speed `0.8`, radius `0.9`, steep inclination ~35 rad).
- Terrestrial axial spin: `2π/17` → `2π/15` (slightly faster). Gas-giant axial spin, axial tilts, wobble amplitude, and precession periods unchanged.
Docstrings and inline comments in `Galaxy.tsx` were updated to match these values so future readers are not misled by stale ranges.

### Satellite — always-visible continuous orbit with a tumbling-rock companion
This object went through the most iteration and the largest shape change. The evolution is worth recording because the mid-states are useful reference points, but only the final state is authoritative.
Iteration 1 — scroll-pure formula (fixed a disappear-on-scroll-up bug). Removed `activatedRef`, `activateTime`, and all wall-clock dependence from the satellite. Replaced with `angle = (progress - 0.50) * 5π`, making orbit angle a pure function of scroll progress. Fixed the "disappears on scroll up" regression by construction (no state to desync), but made the satellite motionless when the user stopped scrolling.
Iteration 2 — one-shot activation latch + time-based orbit. Reintroduced an `activatedRef` latch that sets exactly once when `scrollProgress` first crosses `ORBIT_ACTIVATE_PROGRESS = 0.42`, with orbit angle then driven by elapsed time at `ORBIT_SPEED = 0.21` rad/s. Scrolling back up parks the satellite at `HIDDEN_POS` without clearing the latch, so resumption on scroll-down is seamless. Fixed the "only visible during a single brief arc" issue by making the orbit self-perpetuating once triggered.
Iteration 3 — FOV-safe orbit center + opposing tumbling rock. The orbit center was pushed from `z = -42` to `z = -75` so every point on the orbit is within ±32° of the camera forward vector (camera FOV half ≈ 35°) during both the about-pan camera and the craft-window camera — guaranteeing the satellite is geometrically always visible while in scroll range. A companion tumbling rock was introduced as a second body on a perpendicular (XZ) plane with opposite phase and direction, smaller radius (18 vs 26), and three-axis irrational-ratio rotation for a never-repeating tumble. `ORBIT_SPEED` bumped `0.21` → `0.3`.
Iteration 4 (shipped) — drop the scroll gate entirely; share the orbit center with the rock. Feedback: the orbit should be visible at all scroll positions, including `0.00`, so the homepage feels alive from the moment the canvas mounts. The activation latch, `HIDDEN_POS`, and scroll-dependency were all removed; position is now driven purely from `clock.getElapsedTime()`. Separately, the rock's orbit was found to not share the satellite's planetary center, which read as unmotivated; this was corrected so both bodies orbit the *same* center, in the *same* plane, at the *same* radius, with the rock starting at `satInitial + π` (opposite side) and revolving at `-0.5` rad/s (reverse direction, faster than the satellite's `+0.3`). The two now drift past each other unpredictably as they share the orbit. Satellite attitude is also relaxed — a slow Y-axis spin (`0.1` rad/s) plus sinusoidal pitch (`±8°`) and roll (`±5°`) at distinct rates — producing a "drifting attitude" rather than a full tumble so the silhouette stays legible.
Final authoritative values (`components/canvas/objects/Satellite.tsx`):
- `ORBIT_CENTER = (0, -22, -75)`, `ORBIT_RADIUS = 26`, `ORBIT_SPEED = 0.3` rad/s.
- `INITIAL_SAT_ANGLE = π/4`, `SAT_SPIN_Y = 0.1`, `SAT_WOBBLE_X_AMP = 0.14`, `SAT_WOBBLE_Z_AMP = 0.09`.
- Rock shares `ORBIT_CENTER`/`ORBIT_RADIUS`, starts at `INITIAL_SAT_ANGLE + π`, revolves at `-0.5` rad/s, tumbles on three axes at (`0.7`, `1.3`, `0.5`) rad/s. Icosahedron `r = 1.5`, color `#9C9C9C`.
- Satellite group `scale={4}` to compensate for the pushed-back orbit-center distance.
- The `scrollProgress` prop is still threaded through for API consistency with the rest of the scene, but is unused in the render loop.

## Consequences
### Positive
- UFO's on-screen moment is more distinctive; the underside reveal lands harder with the hot belly light.
- Galaxy reads as a real disc galaxy at close range: core gap, dust-clear lanes, visibly differential orbits. Planets are chromatically distinct (gold / Neptune-blue / forest-green) rather than three muted earth-tones.
- Orbital lanes are a structural fix: planets cannot intersect the star field regardless of Kepler rate, so we can tune orbit speeds freely going forward.
- Satellite is a living element of the scene at every scroll position, not a brief scripted fly-by. The shared-center rock adds continuous unscripted motion without any additional authored timeline.
- Removing the activation latch eliminated the whole family of scroll-direction / reset bugs that dogged earlier iterations — position is a pure function of `clock.getElapsedTime()`.

### Negative / Trade-offs
- Galaxy star count dropped 3× (3000 → 1000). The spiral is sparser in wide shots; acceptable because we only ever see it at close range during its scripted approach.
- Planet 1's new inner orbit (`r = 4`) sits inside the old core gap and visibly transits the central sun on a tight lap. This is intentional but can produce a flash-through effect on some frames; if this becomes a problem a small z-depth offset is the obvious fix.
- Satellite runs continuously even when off-screen (`progress < 0.5`), consuming a small amount of per-frame work for no visual benefit in that range. The cost is negligible (two `useFrame` callbacks, trig-only) but the scroll prop is now dead weight.
- Rock color (`#9C9C9C`) is a medium grey; under bloom it can read slightly brighter than intended. Not adjusted here — left as a knob.

### Neutral
- Four sequential satellite iterations are preserved in this document as a design audit trail; only iteration 4 is in the source tree.
- The orbital geometry of satellite + rock is still being fine-tuned visually; further radius/phase adjustments are expected but do not warrant a new ADR unless the shape of the system (two bodies, shared center, opposite phase/direction) changes.

## Alternatives Considered
### Option A: Keep the scroll-gated satellite and fix the disappear bug with a latch only
- **Description:** Reinstate the `ORBIT_ACTIVATE_PROGRESS = 0.42` latch from iteration 2 with the FOV-safe center from iteration 3. Accept that the satellite is hidden before scroll ~0.42.
- **Pros:** Disciplined — each object owns a clear scroll window. Less GPU work outside that window.
- **Cons:** Satellite is absent for half the cinematic. The tumbling-rock companion has no reason to exist outside the window either, so the scene feels emptier up front.
- **Why rejected:** Feedback was explicit that the orbit should be visible at all scroll positions. Clear-window discipline was the wrong priority for this object.

### Option B: Keep three muted-earthtone planets in Galaxy
- **Description:** Retune orbit radii and spin rates but keep the original sage / Neptune-blue / terracotta palette and the two-moon Planet 3.
- **Pros:** Minimal diff; preserves existing palette work.
- **Cons:** At the new close-range camera distance, two earth-tone planets (sage + terracotta) were hard to tell apart. The second moon on Planet 3 added motion noise without clarity.
- **Why rejected:** Identifiability of individual planets matters more than palette continuity at this camera distance.

### Option C (accepted): Per-object targeted rework
- **Description:** As shipped — UFO parameter polish, Galaxy composition rework with orbital lanes, Satellite reshaped into a continuous two-body orbit.
- **Pros:** Each object's change is localized; no architectural churn.
- **Cons:** Three separate sets of tuning values to keep coherent — mitigated by aligning inline comments to current constants.
- **Why accepted:** Preserves ADR-001's additive-composition discipline while materially improving three of the weakest beats in the cinematic.

## Notes
- Implementation:
  - `components/canvas/objects/UFO.tsx`
  - `components/canvas/objects/Galaxy.tsx`
  - `components/canvas/objects/Satellite.tsx`
- Related ADRs: ADR-001 (scene architecture), ADR-002 (Merkaba / background-star split).
- Source spec: `docs/specs/active/SPEC-001-homepage-content-rewrite.md` (status: `complete`).
