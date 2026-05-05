'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const GoogleAnalyticsClient = dynamic(
  () => import('./GoogleAnalyticsClient'),
  { ssr: false },
);

export default function GoogleAnalyticsLazy() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const win = window as Window &
      typeof globalThis & {
        requestIdleCallback?: (cb: () => void) => number;
      };
    const schedule = win.requestIdleCallback ?? ((cb) => setTimeout(cb, 1500));
    const id = schedule(() => setReady(true));
    return () => {
      if (typeof id === 'number' && !win.requestIdleCallback) {
        clearTimeout(id);
      }
    };
  }, []);

  return ready ? <GoogleAnalyticsClient /> : null;
}
