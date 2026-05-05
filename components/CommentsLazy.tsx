'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

const Comments = dynamic(() => import('./Comments'), { ssr: false });

export default function CommentsLazy() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section aria-label="Comments" className="mt-12">
      {visible ? <Comments /> : <div ref={sentinelRef} />}
    </section>
  );
}
