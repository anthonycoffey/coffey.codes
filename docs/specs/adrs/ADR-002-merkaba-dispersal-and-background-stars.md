---
id: ADR-002
title: "Separate Merkaba dispersal from the background star field"
status: accepted
date: 2026-04-17
deciders: [coffey]
supersedes: ""
superseded_by: ""
---

# ADR-002: Separate Merkaba dispersal from the background star field

## Status

`accepted`

## Context

The homepage cinematic sequence (`components/canvas/WorldCanvas.tsx`) opens with a green Merkaba formation that is intended to "disperse into stars" as the user begins scrolling. The original implementation represented the Merkaba and the dispersed star field as a single `<points>` object whose per-particle positions were blended between two pre-computed targets:

- `MERKABA_POSITIONS` — 2000 samples of the Merkaba solid
- `STAR_POSITIONS` — 2000 points scattered across an 80×80 xy region, z ∈ [-65, -180]

A `formFactor` value (1 while formed, 0 once dispersed) drove both the position blend and the material's color/opacity. A separate static 1500-point background star field was also present but was visually redundant with the dispersed Merkaba.

Three defects emerged from this design during QA of the cinematic:

1. **Opacity discontinuity.** The opacity formula contained a hard step (`formFactor > 0.01 ? formFactor * 0.7 : 0.6`). As `formFactor` crossed 0.01, opacity jumped ~85× in one frame, producing a visible flash around `scrollProgress ≈ 0.24`.
2. **Position lag.** Positions were lerped toward the blended target at `LERP_SPEED = 0.04` per frame, on top of an already-smoothstepped `formFactor` and GSAP's `scrub: 1` scroll smoothing. The resulting catch-up lag caused a compact, non-green cluster of particles to flash between scroll steps while the scroll-driven target had already moved to the spread-out star field.
3. **"Stars reappearing" later in the scroll.** The `CameraRig` dollies forward through the scroll (from `[0,0,4]` to `[0,1,-56]`). Because the dispersed particle cloud was anchored in world space in the z ∈ [-65, -180] band, the camera moved into denser regions of it, making the star field appear to "gain stars" after dispersal had supposedly completed. This was structural — no opacity or position tweak could fix it while the Merkaba and star field shared an object.

The root cause of all three defects was the same: a single particle system was being asked to serve two fundamentally different visual roles (a defined geometric formation and an ambient background texture). The transition between them required compromises on opacity, position, and lifetime that no smoothing curve could fully hide.

## Decision

The Merkaba and the background star field are now two separate, single-purpose objects:

- **Merkaba `ParticleSystem`** is a finite, scroll-driven *event*. Each particle has a pre-computed random outward unit vector (`DISPERSE_DIRECTIONS`) and a per-particle speed multiplier (`DISPERSE_SPEEDS`, 0.6×–1.8×). A scroll-derived `disperse ∈ [0,1]` factor drives position (`merkaba + dir * disperse * DISPERSE_DISTANCE * speed`), opacity (`(1 - disperse) * 0.75`), and rotation. Once `disperse >= 1`, the `<points>` object sets `visible = false`, which removes it from the Three.js draw list entirely.
- **Background star field** (`BG_STAR_POSITIONS`, 1500 points across 160×160 xy) is the sole, constant source of stars throughout the entire cinematic. It is static, never animated, and never interacts with the Merkaba.

Positions are now a pure function of `scrollProgress` — no per-frame IIR, no secondary lerp — so the animation is fully deterministic and reversible.

Implemented in `components/canvas/WorldCanvas.tsx`.

## Consequences

### Positive

- The "rogue stars reappearing" artifact is structurally impossible: after dispersal, the Merkaba object is not rendered, so camera motion cannot reveal any particles from it.
- The opacity and position discontinuities are eliminated because all derived values are smooth functions of `disperse`, which is itself smoothstep-eased over scroll.
- Clear separation of concerns: the Merkaba owns its explosion; the background owns the ambient stars. Either can be tuned in isolation.
- The cinematic is reversible — scrolling back up reconstitutes the Merkaba cleanly, with no state accumulation.
- Dead code removed: `STAR_POSITIONS`, `STAR_SPREAD_XY`, `INITIAL_POSITIONS`, `COLOR_WHITE`, and `LERP_SPEED` are no longer needed.

### Negative / Trade-offs

- The original "morph-into-stars" metaphor is gone. The Merkaba now visibly *explodes and vanishes* rather than *dissolving into the background*.
- The background star field must carry the full ambient-space aesthetic on its own. If it feels sparse, `BG_STAR_COUNT` and/or `<pointsMaterial>` size/opacity in `WorldCanvas.tsx` are the single point of adjustment.
- Per-particle outward directions and speeds are computed once at module load with `Math.random()`. The result is stable for the lifetime of the module but will differ between page loads. This is intentional (no seeded RNG) and consistent with the existing background-star generation.

### Neutral

- A new tuning constant, `DISPERSE_DISTANCE` (default `10`), controls how far each particle drifts before becoming invisible.
- The opacity ramp is linear in `disperse`. A documented alternative is `(1 - disperse)²`, which holds brightness during the initial outward motion and snaps dark near the end (noted inline in the source).

## Alternatives Considered

### Option A: Patch the single-object design in place

- **Description:** Keep the Merkaba and star field as one `<points>` object. Smooth the opacity step, remove the position lerp, retune the curves.
- **Pros:** Minimal diff; preserves the original aesthetic of a continuous morph.
- **Cons:** Does not address the root cause. Camera forward-dolly still enters the dispersed cloud and visually "adds stars" later in the scroll regardless of curve shaping.
- **Why rejected:** The defect is structural (shared world-space particles + moving camera), not parametric. Empirically confirmed by iterative patching — each curve fix revealed the next artifact.

### Option B: Hide the dispersed particles once `formFactor = 0`

- **Description:** Keep the morph, but set `visible = false` after dispersal completes.
- **Pros:** Fixes the "reappearing stars" issue without a redesign.
- **Cons:** Makes the background feel suddenly empty at `scroll ≈ 0.25`. Forces a second static star field to compensate, which is what the accepted design does anyway — but retaining the unified object buys nothing in return.
- **Why rejected:** Equivalent visual result to the accepted design but with more intertwined state. No advantage.

### Option C (accepted): Split into two single-purpose objects

- **Description:** Merkaba is a finite outward explosion that hides itself; background stars are a separate static object.
- **Pros:** Structurally prevents all three defects; clean separation of concerns; simpler per-object logic.
- **Cons:** Sacrifices the literal "dissolves into stars" reading of the cinematic in favor of an "explodes into void" reading.
- **Why accepted:** Only option that eliminates the root cause rather than masking it.

## Notes

- Implementation: `components/canvas/WorldCanvas.tsx`
- Related components: `components/canvas/CameraRig.tsx` (forward-dolly keyframes), `components/ScrollContainer.tsx` (scroll progress source)
- Merkaba sampling utility: `utils/merkaba.ts`
