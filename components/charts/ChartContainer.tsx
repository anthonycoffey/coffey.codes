'use client';

import { ParentSize } from '@visx/responsive';
import { ReactNode } from 'react';

type ChartContainerProps = {
  title: string;
  height?: number;
  children: (dims: { width: number; height: number }) => ReactNode;
};

export default function ChartContainer({
  title,
  height = 340,
  children,
}: ChartContainerProps) {
  return (
    <figure className="my-10 not-prose">
      <figcaption className="text-sm font-bold uppercase tracking-widest text-c-muted mb-3">
        {title}
      </figcaption>
      <div
        className="bg-bg-alt border border-border rounded-xl px-3 py-4"
        style={{ width: '100%', height }}
      >
        <ParentSize>
          {({ width, height: h }) =>
            width > 0 && h > 0 ? children({ width, height: h }) : null
          }
        </ParentSize>
      </div>
    </figure>
  );
}
