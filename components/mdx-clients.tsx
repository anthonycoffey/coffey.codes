'use client';

import dynamic from 'next/dynamic';

export const ThreeScene = dynamic(() => import('./ThreeScene'), {
  ssr: false,
});

export const FishbowlScene = dynamic(() => import('./FishbowlScene'), {
  ssr: false,
});

export const SceneExplorer = dynamic(() => import('./SceneExplorer'), {
  ssr: false,
});

export const MermaidChart = dynamic(() => import('./MermaidChart'), {
  ssr: false,
});
