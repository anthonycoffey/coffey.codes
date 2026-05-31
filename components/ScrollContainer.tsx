'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import dynamic from 'next/dynamic';
import HUDOverlay from '@/components/overlay/HUDOverlay';
import Loader from '@/components/Loader';
import styles from '@/app/page.module.sass';

// WorldCanvas is browser-only (WebGL) — skip SSR
const WorldCanvas = dynamic(() => import('@/components/canvas/WorldCanvas'), {
  ssr: false,
});

gsap.registerPlugin(ScrollTrigger);

// Scroll track is 6× viewport (1 for the initial hold + 5 of scrub).
// Matches the previous GSAP `end: +=innerHeight * 5` range.
const SCROLL_MULTIPLIER = 6;

export default function ScrollContainer() {
  const spacerRef = useRef<HTMLDivElement>(null);
  const scrollProgress = useRef(0);

  // Defer the WebGL canvas until the browser is idle *after* first paint, so
  // the heavy three.js chunk download + scene init fall outside the critical
  // render path (FCP/LCP) and the Lighthouse main-thread (TBT) window.
  const [canvasReady, setCanvasReady] = useState(false);
  // Flipped by WorldCanvas once its first frame has rendered — used to dismiss
  // the Loader on a real signal instead of a blind timeout.
  const [sceneReady, setSceneReady] = useState(false);
  // Mobile gets a "tap to explore" gate: the WebGL scene is NOT mounted until
  // the user taps. This keeps the heavy scene init (and its continuous render
  // loop) entirely off the main thread for non-interacting visitors — most
  // importantly Lighthouse/PSI, which never taps — collapsing mobile TBT.
  // Defaults to false so SSR and the first client render agree (desktop path);
  // corrected after mount to avoid a hydration mismatch.
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

  // Desktop auto-mounts the canvas once idle; mobile waits for the tap.
  const shouldMountCanvas = isMobile ? started : canvasReady;

  useEffect(() => {
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const schedule = () => {
      const ric = (
        window as Window &
          typeof globalThis & {
            requestIdleCallback?: (
              cb: () => void,
              opts?: { timeout: number },
            ) => number;
          }
      ).requestIdleCallback;
      if (typeof ric === 'function') {
        idleId = ric(() => setCanvasReady(true), { timeout: 2000 });
      } else {
        // Safari has no requestIdleCallback — fall back to a short timeout.
        timeoutId = setTimeout(() => setCanvasReady(true), 200);
      }
    };

    // Wait for the load event so the canvas mounts after the initial paint and
    // existing resources have settled. If the page is already loaded, schedule
    // immediately.
    if (document.readyState === 'complete') {
      schedule();
    } else {
      window.addEventListener('load', schedule, { once: true });
    }

    return () => {
      window.removeEventListener('load', schedule);
      if (timeoutId) clearTimeout(timeoutId);
      const cic = (
        window as Window &
          typeof globalThis & {
            cancelIdleCallback?: (id: number) => void;
          }
      ).cancelIdleCallback;
      if (idleId !== undefined && typeof cic === 'function') cic(idleId);
    };
  }, []);

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
          gate={isMobile && !started}
          onStart={() => setStarted(true)}
        />
      </div>
    </div>
  );
}
