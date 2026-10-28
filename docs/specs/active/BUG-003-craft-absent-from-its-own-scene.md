---
id: BUG-003
title: 'Homepage craft is absent for most of the scroll section built around it'
status: review-pending
severity: P2
created: 2026-10-27
author: 'Anthony Coffey'
reviewers: ['Anthony Coffey']
affected_repos: ['coffey.codes']
---

## Reviewer Notes

<!-- Leave empty until code review. When requesting changes, reviewer adds feedback here: -->

---

# Bug: Homepage craft is absent for most of the scroll section built around it

## Description

The craft section of the homepage scroll — the "I solve big problems." panel, visible from
scroll `0.52` to `0.68` — is built around the spaceship. The craft is on screen for about
**1.7 seconds** of it, then leaves and does not come back however long the visitor stays.

The flight is driven by wall-clock time, not scroll position. Crossing `0.62` starts a 4.5s
animation; the craft is in frame for roughly `t = 1.6s` to `t = 3.3s` of it, flies past the
camera, and parks off screen at `x = -120`. A visitor who reads the panel, pauses, or scrolls
at any speed slower than that sees an empty starfield behind the copy that introduces the
craft.

Scrolling back below `0.62` re-arms it, so the flight replays from the beginning on the way
back down — the only object in the scene that does not simply scrub with the scroll.

## Steps to Reproduce

1. Load `/` on a desktop viewport (≥1024px) and enter the scene.
2. Scroll to roughly 64% of the track — inside the craft section, past the `0.62` trigger.
3. Stay there and read the panel.

## Expected Behavior

The craft is part of the scene for as long as the visitor is in the craft section, and its
position is a function of where they have scrolled — the same contract every other staged
entrance in the scene honours.

## Actual Behavior

The craft crosses the frame once, over about 1.7 seconds, and is gone for the rest of the
visit to that section. Scrolling back below `0.62` and returning replays the same 1.7s.

## Environment

- **Browser/Platform:** Chrome 1280x820, production build (`npm run build` + `npm start`)
- **GPU:** NVIDIA RTX 3080 via ANGLE / D3D11 (real hardware, not SwiftShader)
- **Version/Commit:** `7fb71d4` (main, with BUG-002 merged)
- **OS:** Windows 11

## Root Cause

[`Spaceship.tsx`](../../../components/canvas/objects/Spaceship.tsx) drives a **staged
entrance from `clock.getElapsedTime()`**:

```ts
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

Every other staged entrance in the scene is a pure function of scroll:

| Object            | Staged entrance                       | Idle motion            |
| ----------------- | ------------------------------------- | ---------------------- |
| UFO               | `progress` (`enterT`, `flyT`)         | `clock` (bob, spin)    |
| Galaxy            | `progress` (`groupZ`)                 | `clock` (orbital spin) |
| Planet            | `progress` (`localT`)                 | `clock` (rotation)     |
| Merkaba particles | `progress` (`disperse`)               | `clock` (spin)         |
| Satellite         | — (continuous orbit, never "arrives") | `clock`                |
| **Craft**         | **`clock`**                           | —                      |

That split is the right one everywhere else: continuous idle motion belongs on the clock,
a staged arrival belongs on the scroll. The craft has them swapped, so its arrival has a
duration of its own that the visitor cannot influence and cannot replay without leaving the
section and coming back.

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
roughly `t = 1.6s` and `t = 3.3s` and never again. Screenshots at `t ≈ 1.6s` and `t ≈ 5s`
from the same scroll position show the craft present, then an empty sky behind the same
panel.

## Correction to BUG-002

[BUG-002](../archive/BUG-002-spaceship-flyin-shader-compile-hitch.md) recorded, under Out of
scope, a "steady-state cost step" of roughly +60% per frame while the craft is on screen,
and proposed it as follow-up work. **That finding was an artifact of the environments it was
measured in** — an occluded browser pane throttled to ~1fps, and headless Chromium rendering
WebGL through SwiftShader in software.

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

## Fix

### WS1 — The flight is a function of scroll

[`utils/craftFlight.ts`](../../../utils/craftFlight.ts) holds the whole flight as two pure
functions, `craftFlightProgress(scroll)` and `craftPosition(scroll)`, following the
`utils/merkaba.ts` precedent of keeping scene maths out of the component.
[`Spaceship.tsx`](../../../components/canvas/objects/Spaceship.tsx) now sets its group
position from `craftPosition(progress)`; `triggered` and `triggerTime` are gone, and with
them the replay-on-return behaviour. Standing still holds the craft in place; scrubbing
back walks it out the way it came.

Two details worth recording:

- **No easing on the band.** The obvious `smoothstep` is wrong here. It compresses the
  middle of the path — the stretch where the craft is close enough to read — into a narrow
  slice of scroll, which is the original complaint in a new form. A straight clamp spreads
  the readable part of the flight across the section.
- **The path was shortened, not just re-timed.** Flying from `z = -180` to `z = 0` put the
  craft past the camera a third of the way in, so re-timing alone would have left it in
  frame for a small slice of the band. The path now runs `[110, 1, -120] → [-70, 6, -78]`,
  which keeps the craft in front of the camera for nearly the whole band while still
  closing from ~91 to ~32 units away, so it reads as an approach rather than a drift.

### WS2 — Lasers

Thrust particles stay on the clock: they cycle continuously and never finish, which is the
same rule the UFO's bob and the galaxy's spin follow. The laser volley is a travelling
projectile, so its flight stays on the clock too — driving a bolt from scroll would run it
backwards when the visitor scrubs back, which reads as broken rather than as scrubbing.
What scroll controls is the trigger: crossing `LASER_ARM_AT` fires the volley, dropping
back below re-arms it, so scrubbing back and forward lets you watch it again.

### WS3 — Re-warm after a breakpoint remount

`SceneWarmup` is keyed on `showSpaceship`, so crossing the 1024px breakpoint remounts it
and recompiles over the new scene. This closes the hole BUG-002 left open: a craft that
mounts after the warm-up has run otherwise has cold programs and brings the original stall
back once.

### Tests

- **Unit** — [`__tests__/utils/craftFlight.test.ts`](../../../__tests__/utils/craftFlight.test.ts),
  12 tests. The two that matter state the regression directly: the same scroll gives the
  same position every time it is asked, and gives the same position again after scrubbing
  across the whole track and back. The rest cover clamping, monotonicity and continuity at
  both band edges.

  Deliberately **no distance thresholds**. Whether a given x is clear of the frustum depends
  on the craft's z and on where the camera is at that scroll position, neither of which this
  module knows — and the choreography is expected to be tuned by eye, so pinned numbers would
  only break. The e2e test covers what actually matters.

- **E2E** — `Homepage craft presence` in [`e2e/homepage.spec.ts`](../../../e2e/homepage.spec.ts).
  Settles at scroll `0.645`, takes the peak draw count over twelve seconds, then over the
  next twelve, and asserts the second is at least 80% of the first. Verified to fail without
  the fix (0.58) and pass with it.

  Three earlier versions of this test were wrong, each in a way worth recording because the
  same traps are there for the next person measuring this scene:
  1. **Spread is not a craft signal.** The scene is not static at a fixed scroll position —
     the satellite orbits and the rocks tumble through the frustum, moving the count by
     about 33 draws on their own. A test on variance measures the orbit.
  2. **Different scroll positions are not comparable.** Taking a "craft-free" baseline from
     earlier in the scroll fails because the scene content is different there — 0.45 still
     has the UFO flyby, and reads _higher_ than the craft section does.
  3. **The sampling window has to span a full orbit.** Two four-second windows twelve
     seconds apart catch different phases of the satellite's cycle, which swings the result
     by more than the craft is worth. Twelve seconds each way is the shortest that is stable.

## Acceptance Criteria

1. Holding anywhere in the craft section keeps the craft on screen indefinitely —
   **met at the positions the section is built around**; see the honest note below.
2. Scrolling back and forward through the section moves the craft with it, with no replay or
   restart — **met**, and pinned by the two purity tests.
3. Frame cost unchanged — **met**; the craft was already about 0.1 ms per frame and nothing
   here adds work. The band is slightly wider, so the per-frame thrust loop runs over a
   slightly longer stretch of scroll; the early-out when the craft is parked at either end of
   the band is kept.
4. The BUG-002 warm-up still holds, zero programs compiled mid-scroll — **met**, that test
   still passes.

### Where the craft actually is, measured

Projecting the craft's world position through the live camera each frame, on an RTX 3080 at
a 1249x1183 viewport:

| Scroll      | NDC x            | On screen            |
| ----------- | ---------------- | -------------------- |
| 0.50 – 0.62 | 1.66 → 1.13      | no, off to the right |
| 0.64 – 0.74 | 0.95 → -0.54     | **yes**              |
| 0.76 onward | -1.02 and beyond | no, exited left      |

So the craft is in frame for roughly `0.63 → 0.75` of the track at that aspect ratio, and
wider at a more typical 16:10 window, where the horizontal frustum is about half again as
wide — an estimated `0.58 → 0.79`. Against the craft panel's `0.52 → 0.68` that covers
most of the back half of the panel and carries on past it.

That is a large improvement on 1.7 seconds and never again, but it is **not** "the craft is
visible everywhere in its section". A craft that holds frame across the entire band would
have to stop approaching the camera and drift sideways instead, which trades away the thing
the fly-in is for. Where exactly that trade should land is a judgement about how the section
should feel, and belongs to a pass with eyes on the real scene — the band and the two
endpoints are a single edit in `utils/craftFlight.ts`, and the tests do not pin them.

## Verification

- [x] Bug is reproducible before fix — craft drawn only `t = 1.6s → 3.3s`, then 25 draws per
      frame indefinitely
- [x] Bug is no longer reproducible after fix — e2e regression test fails at 0.58 without the
      change, passes with it
- [x] Regression test added — 12 unit tests, 1 e2e
- [x] Full suite green — 401 unit tests, 20 homepage e2e (chromium), ESLint, `tsc --noEmit`
- [x] Craft position verified by projection through the live camera on real GPU hardware
- [ ] **Choreography judged by eye** — the band and path are measured to work, not seen to
      look right

## Out of scope

- **Any change to the craft's model, materials or the look of the flight path.** This is
  about when the craft is where, not what it looks like.
- **The Playwright `firefox` project.** `playwright.config.ts` declares it but CI runs
  `npx playwright test --project=chromium`, so it has never run anywhere. Worth resolving —
  either run it or drop it — but it is test infrastructure, not this bug.

## Notes

- [BUG-002](../archive/BUG-002-spaceship-flyin-shader-compile-hitch.md) — the shader warm-up.
  This spec corrects one of its out-of-scope findings and closes another (WS3).
- The draw-call-per-frame technique used here is the same one the BUG-002 regression test
  uses for program counts, and is worth reaching for again: it answers "is this object
  actually being rendered" without needing a handle on the scene graph.
