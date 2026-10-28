---
id: BUG-003
title: 'Homepage craft is absent for most of the scroll section built around it'
status: draft
severity: P2
created: 2026-10-27
author: 'Anthony Coffey'
reviewers: []
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

### WS1 — Drive the flight from scroll progress

Replace the clock-driven `flyT` with a scroll-driven one, so the craft's position is a pure
function of `scrollProgress` like everything else that arrives:

```ts
const flyT = smoothstep(
  clamp01((progress - FLY_START) / (FLY_END - FLY_START)),
);
```

`triggered` / `triggerTime` go away entirely, and with them the replay-on-return behaviour:
scrubbing back up walks the craft back out the way it came, which is what the rest of the
scene already does.

**Open question — the scroll band.** The craft panel runs `0.52 → 0.68` and the camera's
"HOLD — craft + satellite" keyframe sits at `0.68`. Mapping the flight across roughly
`0.56 → 0.76` would put the craft in frame for the whole panel and carry it out as the camera
levels off for the galaxy. The exact numbers are a judgement call about how the section
should feel, not a technical one — worth setting by eye against the real scene before the
test gets written to them. My suggestion is a starting point, not a recommendation I hold.

### WS2 — Decide what the lasers and thrust do

Two sub-animations currently hang off `elapsed`:

- **Thrust particles** advance per-frame from `delta` and cycle continuously. These are idle
  motion and should **stay** on the clock — that matches UFO and Galaxy.
- **Lasers** fire at `elapsed = 1.8s + burstIndex * 0.15` and travel for 1.2s. A travelling
  projectile is a time animation; driving it from scroll means scrubbing backwards un-fires
  it, which may read as broken rather than as scrubbing.

  Suggested: keep the laser flight on the clock, but **arm** it from `flyT` — fire once when
  `flyT` first crosses a threshold, and re-arm when it drops back below. That keeps the
  volley looking like a volley while still being something the visitor can scrub back to and
  see again.

### WS3 — Re-warm after a breakpoint remount

Carried over from BUG-002's Out of scope. The craft is desktop-only (`min-width: 1024px`), so
resizing across that breakpoint mounts it after `SceneWarmup` has already run, leaving its
programs cold and the original BUG-002 stall available exactly once. `SceneWarmup` should
re-run when the scene's composition changes — keying it on the same `showSpaceship` value
that gates the craft is enough. Small, and it closes the one hole left in BUG-002.

### Tests (RED first, per development-standards)

- **Unit:** craft position is a pure function of progress — same input, same position,
  regardless of elapsed time or how many times progress has crossed the band; and the
  position is continuous across the band (no jump at the entry edge).
- **E2E:** hold at a scroll position inside the craft section for longer than the old 4.5s
  flight and assert the craft is still being drawn. Draw calls per frame are the signal that
  diagnosed this and they work as the assertion: steady state at this position is 25, with
  the craft present it is ~72.

## Acceptance Criteria

1. Holding anywhere in the craft section keeps the craft on screen indefinitely.
2. Scrolling back and forward through the section moves the craft back and forward with it —
   no replay, no restart.
3. Frame cost is unchanged (it is already negligible; this must not make it otherwise).
4. The BUG-002 warm-up still holds: zero programs compiled mid-scroll.

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
