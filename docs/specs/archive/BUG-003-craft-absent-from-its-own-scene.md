---
id: BUG-003
title: 'Homepage craft is absent for most of the scroll section built around it'
status: deprecated
severity: P2
created: 2026-10-27
author: 'Anthony Coffey'
reviewers: ['Anthony Coffey']
affected_repos: ['coffey.codes']
---

## Reviewer Notes

**Rejected 2026-10-28.** Not a bug — the craft's flight runs on the clock by design. See
[Resolution](#resolution--deprecated-the-clock-is-deliberate). The measurements in this
spec are sound and worth keeping; the premise is not.

---

# Bug: Homepage craft is absent for most of the scroll section built around it

> **This spec is deprecated.** It is kept because its measurements correct a published
> finding in [BUG-002](./BUG-002-spaceship-flyin-shader-compile-hitch.md) and because the
> next person to instrument this scene will otherwise rediscover the same thing and
> re-propose the same rejected change. Read the Resolution before acting on any of it.

## Description

The craft section of the homepage scroll — the "I solve big problems." panel, visible from
scroll `0.52` to `0.68` — is built around the spaceship. The craft is on screen for about
**1.7 seconds** of it, then leaves and does not come back however long the visitor stays.

The flight is driven by wall-clock time, not scroll position. Crossing `0.62` starts a 4.5s
animation; the craft is in frame for roughly `t = 1.6s` to `t = 3.3s` of it, flies past the
camera, and parks off screen at `x = -120`. A visitor who reads the panel, pauses, or scrolls
at any speed slower than that sees an empty starfield behind the copy that introduces the
craft.

## Steps to Reproduce

1. Load `/` on a desktop viewport (≥1024px) and enter the scene.
2. Scroll to roughly 64% of the track — inside the craft section, past the `0.62` trigger.
3. Stay there and read the panel.

## Expected Behavior

~~The craft is part of the scene for as long as the visitor is in the craft section, and its
position is a function of where they have scrolled — the same contract every other staged
entrance in the scene honours.~~

**This expectation was wrong.** The craft is a fly-by. It is expected to cross the frame
once, at its own pace, and be gone. See the Resolution.

## Actual Behavior

The craft crosses the frame once, over about 1.7 seconds, and is gone for the rest of the
visit to that section.

## Environment

- **Browser/Platform:** Chrome 1280x820, production build (`npm run build` + `npm start`)
- **GPU:** NVIDIA RTX 3080 via ANGLE / D3D11 (real hardware, not SwiftShader)
- **Version/Commit:** `7fb71d4` (main, with BUG-002 merged)
- **OS:** Windows 11

## Root Cause

Accurate as a description of the mechanism; wrong in calling it a fault.

[`Spaceship.tsx`](../../../components/canvas/objects/Spaceship.tsx) drives a **staged
entrance from `clock.getElapsedTime()`**:

```ts
if (progress < 0.62) {
  groupRef.current.position.set(250, 0, -80); // park off-frustum
  triggered.current = false; // re-arm
  return;
}
if (!triggered.current) {
  triggered.current = true;
  triggerTime.current = t; // wall-clock, captured once
}
const elapsed = t - triggerTime.current;
const flyT = Math.min(1, elapsed / 4.5);
groupRef.current.position.set(
  lerp(150, -120, flyT),
  lerp(1, 6, flyT),
  lerp(-180, 0, flyT),
);
```

Scroll is a **gate** — one threshold, which also re-arms. The clock is the **motion**.

Every other staged entrance in the scene is a pure function of scroll:

| Object            | Staged entrance                       | Idle motion            |
| ----------------- | ------------------------------------- | ---------------------- |
| UFO               | `progress` (`enterT`, `flyT`)         | `clock` (bob, spin)    |
| Galaxy            | `progress` (`groupZ`)                 | `clock` (orbital spin) |
| Planet            | `progress` (`localT`)                 | `clock` (rotation)     |
| Merkaba particles | `progress` (`disperse`)               | `clock` (spin)         |
| Satellite         | — (continuous orbit, never "arrives") | `clock`                |
| **Craft**         | **`clock`**                           | —                      |

This spec read that table as six rows of precedent and one row of defect. It is instead
five rows of scroll-driven staging, one continuous orbit, and **one deliberate clock-driven
fly-by**. The UFO is the scroll-driven flyby; the craft is not meant to be a second one.

### Measurement

Draw calls per frame while parked at scroll `0.645` and holding still. The craft's hull is
~20 separate meshes, so it entering and leaving the frustum is unambiguous.

| Time since crossing `0.62` | Draws / frame                 |
| -------------------------- | ----------------------------- |
| 0.0 – 1.3s                 | 25 (craft not yet in frame)   |
| 1.6s                       | 30                            |
| 1.8s                       | 54                            |
| 2.1s                       | 68                            |
| **2.4 – 3.2s**             | **72** (craft fully in frame) |
| 3.4s onward, indefinitely  | 25                            |

Steady state for this scroll position is 25 draws per frame. The craft is drawn between
roughly `t = 1.6s` and `t = 3.3s`, then not again until the visitor scrubs back below `0.62`
and returns.

Draw calls per frame are a reliable "is this object being rendered" probe for this scene, and
that is the durable finding here. Two traps, both hit while building a test on it: the scene
is **not** static at a fixed scroll position (the satellite orbits and the rocks tumble
through the frustum, worth ~33 draws on their own, so any window has to span a full ~12s
orbit to be stable), and two different scroll positions are **not** comparable as
baselines — 0.45 still has the UFO flyby and reads *higher* than the craft section does.

## Correction to BUG-002

This part stands and is the reason the spec is kept.

[BUG-002](./BUG-002-spaceship-flyin-shader-compile-hitch.md) recorded, under Out of scope, a
"steady-state cost step" of roughly +60% per frame while the craft is on screen, and proposed
it as follow-up work. **That finding was an artifact of the environments it was measured
in** — an occluded browser pane throttled to ~1fps, and headless Chromium rendering WebGL
through SwiftShader in software.

Re-measured on the GPU above, holding at three scroll positions:

|                        | Frame time median | p95    | At 6x CPU throttle (median) |
| ---------------------- | ----------------- | ------ | --------------------------- |
| Craft absent (0.55)    | 6.1 ms            | 7.6 ms | 13.9 ms                     |
| Craft on screen (0.70) | 6.1 ms            | 7.2 ms | 14.0 ms                     |
| Craft gone (0.90)      | 6.1 ms            | 7.5 ms | 13.0 ms                     |

6.1 ms is this display's vsync interval (164 Hz), so all three phases are capped by the
refresh rate rather than by work. Throttling the CPU 6x to force real competition for the
frame budget moves the craft's cost to about **0.1 ms median**, inside the noise — and that
is with nearly 3x the draw calls (72 vs 25). The craft is cheap.

So there is no steady-state cost to fix, and the thrust-instance / point-light / bloom work
that BUG-002 proposed as a follow-up should **not** be done. The archived spec has been
amended to say so rather than left to mislead.

## Resolution — deprecated, the clock is deliberate

Decided 2026-10-28, after review of an implementation that put the flight on scroll
(branch `fix/craft-flyin-scroll-driven`, PR #253, closed unmerged).

**The craft's fly-by runs on the clock by design, and the UFO is meant to remain the scene's
only scroll-driven flyby.** Running on the clock means the pass plays at its own fixed pace —
the same 4.5 seconds for every visitor, regardless of how fast they turn the wheel. That
property is the point of the move, and it is precisely what a scroll-driven flight cannot
have.

### Why attaching the flight to scroll is the wrong trade

Three consequences, none of them avoidable by tuning, all demonstrated by the rejected
implementation:

1. **Scroll becomes the throttle.** Flight speed ends up proportional to scroll speed. Scroll
   slowly and a charge past the camera plays in slow motion. A fly-by that runs at the speed
   of someone's scroll wheel is not a fly-by.
2. **A threshold becomes a band.** `f(scroll)` needs a start *and* an end, so the single
   `0.62` gate turns into a tuned interval (`0.60 → 0.72` in the rejected version) — two
   numbers that no test can pin, because whether a given position is clear of the frustum
   depends on the camera's own scroll-driven position and on the viewport's aspect ratio.
3. **Explicit hiding becomes mandatory.** The `(250, 0, -80)` park has nowhere to live once
   position is defined at every scroll value: below the band the craft sits at the start of
   its path, which is **on screen** at wide aspect ratios (measured at NDC x ≈ 0.65 on a
   1600x900 window) for the whole first half of the scroll. The fix for that is a visibility
   toggle — and it has to skip the craft's two engine lights, because three.js gathers lights
   with `traverseVisible` and dropping the scene from 8 point lights to 6 changes every
   material's program cache key, silently undoing all of BUG-002.

A first attempt also reshaped the path endpoints and widened the band to keep the craft in
frame across the whole panel. That flattened the charge toward the camera into a sideways
drift and was rejected on sight. Reverting it to the original endpoints left (1), (2) and
(3) intact, which is what settled the question: the problem was the approach, not the tuning.

### What this report got wrong

- **"The flight replays from the beginning if you scroll back and return"** was written up as
  a defect. It is not: `triggered.current = false` in the `progress < 0.62` branch already
  re-arms the flight, so scrubbing back and returning replays it deliberately. That is the
  behaviour you would want, and it was already working.
- **The 1.7-seconds-of-a-0.52–0.68-section framing** is arithmetically right and beside the
  point. A fly-by is transient; being in frame for a slice of its section is what the move
  is. The UFO's flyby works the same way.
- **Nobody reported this.** It was found by instrumenting draw calls while diagnosing
  BUG-002, and the only symptom a visitor can actually meet is the mild one: stop inside the
  section and the sky behind the panel empties until you scrub back below the trigger.

### What was kept

One thing from the rejected branch shipped separately: `SceneWarmup` in
[`WorldCanvas.tsx`](../../../components/canvas/WorldCanvas.tsx) is now keyed on the scene's
composition, so crossing the 1024px breakpoint mid-session remounts it and recompiles over
the new scene. Without it, a craft that mounts after the warm-up has run has cold programs
and brings the BUG-002 stall back once. That has nothing to do with the flight and closes a
hole BUG-002 had documented as acceptable.

### Do not re-open this

A future pass instrumenting this scene will find the same clock/scroll split, read the same
table above, and reach the same conclusion this spec did. It has been tried, reviewed and
rejected. If the craft's presence in its section ever does need changing, the lever is the
`0.62` gate or the 4.5s duration in
[`Spaceship.tsx`](../../../components/canvas/objects/Spaceship.tsx) — not the driver.

## Notes

Related history:

- [BUG-002](./BUG-002-spaceship-flyin-shader-compile-hitch.md) — the fly-in stall that was
  actually reported, and fixed. Its "Out of scope" list is where this bug came from, and both
  of its entries are now settled: the steady-state cost finding is withdrawn as an artifact,
  and the breakpoint-remount hole is fixed.
- [BUG-001](./BUG-001-homepage-scene-loads-after-enter.md) — the mount-behind-the-splash
  architecture both specs depend on.
