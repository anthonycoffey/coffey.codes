---
id: BUG-001
title: 'Homepage 3D scene loads after "click to enter", not during the loading screen'
status: review-pending
severity: P2
created: 2026-10-16
author: 'Anthony Coffey'
reviewers: []
affected_repos: ['coffey.codes']
---

## Reviewer Notes

<!-- Leave empty until code review. When requesting changes, reviewer adds feedback here: -->

---

# Bug: Homepage 3D scene loads after "click to enter", not during the loading screen

## Description

The homepage loading overlay shows a "LOADING..." typing animation and a progress bar, then prints "SCENE LOADED." and offers a `CLICK TO ENTER` button. All of that is theater: the WebGL canvas is not mounted until **after** the click, so nothing has actually loaded when the overlay claims it has.

The visible result is a double load. The visitor clicks `CLICK TO ENTER`, the overlay slides up to reveal a black page, and only then does the scene initialize — several seconds of apparent "loading again" after a loading screen that already said it was done.

This is a regression. Until 2026-06-22 the desktop canvas mounted on page load and the overlay dismissed on a real readiness signal from the scene.

## Steps to Reproduce

1. Load `/` with a cold cache on desktop.
2. Wait for the overlay to print "SCENE LOADED." and show the `CLICK TO ENTER` button (~1.3s).
3. Click `CLICK TO ENTER`.

## Expected Behavior

1. Visitor clicks `CLICK TO ENTER`.
2. The loading overlay **fades** out.
3. The 3D scene is revealed already running — it was loaded during the loading animation, while the overlay was up.

## Actual Behavior

1. The progress bar fills and "SCENE LOADED." appears on a fixed timer, with no scene loaded behind it.
2. On click, the overlay **slides** up (`-translate-y-full`) to reveal a black page.
3. `WorldCanvas` mounts for the first time — three.js + postprocessing init, geometry build, shader compile — taking seconds on a cold chunk.
4. The scene then fades in over a further 500ms once it reports ready.

## Environment

- **Browser/Platform:** Desktop Chrome (all viewports affected; mobile shares the same gate)
- **Version/Commit:** `391767a` (regression introduced in `5de2cd6`, 2026-06-22)
- **OS:** Windows 11

## Root Cause

Three separate causes compound:

1. **The canvas is mounted only after entry.** [`components/ScrollContainer.tsx`](../../../components/ScrollContainer.tsx) — `const shouldMountCanvas = started;`. Commit `5de2cd6` ("gate homepage scene behind a 'click to enter' splash on desktop") changed `isMobile ? started : canvasReady` to `started`, extending the mobile tap-gate to desktop. Desktop previously mounted the canvas during page load, so the loader's animation genuinely overlapped scene init.

2. **The loader's "ready" state is a timer, not a signal.** [`components/Loader.tsx`](../../../components/Loader.tsx) reveals the gate on `BAR_START_MS + BAR_FILL_MS + 120` (~1.3s) elapsing. "SCENE LOADED." is printed off that timer. The `loaded` prop — the only real signal available — is ignored in gate mode.

3. **The ready signal itself is early.** [`components/canvas/WorldCanvas.tsx`](../../../components/canvas/WorldCanvas.tsx) wires `onReady` to r3f's `onCreated`, which fires when the WebGL context is created — before geometry upload, shader compile, and the first painted frame. Even once the canvas mounts, `sceneReady` flips well before there is anything to look at, so the 500ms reveal fade starts over an empty scene.

### Why the gate exists (constraint on any fix)

The gate is not gratuitous. Per the SPEC-011 / SPEC-012 lineage, mounting the WebGL scene during page load put three.js inside the Lighthouse/PSI audit window and cost the homepage its perf score (mobile TBT reached 34s before the mobile tier landed). The gate keeps the scene — and its continuous render loop — entirely off the main thread for visitors who never interact, Lighthouse included.

Any fix must preserve that: the scene must not mount during a synthetic lab run.

## Fix

Reuse the signal the code already trusts to tell a real visitor from a lab run. `ScrollContainer` already listens for `pointermove` / `pointerdown` / `keydown` / `wheel` / `touchstart` to warm the `WorldCanvas` chunk ahead of entry; Lighthouse and PSI generate none of these. Promote that signal from "warm the chunk" to "mount the canvas behind the overlay".

1. **`ScrollContainer`** — mount the canvas on first interaction intent, not on `started`. The overlay is `z-50` and opaque, so the canvas initializes and paints underneath it, unseen. Drop the `opacity: sceneReady ? 1 : 0` reveal wrapper; in the fixed flow the scene is already painted before the overlay leaves.

2. **`WorldCanvas`** — fire `onReady` after the first rendered frame rather than on `onCreated`, so "SCENE LOADED." means a frame has actually been drawn (geometry uploaded, post-processing passes compiled).

3. **`Loader`** — reveal the gate on the real `loaded` signal, with:
   - a **floor** (the existing bar-fill duration) so the bar never pops from half-full on a fast machine, and
   - a **safety cap** so a visitor is never trapped behind a gate that never unlocks (WebGL unavailable, `onReady` never fires, or no interaction ever occurred so the canvas is not yet mounted).

   Dismiss by **fading** (`opacity-0`) instead of sliding (`-translate-y-full`).

Residual edge case, accepted: a visitor who generates no input at all until clicking the button mounts the canvas on that click and sees the old behavior, softened by the fade. On desktop a pointer move precedes the click by milliseconds in practice. Closing this case fully would mean mounting on a timer, which is what `5eddc63`/`cb8fbb0` did via `requestIdleCallback` and what the gate replaced — it reintroduces the lab-run cost.

## Verification

- [x] Bug is reproducible before fix — 18 new tests failed RED against the old behavior
- [x] Bug is no longer reproducible after fix — canvas observed mounting at ~1.0s after
      load (pointer move only, no click) with the splash still reading "LOADING..."
- [x] Regression test added — `__tests__/canvas/WorldCanvasReady.test.tsx` (new),
      plus gate-readiness cases in `__tests__/components/Loader.test.tsx`, mount-timing
      cases in `__tests__/ScrollContainer.test.tsx`, and a `Homepage scene preloading`
      suite in `e2e/homepage.spec.ts`
- [x] Canvas still does **not** mount without interaction — verified in-browser: zero
      `<canvas>` elements 4s after load with no pointer/key/wheel/touch event dispatched,
      and covered by two automated tests (unit + e2e)
- [x] Gated loader never auto-dismisses on readiness — a bug this work exposed and fixed
      (`loaded` was dismissing the overlay regardless of gate mode, which would have torn
      the splash away unprompted the instant the scene painted)
- [ ] Homepage Lighthouse perf score unchanged — **not run**. The lab-run guard above is
      the mechanism that protects it, and it is verified, but the score itself has not
      been re-measured.

### Verification notes

In-browser checks ran in an occluded browser pane, which Chrome throttles to ~1 rAF tick
per second. The overlay fade and the first-frame ready signal are therefore correct but
were observed stretched over seconds rather than at their real 500ms / 2-frame timing;
both are pinned at speed by the unit tests instead. No console errors, no server errors.

## Notes

Related history:

- `d4137e5` — original canvas-first homepage (SPEC-002)
- `dcff4f7` — loading overlay added; canvas mounted on load
- `cb8fbb0`, `5eddc63` — deferred mount via `requestIdleCallback`; mobile tap-gate (SPEC-011 / SPEC-012 perf work)
- `5de2cd6` — **regression**: tap-gate extended to desktop, canvas mount moved behind the click
