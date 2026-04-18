---
id: SPEC-002
title: "Homepage Scene Cross-Platform Glow Fix"
status: draft
created: 2026-04-18
author: Anthony Coffey
reviewers: []
affected_repos: []
---

## Reviewer Notes

<!-- Leave empty until code review. When requesting changes, reviewer adds feedback here: -->

---

# Feature: Homepage Scene Cross-Platform Glow Fix

## Problem

The galaxy core in the homepage Three.js scene renders as a flat, opaque yellow sphere on macOS/Chrome
(Metal renderer) but glows warmly on Windows/Chrome (DirectX). The root cause is a missing explicit tone
mapping on the `Canvas`, which defaults to Three.js's linear tone mapping. Linear tone mapping clamps
over-bright emissive values (>1.0) to a flat, saturated color on macOS Metal instead of gracefully
rolling them off into a warm glow. Compounding this, the galaxy core mesh has `emissiveIntensity={6}`
without `toneMapped={false}`, so its HDR value is clamped before reaching the existing Bloom
post-processor. The Bloom `luminanceThreshold` of `0.8` is also mismatched for an ACESFilmic pipeline.

## Requirements

### Must have

1. WHEN the scene renders on any platform, the galaxy core SHALL appear as a warm glowing star with
   soft bloom halo, not a flat yellow sphere.
2. WHEN the Canvas initializes, it SHALL use `ACESFilmicToneMapping` to ensure consistent over-bright
   highlight handling across Metal (macOS) and DirectX (Windows).
3. WHEN the galaxy core material renders, it SHALL use `toneMapped={false}` so its HDR emissive value
   bypasses the tone mapper and feeds directly into the Bloom post-processor (consistent with
   how Spaceship bright emissives are implemented).
4. WHEN the Bloom effect evaluates luminance, it SHALL only bloom true HDR values (>1.0 linear),
   with threshold set to `1.0`.

### Nice to have

- Verify no visual regression on UFO cyan glow, Satellite antenna, Spaceship thrusters after tone
  mapping change.

### Non-goals (what this does NOT do)

- This spec does NOT add a Sprite/Halo glow mesh (redundant — Bloom pipeline already exists).
- This spec does NOT use the `flat` Canvas prop (bypasses color management, degrades quality).
- This spec does NOT change the explicit `colorSpace` (Three.js r152+ defaults to sRGB output).
- This spec does NOT refactor other scene objects or add new visual features.

## Design

Three targeted edits across two files:

### 1. `components/canvas/WorldCanvas.tsx` — Canvas `gl` props (line ~161)

Add `toneMapping` and `toneMappingExposure` to the existing `gl` object:

```jsx
import * as THREE from 'three'

// Before
gl={{ antialias: false, alpha: true }}

// After
gl={{ antialias: false, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1 }}
```

### 2. `components/canvas/objects/Galaxy.tsx` — Galaxy core sphere material (line ~461)

Lower `emissiveIntensity` from `6` to `1.5` and add `toneMapped={false}`:

```jsx
// Before
<meshStandardMaterial
  color="#fffde0"
  emissive="#ffe895"
  emissiveIntensity={6}
/>

// After
<meshStandardMaterial
  color="#fffde0"
  emissive="#ffe895"
  emissiveIntensity={1.5}
  toneMapped={false}
/>
```

`toneMapped={false}` is already used on all Spaceship bright emissive meshes (nozzles, nav lights,
engine fire) for the same reason — the raw HDR value must reach the Bloom compositor without being
clamped by the tone mapper.

### 3. `components/canvas/WorldCanvas.tsx` — Bloom threshold (line ~201)

Change `luminanceThreshold` from `0.8` to `1.0`:

```jsx
// Before
<Bloom luminanceThreshold={0.8} luminanceSmoothing={0.3} intensity={1.5} mipmapBlur />

// After
<Bloom luminanceThreshold={1.0} luminanceSmoothing={0.3} intensity={1.5} mipmapBlur />
```

With ACESFilmic tone mapping, a threshold of `1.0` correctly selects only true HDR values for
bloom, preventing over-blooming of moderately bright scene elements (planet atmospheres, etc.).

## Edge cases

- [ ] Galaxy core `toneMapped={false}` may cause the sphere to appear slightly differently in
  very dark scenes — verify at all camera keyframe positions during scroll.
- [ ] ACESFilmicToneMapping shifts warm colors slightly (slight desaturation of extreme yellows)
  — verify the galaxy core warm-white color `#fffde0` / `#ffe895` still reads correctly.

## Acceptance criteria

1. On macOS/Chrome, the galaxy core renders as a soft glowing star with visible bloom halo, not a
   flat yellow sphere.
2. On Windows/Chrome, visual appearance is consistent with macOS after this change.
3. UFO cyan glow, Satellite antenna glow, and Spaceship thruster fire are visually unchanged.
4. `npm run build` completes with zero TypeScript errors.
5. `npm run lint` passes with no new warnings.

## Constraints

- Changes must not impact scene performance (no new render passes, no new geometries).
- Must remain compatible with `@react-three/postprocessing ^3.0.4` and `three` version already
  in use.

## Tasks

- [ ] Add `toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1` to Canvas `gl` prop in `WorldCanvas.tsx`
- [ ] Ensure `THREE` is imported in `WorldCanvas.tsx`
- [ ] Lower galaxy core `emissiveIntensity` from `6` to `1.5` in `Galaxy.tsx`
- [ ] Add `toneMapped={false}` to galaxy core `meshStandardMaterial` in `Galaxy.tsx`
- [ ] Change Bloom `luminanceThreshold` from `0.8` to `1.0` in `WorldCanvas.tsx`
- [ ] Visual QA: scroll full homepage on macOS Chrome — verify galaxy core glows, no regressions

## Notes

- The existing Bloom post-processor (`luminanceThreshold`, `mipmapBlur`, `intensity=1.5`) is
  already well-configured; the issues are upstream of it, not within it.
- The Spaceship component is the reference implementation for the correct pattern — see
  `components/canvas/objects/Spaceship.tsx` for `toneMapped={false}` usage on engine fire meshes.
- The Sprite/Halo pattern from the suggestion is a valid mobile fallback only if removing the
  EffectComposer for performance; not applicable here.
