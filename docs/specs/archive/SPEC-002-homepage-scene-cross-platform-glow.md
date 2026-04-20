---
id: SPEC-002
title: "Homepage Scene Cross-Platform Glow Fix"
status: in-progress
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

The galaxy core in the homepage Three.js scene renders as either a flat opaque yellow sphere or a
sharp-edged orb on macOS/Chrome (Metal renderer) but glows warmly with soft feathering on
Windows/Chrome (DirectX). Two root causes compound each other:

1. **Missing tone mapping** — the Canvas defaulted to linear tone mapping, which clamps over-bright
   emissive values (>1.0) to a flat saturated color on Metal instead of rolling them off gracefully.
2. **Missing bloom feathering controls + Retina DPR** — `radius` and `levels` were absent from the
   Bloom pass, producing a tight ring with a hard falloff. On macOS Retina (2× DPR), the bloom kernel
   runs in texels at 2× pixel density, making the spread appear visually half as wide as on Windows —
   resulting in a sharp-edged halo with no soft feather.

## Requirements

### Must have

1. WHEN the scene renders on any platform, the galaxy core SHALL appear as a warm glowing star with
   soft feathered bloom halo, not a flat yellow sphere or sharp-edged orb.
2. WHEN the Canvas initializes, it SHALL use `ACESFilmicToneMapping` to ensure consistent over-bright
   highlight handling across Metal (macOS) and DirectX (Windows).
3. WHEN the galaxy core material renders, it SHALL use `toneMapped={false}` so its HDR emissive value
   bypasses the tone mapper and feeds directly into the Bloom post-processor.
4. WHEN the Bloom effect evaluates luminance, it SHALL use `radius={0.85}` and `levels={9}` for soft
   feathered falloff, with `luminanceThreshold={0.9}` for reliable activation.
5. WHEN rendering on Retina/high-DPR screens, the Canvas SHALL cap DPR at 1.5 so the bloom kernel
   spreads proportionally in visual pixels across all screen densities.

### Nice to have

- Vignette post-processing effect for cinematic depth.
- No visual regression on UFO cyan glow, Satellite antenna, Spaceship thrusters.

### Non-goals (what this does NOT do)

- This spec does NOT add a Sprite/Halo glow mesh (redundant — Bloom pipeline already exists).
- This spec does NOT use the `flat` Canvas prop (bypasses color management, degrades quality).
- This spec does NOT change the explicit `colorSpace` (Three.js r152+ defaults to sRGB output).
- This spec does NOT refactor other scene objects or add new visual features.

## Design

All changes are in `components/canvas/WorldCanvas.tsx` and `components/canvas/objects/Galaxy.tsx`.

### 1. Canvas — `dpr` cap + `gl` tone mapping

```jsx
<Canvas
  camera={{ position: [0, 0, 4], fov: 70 }}
  dpr={[1, 1.5]}
  gl={{ antialias: false, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1 }}
>
```

`dpr={[1, 1.5]}` caps Retina at 1.5× so the bloom kernel spreads ~33% further in visual pixels
on macOS compared to uncapped 2×.

### 2. EffectComposer — disable MSAA

```jsx
<EffectComposer multisampling={0}>
```

Consistent with `antialias: false` on the GL context. Avoids Metal-specific MSAA edge cases
when post-processing is active.

### 3. Bloom — feathering props + threshold

```jsx
<Bloom
  luminanceThreshold={0.9}
  luminanceSmoothing={0.3}
  intensity={1.5}
  mipmapBlur
  radius={0.85}
  levels={9}
/>
```

- `radius={0.85}` — primary feathering control; spreads bloom softly beyond the source boundary
- `levels={9}` — more mip levels = smoother gradient falloff across the halo
- `luminanceThreshold={0.9}` — gives the galaxy core (emissiveIntensity=1.5) comfortable headroom

### 4. Vignette effect

```jsx
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'

<Vignette eskil={false} offset={0.3} darkness={0.7} />
```

Single-pass effect added after Bloom. Darkens scene edges for cinematic depth at no geometry cost.

### 5. Galaxy core material (`Galaxy.tsx`)

```jsx
<meshStandardMaterial
  color="#fffde0"
  emissive="#ffe895"
  emissiveIntensity={1.5}
  toneMapped={false}
/>
```

`toneMapped={false}` ensures the raw HDR value reaches the Bloom compositor un-clamped, consistent
with how Spaceship bright emissives are handled.

## Edge cases

- [x] Galaxy core `toneMapped={false}` appearance verified across all camera keyframe positions.
- [x] ACESFilmicToneMapping color shift verified — warm-white `#fffde0` / `#ffe895` reads correctly.
- [ ] Vignette `darkness={0.7}` tunable if scene reads too dark on particular displays.

## Acceptance criteria

1. On macOS/Chrome, the galaxy core renders as a soft glowing star with feathered bloom halo.
2. On Windows/Chrome, visual appearance is consistent with macOS.
3. UFO cyan glow, Satellite antenna glow, and Spaceship thruster fire are visually unchanged.
4. `npm run build` completes with zero TypeScript errors.
5. `npm run lint` passes with no new warnings.

## Constraints

- Changes must not impact scene performance (no new render passes, no new geometries).
- Must remain compatible with `@react-three/postprocessing ^3.0.4` and `three` version already
  in use.

## Tasks

- [x] Add `toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1` to Canvas `gl` prop
- [x] Add `dpr={[1, 1.5]}` to Canvas
- [x] Add `multisampling={0}` to EffectComposer
- [x] Lower galaxy core `emissiveIntensity` from `6` to `1.5` in `Galaxy.tsx`
- [x] Add `toneMapped={false}` to galaxy core `meshStandardMaterial` in `Galaxy.tsx`
- [x] Change Bloom `luminanceThreshold` from `0.8` to `0.9`
- [x] Add `radius={0.85}` and `levels={9}` to Bloom
- [x] Add `Vignette` effect to EffectComposer
- [ ] Visual QA: scroll full homepage on macOS Chrome — verify soft feathered glow, no regressions
- [ ] Commit and merge PR

## Notes

- The Spaceship component is the reference implementation for `toneMapped={false}` — see
  `components/canvas/objects/Spaceship.tsx`.
- The Retina DPR issue is the likely primary cause of sharp edges post-SPEC-002 first pass —
  `dpr={[1, 1.5]}` combined with `radius={0.85}` should resolve it.
- The Sprite/Halo pattern from the original suggestion remains a valid mobile fallback only if
  removing the EffectComposer for performance; not applicable here.
