'use client';

import { Group } from '@visx/group';
import { Bar } from '@visx/shape';
import { scaleBand, scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { LinearGradient } from '@visx/gradient';
import {
  useTooltip,
  useTooltipInPortal,
  TooltipWithBounds,
} from '@visx/tooltip';
import ChartContainer from './ChartContainer';
import { chartTheme } from './chartTheme';

export type BarDatum = { label: string; value: number };

export type BarChartProps = {
  title: string;
  data: BarDatum[];
  unit?: string;
  lowerIsBetter?: boolean;
  height?: number;
};

export default function BarChart(props: BarChartProps) {
  return (
    <ChartContainer title={props.title} height={props.height ?? 340}>
      {({ width, height }) => (
        <BarChartSvg {...props} width={width} height={height} />
      )}
    </ChartContainer>
  );
}

function BarChartSvg({
  data,
  unit,
  lowerIsBetter,
  width,
  height,
}: BarChartProps & { width: number; height: number }) {
  const margin = { top: 28, right: 24, bottom: 48, left: 56 };
  const innerW = Math.max(0, width - margin.left - margin.right);
  const innerH = Math.max(0, height - margin.top - margin.bottom);

  const xScale = scaleBand<string>({
    domain: data.map((d) => d.label),
    range: [0, innerW],
    padding: 0.35,
  });
  const maxVal = Math.max(...data.map((d) => d.value));
  const minVal = Math.min(...data.map((d) => d.value));
  const yScale = scaleLinear<number>({
    domain: [0, maxVal * 1.15 || 1],
    range: [innerH, 0],
    nice: true,
  });

  const colorFor = (d: BarDatum, idx: number) => {
    if (lowerIsBetter !== undefined) {
      const isWin = lowerIsBetter ? d.value === minVal : d.value === maxVal;
      return isWin ? chartTheme.series[0] : chartTheme.series[1];
    }
    return chartTheme.series[idx % chartTheme.series.length];
  };

  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip<BarDatum>();
  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    scroll: true,
    detectBounds: true,
  });

  return (
    <div ref={containerRef} style={{ position: 'relative', width, height }}>
      <svg width={width} height={height} data-chart="bar">
        <defs>
          {data.map((d, idx) => {
            const color = colorFor(d, idx);
            return (
              <LinearGradient
                key={`grad-${idx}`}
                id={`bar-grad-${idx}`}
                from={color}
                to={color}
                fromOpacity={1}
                toOpacity={0.5}
                vertical
              />
            );
          })}
        </defs>
        <Group left={margin.left} top={margin.top}>
          <AxisLeft
            scale={yScale}
            stroke={chartTheme.axisStroke}
            tickStroke={chartTheme.axisStroke}
            tickLabelProps={() => ({
              ...chartTheme.axisLabel,
              textAnchor: 'end',
              dx: '-0.25em',
              dy: '0.33em',
            })}
            numTicks={5}
            tickFormat={(v) => `${v}${unit ?? ''}`}
            label={unit ? `Value (${unit})` : 'Value'}
            labelProps={{
              ...chartTheme.axisLabel,
              fontSize: 11,
              textAnchor: 'middle',
            }}
            labelOffset={36}
          />
          <AxisBottom
            top={innerH}
            scale={xScale}
            stroke={chartTheme.axisStroke}
            tickStroke={chartTheme.axisStroke}
            tickLabelProps={() => ({
              ...chartTheme.axisLabel,
              textAnchor: 'middle',
              dy: '0.5em',
            })}
          />
          {data.map((d, idx) => {
            const x = xScale(d.label) ?? 0;
            const bw = xScale.bandwidth();
            const y = yScale(d.value);
            const bh = Math.max(0, innerH - y);
            return (
              <g key={d.label} data-bar-label={d.label}>
                <Bar
                  x={x}
                  y={y}
                  width={bw}
                  height={bh}
                  fill={`url(#bar-grad-${idx})`}
                  rx={4}
                  onMouseMove={(e) => {
                    showTooltip({
                      tooltipData: d,
                      tooltipLeft: e.clientX,
                      tooltipTop: e.clientY,
                    });
                  }}
                  onMouseLeave={() => hideTooltip()}
                />
                <text
                  x={x + bw / 2}
                  y={y - 8}
                  textAnchor="middle"
                  {...chartTheme.valueLabel}
                >
                  {d.value}
                  {unit ?? ''}
                </text>
              </g>
            );
          })}
        </Group>
      </svg>
      {tooltipOpen && tooltipData && (
        <TooltipInPortal
          key={`${tooltipLeft}-${tooltipTop}`}
          top={tooltipTop}
          left={tooltipLeft}
          style={chartTheme.tooltip}
        >
          <div style={{ fontWeight: 700, marginBottom: 2 }}>
            {tooltipData.label}
          </div>
          <div>
            {tooltipData.value}
            {unit ?? ''}
          </div>
        </TooltipInPortal>
      )}
    </div>
  );
}

// Re-exported for tests/consumers that don't want the portal wrapper.
export { TooltipWithBounds };
