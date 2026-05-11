'use client';

import dynamic from 'next/dynamic';
import type { LineChartProps } from '@/components/charts';

const LineChart = dynamic(() => import('@/components/charts/LineChart'), {
  ssr: false,
});

export default function CaseStudyLineChartBlock(props: LineChartProps) {
  return <LineChart {...props} />;
}
