'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { LOADER_DISMISSED_EVENT } from '@/lib/loaderEvents';

const ConsentManager = dynamic(() => import('./ConsentManager'), {
  ssr: false,
});

export default function ConsentManagerLazy() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const win = window as Window &
      typeof globalThis & {
        requestIdleCallback?: (cb: () => void) => number;
        __appLoaderActive?: boolean;
      };

    let cancelled = false;
    const reveal = () => {
      if (!cancelled) setReady(true);
    };

    // Defer past first paint as before, then reveal — but if a loading overlay
    // is currently up (the homepage three.js loader), wait for it to slide away
    // first so the banner never overlaps it and animates in cleanly afterwards.
    const proceed = () => {
      if (win.__appLoaderActive) {
        window.addEventListener(LOADER_DISMISSED_EVENT, reveal, { once: true });
      } else {
        reveal();
      }
    };

    const schedule = win.requestIdleCallback ?? ((cb) => setTimeout(cb, 1500));
    const id = schedule(proceed);
    return () => {
      cancelled = true;
      window.removeEventListener(LOADER_DISMISSED_EVENT, reveal);
      if (typeof id === 'number' && !win.requestIdleCallback) {
        clearTimeout(id);
      }
    };
  }, []);

  return ready ? <ConsentManager /> : null;
}
