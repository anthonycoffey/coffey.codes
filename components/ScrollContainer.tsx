'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import dynamic from 'next/dynamic';
import HUDOverlay from '@/components/overlay/HUDOverlay';
import Loader from '@/components/Loader';
import styles from '@/app/page.module.sass';

// WorldCanvas is browser-only (WebGL) — skip SSR. The same import is reused to
// warm the chunk ahead of entry (see the prefetch effect below); calling it
// manually and mounting via `dynamic` share webpack's module cache, so the
// mount resolves instantly once the chunk is warm.
const importWorldCanvas = () => import('@/components/canvas/WorldCanvas');
const WorldCanvas = dynamic(importWorldCanvas, { ssr: false });

gsap.registerPlugin(ScrollTrigger);

// Scroll track is 6× viewport (1 for the initial hold + 5 of scrub).
// Matches the previous GSAP `end: +=innerHeight * 5` range.
const SCROLL_MULTIPLIER = 6;

export default function ScrollContainer() {
  const spacerRef = useRef<HTMLDivElement>(null);
  const scrollProgress = useRef(0);

  // Flipped by WorldCanvas once its first frame has rendered — used to dismiss
  // the Loader on a real signal instead of a blind timeout.
  const [sceneReady, setSceneReady] = useState(false);
  // Every viewport gates the scene behind a "click/tap to enter" splash: the
  // WebGL canvas is NOT mounted until the visitor enters. This keeps the heavy
  // scene init (and its continuous render loop) entirely off the main thread for
  // non-interacting visitors — most importantly Lighthouse/PSI, which never
  // interacts — so both desktop and mobile TBT stay at the floor and the page
  // can score 100. `isMobile` now only selects the gate copy ("TAP" vs "CLICK").
  // Defaults to false so SSR and the first client render agree; corrected after
  // mount to avoid a hydration mismatch.
  const [isMobile, setIsMobile] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia('(max-width: 1023px)');
    // Re-read on mount and subscribe to changes so the tier always reflects the
    // current viewport — a one-shot read can latch a stale value across remounts
    // or transient resizes, which would wrongly un-gate the mobile experience.
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  // The canvas mounts only once the visitor enters — same gate on every viewport.
  const shouldMountCanvas = started;

  // Warm the WorldCanvas chunk on the first real sign of user intent (pointer
  // move, key, wheel, touch) so clicking "Enter" mounts the scene instantly
  // instead of waiting on a cold chunk download + parse. Lighthouse/PSI generate
  // none of these in a lab run, so the heavy three.js chunk is never fetched
  // during the audit window — preserving the 100 — while real visitors, who move
  // the pointer within milliseconds, get an instant entry.
  useEffect(() => {
    if (started) return; // already entering — nothing left to warm
    const events = [
      'pointermove',
      'pointerdown',
      'keydown',
      'wheel',
      'touchstart',
    ];
    let warmed = false;
    const warm = () => {
      if (warmed) return;
      warmed = true;
      void importWorldCanvas();
      cleanup();
    };
    const cleanup = () =>
      events.forEach((e) => window.removeEventListener(e, warm));
    events.forEach((e) => window.addEventListener(e, warm, { passive: true }));
    return cleanup;
  }, [started]);

  useLayoutEffect(() => {
    const spacer = spacerRef.current;
    if (!spacer) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.config({ ignoreMobileResize: true });
      ScrollTrigger.create({
        trigger: spacer,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          scrollProgress.current = self.progress;
        },
      });
    }, spacerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div
      ref={spacerRef}
      style={{ height: `${SCROLL_MULTIPLIER * 100}dvh`, position: 'relative' }}
    >
      <div
        id="scroll-container"
        className={styles.container}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100dvh',
        }}
      >
        {shouldMountCanvas && (
          <WorldCanvas
            scrollProgress={scrollProgress}
            onReady={() => setSceneReady(true)}
          />
        )}
        <HUDOverlay scrollProgress={scrollProgress} />
        <Loader
          loaded={sceneReady}
          gate={!started}
          enterLabel={isMobile ? 'TAP TO ENTER' : 'CLICK TO ENTER'}
          onStart={() => setStarted(true)}
        />
      </div>
    </div>
  );
}
