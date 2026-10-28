---
id: BUG-002
title: 'Homepage spaceship fly-in stalls the render loop on first draw'
status: complete
severity: P2
created: 2026-10-26
author: 'Anthony Coffey'
reviewers: ['Anthony Coffey']
affected_repos: ['coffey.codes']
---

## Reviewer Notes

<!-- Leave empty until code review. When requesting changes, reviewer adds feedback here: -->

---

# Bug: Homepage spaceship fly-in stalls the render loop on first draw

## Description

Scrolling the homepage past ~62% progress triggers the spaceship fly-in. At the instant
the craft enters the frame the render loop chokes for a few frames — scroll scrub visibly
stutters — then recovers completely once the ship is moving. The hitch lands in the middle
of the scroll's quietest stretch: the hold on craft + satellite, immediately before the
camera levels off and the galaxy becomes the focus of the final scene.

It is a first-draw cost, not a steady-state one. Scroll back below the trigger and forward
again and the stutter does **not** repeat — the work is cached after the first pass.

## Steps to Reproduce

1. Load `/` on a desktop viewport (≥1024px — the spaceship is desktop-only,
   [`WorldCanvas.tsx:267`](../../../components/canvas/WorldCanvas.tsx)).
2. Enter the scene and scroll steadily toward the end of the track.
3. Watch the moment the craft appears from the right, around scroll progress `0.62`.

## Expected Behavior

The craft enters the frame at the same frame cadence as the rest of the scroll. Nothing
about its arrival is perceptible as a stall.

## Actual Behavior

The frame that first draws the craft, plus the two or three after it, take roughly 3× the
surrounding frame budget. The scrub lags behind the wheel, then snaps back. Subsequent
scrolling through the same range is smooth.

## Environment

- **Browser/Platform:** Desktop Chrome, 1280×820 viewport, dev server (`npm run dev`)
- **Version/Commit:** `8bc3147`
- **OS:** Windows 11
- **three.js:** `^0.175.0` · `@react-three/fiber` `^9.1.0`

## Root Cause

**three.js compiles a material's WebGL program lazily, on the first frame that actually
draws it — and the craft is deliberately kept out of the frustum until the trigger, so
none of its programs exist until the moment it flies in.**

[`Spaceship.tsx:168`](../../../components/canvas/objects/Spaceship.tsx) parks the whole
group far off-stage while the scroll is below the trigger:

```ts
if (progress < 0.62) {
  groupRef.current.position.set(250, 0, -80);
  triggered.current = false;
  return;
}
```

The group is mounted and in the scene graph the whole time, but every hull mesh is a plain
`<mesh>` with default `frustumCulled = true`. At `x = 250` they are culled out of the
render list on every frame, so `WebGLRenderer` never reaches `getProgram()` for their
materials. Compile, link and the driver's program specialization are all deferred to the
one frame where the craft finally intersects the frustum — the fly-in frame.

The two `<instancedMesh>` children (thrust and lasers) already carry
`frustumCulled={false}` ([`Spaceship.tsx:272,281`](../../../components/canvas/objects/Spaceship.tsx)),
which is why their `meshBasicMaterial` programs are warm from mount. The hull is not.

### Measurement

Instrumented `WebGL2RenderingContext.prototype.shaderSource` / `linkProgram` and a
`longtask` PerformanceObserver, installed before the canvas mounted, bucketed by scroll
phase. Two independent runs agreed.

| Phase                                                     | Scroll      | Shaders compiled | Programs linked |
| --------------------------------------------------------- | ----------- | ---------------- | --------------- |
| Canvas mount (behind the loading splash)                  | —           | 30               | 15              |
| Scroll 0 → 0.55 (merkaba, UFO, planet, satellite, galaxy) | pre-trigger | **0**            | **0**           |
| Crossing the trigger                                      | `0.62`      | **8**            | **4**           |

The entire rest of the scene is warm by the time the splash lifts. **Every late compile in
the scroll belongs to the spaceship**, and all four programs land on one frame.

Two of the four fragment shaders are large — **~76 KB and ~78 KB of generated source**,
against ~13.5 KB for the other two. Those are the `onBeforeCompile` grunge materials
(a two-octave simplex-noise function injected into `meshStandardMaterial`, declared eight
times from [`Spaceship.tsx:306`](../../../components/canvas/objects/Spaceship.tsx) onward)
and the `meshPhysicalMaterial` cockpit. They are the expensive links.

Long-task durations across the same window, from the cleaner second run:

| Window               | Long tasks                            |
| -------------------- | ------------------------------------- |
| Pre-trigger baseline | 93, 100, 99, 122, 116, 102, 92, 97 ms |
| Trigger frame        | **291 ms**                            |
| Two frames after     | 169, 164 ms                           |

The 291 ms task starts at `t=17695`; the eight `shaderSource` calls run at `t=17701–17809`.
The spike is the compile.

#### Measurement caveats

These are **relative, not absolute** numbers. The run used the dev build in an occluded
browser pane, where Chrome throttles rAF and frames were forced by screenshot capture, and
the instrumentation itself adds per-call overhead. A ~95 ms "baseline frame" is an artifact
of that setup, not a real frame time. What transfers to production is the **ratio and the
counts**: four programs created on one frame, and a ~3× spike against the surrounding
frames on exactly that frame. Absolute cost on a production build and a real display is
unmeasured and should be re-checked during verification.

### Secondary contributors (same frame, much smaller)

- **First-use GPU uploads.** ~20 hull geometries buffer to the GPU on their first draw, in
  the same frame as the compiles.
- **`instanceColor` allocation.** `setColorAt` is first called inside the post-trigger
  branch, so three.js allocates the 140×3 float instance-color attribute and its GPU buffer
  on the trigger frame.

### Not the hitch, but worth recording

Once the craft is on screen the scene gets permanently heavier — post-trigger frames settle
at ~165 ms against a ~100 ms pre-trigger baseline in the same instrumented run (~+60%; the
first run showed the same step at 128–142 vs 88–89 ms). That is steady-state cost: 140
thrust instances re-composed and re-coloured per frame with a full `instanceColor` re-upload,
two extra point lights, and more bloom-eligible pixels. Fixing the compile hitch will not
make the post-trigger frames as cheap as the pre-trigger ones, and it should not be expected
to. See **Out of scope**.

## Fix

Implemented as described in WS1, plus two things the implementation uncovered that
`compileAsync` alone does not cover. Both were found by the WS2 regression test, which
failed three times against three different causes before it went green — each time because
the warm-up ran but produced programs under a cache key the renderer never looked up. A
warm-up that misses is completely silent, which is exactly why the test matters.

### WS1 — Warm the scene's programs during the loading screen

`SceneWarmup` in [`WorldCanvas.tsx`](../../../components/canvas/WorldCanvas.tsx) calls
`gl.compileAsync(scene, camera)` once, behind the loading splash. `onReady` — and so the
gate's "SCENE LOADED." — now means painted **and** warm. Three details carry the fix:

1. **Bind a render target while compiling.** A program's cache key takes `toneMapping` and
   `outputColorSpace` from the currently bound target: straight off the renderer when it is
   `null`, forced to `NoToneMapping` / `LinearSRGB` when it is not (`WebGLPrograms.js`
   lines 165 and 202, both pushed into the key at lines 420 and 463). This scene always
   draws through `EffectComposer`, i.e. into a buffer. Warming with nothing bound built a
   complete second set of programs — the pre-trigger total went from 15 to 28 — and left
   the real ones to compile mid-scroll exactly as before. A 1x1 proxy target gives the
   right key.

2. **Wait for mount effects to flush.** Scene objects park lights on private layers from
   passive effects: [`Planet.tsx`](../../../components/canvas/objects/Planet.tsx) moves
   three of its four onto `PLANET_LIGHTING_LAYER`, which the camera never enables. Those
   effects flush _after_ frame 1. Light counts are part of the cache key, so warming on the
   first frame built everything against 3 directional / 9 point lights where the renderer
   then wanted 1 and 8 — read directly off the two cache keys. `SceneWarmup` sets a flag in
   its own effect and compiles on the first frame that sees it: React runs a commit's
   passive effects as one synchronous batch, so that frame has the whole batch behind it
   whatever order the scene's children sit in.

3. **Allocate `instanceColor` at mount**
   ([`Spaceship.tsx`](../../../components/canvas/objects/Spaceship.tsx)). This was listed
   under WS3 as a minor allocation saving. It is not minor: three.js creates the attribute
   lazily on the first `setColorAt`, which lands in the post-trigger branch, and
   `USE_INSTANCING_COLOR` is part of the cache key — so that one call forced a recompile of
   the thrust material on the fly-in frame. It was the last of the four programs.

Failure handling keeps BUG-001's bargain: a compile that rejects, is unsupported, or never
settles still reports warm (2.5s cap), so the gate can never trap a visitor behind a
warm-up that cannot finish.

### WS2 — Regression test

[`e2e/homepage.spec.ts`](../../../e2e/homepage.spec.ts) — "Homepage scene shader warm-up"
patches `linkProgram` before the page loads, baselines the program count once the visitor
can scroll, scrolls past the trigger and asserts the count has not moved. Its positive
control reads the craft HUD panel, which runs off the same `scrollProgress` ref as the
craft itself: the panel closes at 0.68, so seeing it gone proves progress really advanced
through 0.62, rather than the scrub stalling short and the assertion passing vacuously.

Unit coverage in
[`__tests__/canvas/SceneWarmup.test.tsx`](../../../__tests__/canvas/SceneWarmup.test.tsx)
(13 tests) pins the contract: the compile is frame-driven rather than mount-driven, happens
once, binds and restores a render target, and always reports warm — on resolve, on
rejection, on a missing `compileAsync`, and on the cap.

### WS3 — Remainder

The `instanceColor` hoist moved into WS1 above, where it turned out to be load-bearing. The
other WS3 item — collapsing the eight grunge material declarations into one shared instance
— was **not done**. It was only ever a memory and clarity win (all eight already resolve to
a single program) and is not needed to close this bug.

### Considered and rejected

| Option                                         | Why not                                                                                                                                                                                           |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `frustumCulled={false}` on the hull meshes     | Warms the programs, but pays vertex processing and ~20 draw calls every frame for the whole scroll, and makes "the ship is not visible before the trigger" depend on clipping rather than intent. |
| Nudge the craft into frame early for one frame | Same effect as a warm draw but visible to the visitor if the timing is off, and it fights the scene's pure-scroll design.                                                                         |
| Simplify the grunge shader                     | Reduces compile cost without removing the stall; the hitch is _when_ the compile happens, not only how big it is. Also a visual change, which this bug should not make.                           |
| Accept it                                      | The stall lands on the hold before the final scene — the calmest, most deliberate beat in the scroll.                                                                                             |

## Acceptance Criteria

1. Crossing scroll progress `0.62` on a production build links **zero** new WebGL
   programs — **met**.
2. No long-task spike at the trigger relative to the frames around it — **not confirmed**,
   see below.
3. The loading gate still unlocks on a real signal, still respects its safety cap, and still
   does not mount the canvas without user input (the BUG-001 Lighthouse guard) — **met**.
4. Nothing about the scene's appearance or the fly-in timing changes — **met**. No change to
   geometry, materials, camera or the flight path; `instanceColor` is initialised to black,
   which the first post-trigger frame overwrites before anything is drawn.

## Verification

- [x] Bug is reproducible before fix — 4 programs / 8 shaders linked at the trigger, 0
      before (two dev runs, plus the production baseline below)
- [x] Bug is no longer reproducible after fix — **0** programs linked at the trigger
- [x] Regression test added — e2e program-count assertion + 13 unit tests
- [x] Re-measured on a production build, not the dev server
- [x] Canvas still does not mount without user input — existing BUG-001 e2e test still passes
- [x] Full suite green — 389 unit tests, 19 homepage e2e (chromium), ESLint, `tsc --noEmit`
- [ ] **The stall is gone to the eye, on real hardware** — not confirmed; see below

### Production build measurement

`npm run build` + `npm start`, headless Chromium at 1280x820, identical instrumentation in
both runs. "Before" is the same build with the two component changes stashed out.

|        | Programs at mount | Programs at the trigger | Pre-trigger long tasks (median) | Trigger long tasks (median / max) |
| ------ | ----------------- | ----------------------- | ------------------------------- | --------------------------------- |
| Before | 15                | **4**                   | 270 ms                          | 545 ms / 1682 ms                  |
| After  | 22                | **0**                   | 274 ms                          | 592 ms / 1421 ms                  |

The program counts are the result: every program the scene needs is now built while the
splash is up, and the scroll compiles nothing. That figure is environment-independent, and
it is what the regression test guards.

The long-task columns do **not** show the stall clearing — and they are not evidence that it
has not. Headless Chromium renders WebGL through SwiftShader, in software. At 1280x820 the
trigger frame's cost there is dominated by rasterizing ~20 newly visible meshes carrying a
two-octave procedural noise shader: work that is near-free on a GPU and has nothing to do
with compiling. This setup cannot separate the two costs, so it cannot settle criterion 2.

### What could not be measured here, and why

The GPU-backed check — the frame-timing method that produced the original 95 ms → 291 ms
diagnosis — needs the browser pane, which throttles `requestAnimationFrame` to roughly zero
while the window is hidden. Frames only advance when a screenshot forces one, and
screenshot capture was timing out in this session; driving the scroll there produced a
mounted canvas and zero rendered frames.

So the honest state is: **the compile is provably off the scroll, and whether the stall is
gone to the eye is unconfirmed.** The remaining trigger-frame cost is the steady-state step
already recorded under Out of scope, which this work does not address. One scroll through
the homepage on real hardware settles it.

## Out of scope

- ~~**The steady-state cost step after the trigger** (~+60% per frame while the craft is on
  screen). Real, measured, and a separate piece of work — thrust instance count, per-frame
  `instanceColor` re-upload, and the two point lights are the candidates.~~

  **Withdrawn 2026-10-27 — this finding was wrong.** It was measured in an occluded browser
  pane throttled to ~1fps and in headless Chromium rendering WebGL through SwiftShader, and
  it did not survive contact with a GPU. Re-measured on an RTX 3080 (ANGLE/D3D11) at three
  scroll positions, frame time is identical whether the craft is on screen or not — 6.1 ms
  median in every phase, which is this display's vsync interval, with p95 of 7.2 ms while
  the craft is up against 7.6 ms while it is absent. Throttling the CPU 6x to force real
  competition for the frame budget puts the craft's cost at about 0.1 ms median, inside the
  noise, while it is drawing nearly 3x the draw calls (72 vs 25). **The craft is cheap and
  the optimisation work proposed here should not be done.** See
  [BUG-003](../active/BUG-003-craft-absent-from-its-own-scene.md) for the measurement.

- **The fly-in replaying on scrub-back.** `triggered.current` resets below `0.62`
  ([`Spaceship.tsx`](../../../components/canvas/objects/Spaceship.tsx)) and the animation is
  driven by `clock.getElapsedTime()` rather than scroll progress, so scrolling back and
  forward restarts the 4.5s flight from the beginning. Every other object in the scene is a
  pure function of scroll. Worth reconciling, but it is a behaviour change, not this bug.
- **A viewport resize across the 1024px breakpoint mid-session.** That mounts the craft
  after the warm-up has run, so its programs are cold again and the stall returns once. The
  warm-up covers the scene composition present at load. Rare enough to leave — now picked up
  as WS3 of [BUG-003](../active/BUG-003-craft-absent-from-its-own-scene.md).

## Notes

Related history:

- [BUG-001](../archive/BUG-001-homepage-scene-loads-after-enter.md) — established the
  mount-behind-the-splash architecture this fix depends on, and the readiness-signal
  contract it must not break.
- SPEC-011 / SPEC-012 — the performance lineage behind the interaction gate. The warm-up
  runs only after the canvas mounts, which still happens only on real user input, so the
  Lighthouse audit window is untouched.

One trade-off to watch: the gate now waits for the warm-up as well as the first frame, so
"SCENE LOADED." arrives later than it did. In the headless production runs above that was
4.2s to 5.3s, inflated by software-rendering 22 program compiles. The Loader's existing 6s
ready cap bounds it, and past that the gate unlocks with the warm-up unfinished — the fix
degrades rather than stranding anyone.
