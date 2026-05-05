'use client';

import dynamic from 'next/dynamic';
import type { BarChartProps } from '@/components/charts';

const BarChart = dynamic(() => import('@/components/charts/BarChart'), {
  ssr: false,
});

export default function CaseStudyChartBlock(props: BarChartProps) {
  return <BarChart {...props} />;
}
