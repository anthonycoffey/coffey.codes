---
id: SPEC-012
title: 'Homepage 3D scene — mobile-tier rendering'
status: draft
created: 2026-05-04
author: 'Anthony Coffey'
reviewers: []
affected_repos: ['coffey.codes']
---

## Reviewer Notes

<!-- Leave empty until code review. When requesting changes, reviewer adds feedback here: -->

---

# Feature: Homepage 3D scene — mobile-tier rendering

## Problem

PageSpeed Insights mobile audit on 2026-05-04 scored the homepage **32/100** with **TBT = 34,180 ms** and **LCP = 7.5s**. The cause is the homepage's WebGL scene running at full desktop fidelity on mobile devices:

- `frameloop="always"` ([WorldCanvas.tsx:165-176](../../../components/canvas/WorldCanvas.tsx)) — continuous render every frame.
- `<EffectComposer>` with **Bloom (5 mipmap levels) + Vignette** post-processing on every frame.
- 2,000-particle Merkaba system updating each frame.
- `dpr={[1, 1.5]}` on high-DPI mobile devices.
- No mobile detection — phones receive the full desktop scene.
- Continues animating when the browser tab is hidden.

Even on desktop, the always-on frameloop wastes CPU/GPU when the tab is in the background. On mobile, it produces the 34-second TBT.

The homepage 3D scene is a brand experience that we want to keep visible on mobile, not replace with a static fallback. The goal is to render a *simpler* scene on mobile that still feels alive but does not crush the device.

## Requirements

### Must have

1. WHEN a user loads the homepage on a mobile device (matchMedia `(max-width: 767px)` OR `(pointer: coarse)`), the system SHALL render the 3D scene WITHOUT the `<EffectComposer>` Bloom or Vignette passes.
2. WHEN a user loads the homepage on a mobile device, the canvas SHALL use `dpr={[1, 1]}` (i.e. capped at 1, no high-DPI multiplier).
3. WHEN a user loads the homepage on a mobile device, the Merkaba particle count SHALL be reduced by at least 50% (target: 800–1000 particles instead of 2000).
4. WHEN the browser tab becomes hidden (`document.visibilityState === 'hidden'`), the canvas SHALL pause its animation loop. WHEN the tab becomes visible again, the loop SHALL resume.
5. WHEN a mobile user loads the homepage, `@react-three/postprocessing` SHALL NOT appear in the route's main JS chunk (verify via bundle analyzer or build output).
6. WHEN a desktop user (≥ 768px width AND fine pointer) loads the homepage, the existing scene fidelity SHALL be preserved (Bloom + Vignette + DPR 1.5 + full particle count).

### Nice to have

- WHEN the canvas is occluded by a fixed overlay or scrolled away beyond the scroll-track end, the system MAY further reduce frame rate (e.g., `frameloop="demand"`).
- A diagnostic logger (dev-only) that prints the active tier (`mobile` vs `desktop`) on mount, to help confirm tier selection during testing.

### Non-goals (what this does NOT do)

- This spec does NOT replace the 3D scene with a static SVG/poster image on mobile.
- This spec does NOT change desktop rendering quality.
- This spec does NOT change scroll behavior, camera rig, or scene composition.
- This spec does NOT change `HUDOverlay` text or animations.
- This spec does NOT remove the always-on frameloop on desktop (only mobile may switch to demand-based).
- This spec does NOT touch any non-homepage route (covered by SPEC-011).

## Design

### Tier detection

A new `useDeviceTier()` hook (or inline `useMemo` + `matchMedia` after mount):

```tsx
function useDeviceTier(): 'mobile' | 'desktop' {
  const [tier, setTier] = useState<'mobile' | 'desktop'>('desktop');
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px), (pointer: coarse)');
    const update = () => setTier(mql.matches ? 'mobile' : 'desktop');
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);
  return tier;
}
```

Initial render is `'desktop'` to match SSR. The canvas is already client-only (`dynamic({ ssr: false })` at [ScrollContainer.tsx:12](../../../components/ScrollContainer.tsx)), so no hydration mismatch.

### Conditional EffectComposer

Currently `WorldCanvas.tsx` imports `<EffectComposer>`, `<Bloom>`, `<Vignette>` statically. To ensure the mobile bundle never includes `@react-three/postprocessing`, extract the post-processing block to a separate file and dynamic-import it for the desktop tier only:

**New file:** `components/canvas/PostProcessing.tsx` (`'use client'`):

```tsx
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
export default function PostProcessing() {
  return (
    <EffectComposer>
      <Bloom mipmapBlur intensity={…} threshold={…} />
      <Vignette eskil={false} offset={…} darkness={…} />
    </EffectComposer>
  );
}
```

**Modified:** `components/canvas/WorldCanvas.tsx`:

```tsx
const PostProcessing = dynamic(() => import('./PostProcessing'), { ssr: false });
// …
const tier = useDeviceTier();
// inside <Canvas>:
{tier === 'desktop' && <PostProcessing />}
```

The dynamic import ensures `@react-three/postprocessing` and the underlying `postprocessing` package (~150-200 KiB combined) are only fetched for desktop visitors.

### Particle count tier

Identify the Merkaba particle component (likely `components/canvas/MerkabaField.tsx` or similar). Pass `tier` as a prop and use `tier === 'mobile' ? 800 : 2000` (exact number tunable during verification).

### DPR tier

```tsx
<Canvas
  dpr={tier === 'mobile' ? [1, 1] : [1, 1.5]}
  // …existing props
>
```

### Visibility pause

In `WorldCanvas.tsx`, after the canvas mounts, listen for `visibilitychange`:

```tsx
useEffect(() => {
  const onVis = () => setFrameloop(document.hidden ? 'never' : 'always');
  document.addEventListener('visibilitychange', onVis);
  return () => document.removeEventListener('visibilitychange', onVis);
}, []);
```

Use either `setFrameloop` state piped into the `<Canvas frameloop={…}>` prop, or call `gl.setAnimationLoop(null)` directly via a ref. The state-prop approach is simpler.

### Loader UX

The existing `Loader` ([components/Loader.tsx](../../../components/Loader.tsx)) shows during the initial dynamic import of `WorldCanvas`. Confirm it also covers the additional `PostProcessing` dynamic-import phase on desktop. If there is a visible flicker between scene mount and post-processing mount, gate the desktop scene's first paint on the post-processing chunk being ready (use `Suspense` boundary).

## Edge cases

- [ ] User resizes window from mobile width to desktop width during a session — `matchMedia` listener updates tier; post-processing dynamic-import fires on first crossing into desktop.
- [ ] User has `prefers-reduced-motion` set — out of scope for this spec; consider for a follow-up.
- [ ] Tablet devices (e.g., iPad in portrait) match `(pointer: coarse)` and will use the mobile tier — acceptable; iPads benefit from the lighter scene.
- [ ] Devices that don't support `visibilitychange` reliably — fall back to default always-on (no regression).
- [ ] User opens devtools and changes viewport — tier updates correctly via `matchMedia` listener.
- [ ] After visibility pause, scroll-driven camera rig must resume from current scroll progress, not jump.

## Acceptance criteria

1. `npm run build` succeeds. Bundle analyzer (or build output) shows `@react-three/postprocessing` is in a separate chunk loaded only when desktop tier engages.
2. `npm run lint` passes.
3. PageSpeed Insights mobile against a Vercel preview deployment of this branch:
   - Homepage score ≥ 70 (target 75+), LCP ≤ 4s, TBT ≤ 2,000 ms.
4. PageSpeed Insights desktop:
   - Homepage score remains within 5 points of current baseline (no regression).
5. Manual smoke test:
   - On a phone (or Chrome DevTools mobile emulation): scene renders without Bloom/Vignette, animation feels smooth, no console errors.
   - On desktop: scene renders identically to current `main` (Bloom + Vignette intact).
   - Switching tabs pauses the animation; returning resumes it without visual jump.
   - Scroll-driven camera/animation works on both tiers.

## Constraints

- Must not depend on user-agent sniffing — use feature/media queries only.
- Must keep the canvas SSR-disabled (`dynamic({ ssr: false })`) to avoid WebGL-on-server errors.
- Tier detection runs after mount (initial state must match server-rendered fallback).
- Should not introduce new permission requests (no orientation, no fullscreen, no device sensors).

## Tasks

- [ ] Add `useDeviceTier()` hook (in `hooks/` per CLAUDE.md `hooks/` convention)
- [ ] Extract `<EffectComposer>` block into `components/canvas/PostProcessing.tsx`
- [ ] Dynamic-import `PostProcessing` in `WorldCanvas.tsx` for desktop tier
- [ ] Wire `tier` prop into Merkaba/particle component for reduced count on mobile
- [ ] Apply tier-conditional `dpr` to `<Canvas>`
- [ ] Add `visibilitychange` pause/resume of `frameloop`
- [ ] Manually verify mobile bundle excludes `@react-three/postprocessing` (via `@next/bundle-analyzer` or build output inspection)
- [ ] Manual smoke test on real phone + desktop
- [ ] Deploy preview branch; PageSpeed Insights mobile + desktop runs
- [ ] Update agent brief if scene architecture details are documented there
- [ ] Move spec to `archive/` after merge; status → `complete`

## Notes

- Companion spec: SPEC-011 covers articles, case studies, and global chrome. Independent of this spec — they can ship in either order.
- Baseline PageSpeed report captured 2026-05-04 12:18 AM — see plan file at `C:\Users\coffe\.claude\plans\homepage-articles-and-case-glittery-dusk.md`.
- The `frameloop="always"` decision on desktop is intentional for the continuous Galaxy/Merkaba ambient motion. We are NOT switching desktop to demand-based.
- Future enhancement candidates (deferred): `prefers-reduced-motion` honoring; scroll-progress-driven LOD (drop more detail when scrolled past hero); Page Visibility API extended to also pause when canvas is fully scrolled out of view.
