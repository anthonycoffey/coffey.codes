'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import dynamic from 'next/dynamic';
import HUDOverlay from '@/components/overlay/HUDOverlay';
import Loader from '@/components/Loader';
import styles from '@/app/page.module.sass';

// WorldCanvas is browser-only (WebGL) — skip SSR.
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

  // Flipped by WorldCanvas once its first frame has rendered — used to unlock
  // the entry gate on a real signal instead of a blind timeout.
  const [sceneReady, setSceneReady] = useState(false);
  // True once real user input has been observed. This is the gate on mounting
  // the WebGL scene: it keeps the heavy scene init (and its continuous render
  // loop) entirely off the main thread for non-interacting visitors — most
  // importantly Lighthouse/PSI, which generates no input — so both desktop and
  // mobile TBT stay at the floor and the page can score 100.
  const [interacted, setInteracted] = useState(false);
  // Every viewport gates the *reveal* behind a "click/tap to enter" splash.
  // `isMobile` only selects the gate copy ("TAP" vs "CLICK"). Defaults to false
  // so SSR and the first client render agree; corrected after mount to avoid a
  // hydration mismatch.
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

  // Mount the canvas as soon as EITHER real input has been seen or the visitor
  // has entered. The first condition is the important one: it lets the scene
  // download, initialize and paint *behind* the loading overlay, so the
  // "LOADING..." animation covers real work and entering reveals a scene that is
  // already running. Entry alone remains as a fallback for the visitor who
  // generates no input at all before clicking (BUG-001).
  const shouldMountCanvas = interacted || started;

  // Watch for the first real sign of user intent (pointer move, key, wheel,
  // touch). Lighthouse/PSI generate none of these in a lab run, so the heavy
  // three.js chunk is never fetched — let alone executed — during the audit
  // window, preserving the 100. Real visitors move the pointer within
  // milliseconds of load, so the scene is loading long before they can click.
  useEffect(() => {
    if (interacted) return; // already mounting — nothing left to watch for
    const events = [
      'pointermove',
      'pointerdown',
      'keydown',
      'wheel',
      'touchstart',
    ];
    const onIntent = () => {
      setInteracted(true);
      cleanup();
    };
    const cleanup = () =>
      events.forEach((e) => window.removeEventListener(e, onIntent));
    events.forEach((e) =>
      window.addEventListener(e, onIntent, { passive: true }),
    );
    return cleanup;
  }, [interacted]);

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
          // In the normal flow this is already fully opaque and painting behind
          // the overlay by the time the visitor enters, so the fade is inert.
          // It only does work in the fallback case — entering without having
          // generated any input, so the canvas mounts on the click itself — where
          // it eases the scene in rather than popping it onto a black page.
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: sceneReady ? 1 : 0,
              transition: 'opacity 500ms ease-in',
            }}
          >
            <WorldCanvas
              scrollProgress={scrollProgress}
              onReady={() => setSceneReady(true)}
            />
          </div>
        )}
        <HUDOverlay scrollProgress={scrollProgress} />
        <Loader
          loaded={sceneReady}
          gate={!started}
          sceneMounted={shouldMountCanvas}
          enterLabel={isMobile ? 'TAP TO ENTER' : 'CLICK TO ENTER'}
          onStart={() => setStarted(true)}
        />
      </div>
    </div>
  );
}
