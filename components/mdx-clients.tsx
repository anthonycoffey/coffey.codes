'use client';

import dynamic from 'next/dynamic';

export const MermaidChart = dynamic(() => import('./MermaidChart'), {
  ssr: false,
});
