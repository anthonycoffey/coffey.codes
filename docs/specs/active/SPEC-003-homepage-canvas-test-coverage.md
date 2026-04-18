ss                                                                                                                                                                                                                                                                                                                                                                                                                                                                          ---
id: SPEC-003
title: "Homepage canvas — full Vitest unit test coverage"
status: draft
created: 2026-04-18
author: Anthony Coffey
reviewers: []
affected_repos: []
---

## Reviewer Notes

<!-- Leave empty until code review. When requesting changes, reviewer adds feedback here: -->

---

# Feature: Homepage canvas — full Vitest unit test coverage

## Problem

The homepage cinematic scene (ADR-001 through ADR-003) was iterated rapidly. Unit tests were not kept up to date. The codebase has no tests for `CameraRig`, any canvas object (`Planet`, `UFO`, `Galaxy`, `Satellite`, `TumblingRock`, `Spaceship`), `HUDOverlay`, or `ShineOverlay`. A regression in any of these components would be invisible until visual QA.

The existing E2E tests (`e2e/homepage.spec.ts`, `e2e/entrance-animations.spec.ts`, `e2e/mobile.spec.ts`) also reference the old five-panel horizontal-scroll architecture and are stale — these are flagged for a separate bug spec and are **out of scope here**.

## Requirements

### Must have

1. WHEN any canvas component renders, the test suite SHALL verify it mounts without throwing.
2. WHEN scroll-driven animation logic runs (via `useFrame` callbacks), the test SHALL verify correct output values at key progress waypoints (0, 0.25, 0.5, 0.75, 1.0).
3. WHEN the `ParticleSystem` dispersal factor reaches 1, the test SHALL verify the points object is hidden (`visible = false`).
4. WHEN `CameraRig` receives `scrollProgress`, the test SHALL verify camera position and `lookAt` are updated to expected keyframe values.
5. WHEN `HUDOverlay` receives a `scrollProgress` ref, the test SHALL verify each child overlay becomes visible at its documented threshold.
6. WHEN `ShineOverlay` receives `visible={true}`, the test SHALL verify the visible CSS class is applied.
7. WHEN the existing `sampleMerkaba` tests run, they SHALL continue to pass unchanged.
8. WHEN the test suite runs (`npm test`), ALL tests SHALL pass with zero failures.

### Nice to have

- Snapshot tests for static geometry constants (`BG_STAR_POSITIONS` shape, `MERKABA_POSITIONS` bounding sphere) to catch accidental constant changes.
- Coverage report configured in `vitest.config.ts` (`coverage` provider: `v8`, threshold: 80% lines for files under `components/canvas/`).

### Non-goals (what this does NOT do)

- This spec does NOT update or fix the stale E2E Playwright tests (those reference the old five-panel layout — separate bug report needed).
- This spec does NOT add tests for non-canvas components (`Navbar`, `Footer`, `ContactForm`, etc.).
- This spec does NOT add visual regression or screenshot tests.

## Design

### R3F test strategy

React Three Fiber hooks (`useFrame`, `useThree`) require mocking in jsdom. Use `vi.mock('@react-three/fiber', ...)` to replace `useFrame` with a synchronous call-collector and `useThree` to return a stub camera/clock. A shared mock helper can be inlined per file or extracted to `__tests__/canvas/__mocks__/r3f.ts`.

```ts
// Example shared mock pattern
let frameCallbacks: Array<(state: unknown, delta: number) => void> = []

export function flushFrames(state = {}, delta = 0.016) {
  frameCallbacks.forEach(cb => cb(state, delta))
}

vi.mock('@react-three/fiber', () => ({
  useFrame: (cb: (state: unknown, delta: number) => void) => {
    frameCallbacks.push(cb)
  },
  useThree: () => ({
    camera: {
      position: { set: vi.fn() },
      lookAt: vi.fn(),
    },
  }),
  Canvas: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))
```

Three.js refs (e.g. `useRef<THREE.Points>`) will need lightweight stubs — plain objects with the required methods/properties mocked via `vi.fn()`.

### Files to create

| Test file | Target |
|---|---|
| `__tests__/canvas/CameraRig.test.tsx` | `components/canvas/CameraRig.tsx` |
| `__tests__/canvas/ParticleSystem.test.tsx` | `ParticleSystem` in `WorldCanvas.tsx` |
| `__tests__/canvas/objects/Planet.test.tsx` | `components/canvas/objects/Planet.tsx` |
| `__tests__/canvas/objects/UFO.test.tsx` | `components/canvas/objects/UFO.tsx` |
| `__tests__/canvas/objects/Galaxy.test.tsx` | `components/canvas/objects/Galaxy.tsx` |
| `__tests__/canvas/objects/Satellite.test.tsx` | `components/canvas/objects/Satellite.tsx` |
| `__tests__/canvas/objects/TumblingRock.test.tsx` | `components/canvas/objects/TumblingRock.tsx` |
| `__tests__/canvas/objects/Spaceship.test.tsx` | `components/canvas/objects/Spaceship.tsx` |
| `__tests__/overlay/HUDOverlay.test.tsx` | `components/overlay/HUDOverlay.tsx` |
| `__tests__/overlay/ShineOverlay.test.tsx` | `components/overlay/ShineOverlay.tsx` |

### Key test cases per component

**CameraRig** — `scrollProgress=0` → camera at `[0,0,4]`; `scrollProgress=1` → camera at final keyframe; intermediate values interpolate without NaN.

**ParticleSystem** — `progress=0`: `visible=true`, `opacity≈0.75`; `progress=0.125`: opacity between 0 and 0.75; `progress≥0.25`: `visible=false`.

**UFO** — before entry (`progress=0.14`): position outside visible range; mid-hover (`progress=0.25`): position near left-of-center; phase transitions fire correctly.

**Planet** — always rendered (no visibility toggle); eclipse light intensity ramps 0→8 between `progress 0.35–0.55`.

**Galaxy** — `progress=0.74`: z≈-220 (far); `progress=0.95`: z≈-70 (close); `progress=1.0`: z≈-65.

**Satellite** — position changes over elapsed time (clock-driven); `scrollProgress` prop is accepted without error but does not affect position.

**TumblingRock** — renders without error; rotation values update each frame.

**Spaceship** — not triggered below `progress=0.62`; once triggered, position changes over elapsed time.

**HUDOverlay** — `IntroOverlay` visible at `progress=0.20`, not at `0.10`; `AboutOverlay` visible at `0.40`; `CraftOverlay` visible at `0.60`; `ShineOverlay` visible at `0.85`.

**ShineOverlay** — `visible={true}` applies `.visible` class; `visible={false}` does not.

## Edge cases

- [ ] `ParticleSystem`: `scrollProgress` exactly at `0.25` boundary (`disperse=1`, must be hidden)
- [ ] `Galaxy`: `scrollProgress` exactly at `0.75` (motion just begins, z still near -220)
- [ ] `Spaceship`: `scrollProgress` transitions from `0.61 → 0.62` (trigger fires exactly once)
- [ ] `HUDOverlay`: progress at exact threshold boundary values for each overlay

## Acceptance criteria

1. `npm test` exits 0 with all new and existing tests passing.
2. Every file in the "Files to create" table has ≥ 3 meaningful assertions.
3. `ParticleSystem` dispersal boundary (`progress ≥ 0.25 → visible=false`) is explicitly tested.
4. `CameraRig` keyframe interpolation is tested at `progress=0`, `0.5`, and `1.0`.
5. `HUDOverlay` visibility transitions are tested for all four child overlays.
6. No test uses `// @ts-ignore` or casts to `any` to suppress type errors unless unavoidable with R3F mocks (must be commented with rationale).

## Constraints

- Vitest + jsdom already configured — no new test runtime dependencies unless essential.
- R3F canvas rendering is mocked; no headless WebGL renderer required.
- Test files live under `__tests__/` mirroring the `components/` directory structure.
- All existing tests must remain green throughout implementation.

## Tasks

- [ ] Write shared R3F mock helper (`__tests__/canvas/__mocks__/r3f.ts` or inline per file)
- [ ] `__tests__/canvas/CameraRig.test.tsx`
- [ ] `__tests__/canvas/ParticleSystem.test.tsx`
- [ ] `__tests__/canvas/objects/Planet.test.tsx`
- [ ] `__tests__/canvas/objects/UFO.test.tsx`
- [ ] `__tests__/canvas/objects/Galaxy.test.tsx`
- [ ] `__tests__/canvas/objects/Satellite.test.tsx`
- [ ] `__tests__/canvas/objects/TumblingRock.test.tsx`
- [ ] `__tests__/canvas/objects/Spaceship.test.tsx`
- [ ] `__tests__/overlay/HUDOverlay.test.tsx`
- [ ] `__tests__/overlay/ShineOverlay.test.tsx`
- [ ] Verify `npm test` passes with zero failures
- [ ] Move this spec to `docs/specs/archive/` after all tasks complete

## Notes

- ADR-001: `docs/specs/adrs/ADR-001-homepage-cinematic-redesign.md`
- ADR-002: `docs/specs/adrs/ADR-002-merkaba-dispersal-and-background-stars.md`
- ADR-003: `docs/specs/adrs/ADR-003-cinematic-scene-polish.md`
- Stale E2E tests (five-panel references in `e2e/`) should be addressed in a separate bug spec.
- R3F testing patterns: https://docs.pmnd.rs/react-three-fiber/tutorials/testing
