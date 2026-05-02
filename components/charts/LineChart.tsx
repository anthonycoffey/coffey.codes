'use client';

import { Group } from '@visx/group';
import { LinePath, Circle } from '@visx/shape';
import { scaleLinear, scalePoint } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import {
  useTooltip,
  useTooltipInPortal,
} from '@visx/tooltip';
import ChartContainer from './ChartContainer';
import { chartTheme } from './chartTheme';

export type LineDatum = { label: string; value: number };
export type LineSeries = { name: string; data: LineDatum[] };

export type LineChartProps = {
  title: string;
  series: LineSeries[];
  unit?: string;
  height?: number;
};

export default function LineChart(props: LineChartProps) {
  return (
    <ChartContainer title={props.title} height={props.height ?? 340}>
      {({ width, height }) => (
        <LineChartSvg {...props} width={width} height={height} />
      )}
    </ChartContainer>
  );
}

function LineChartSvg({
  series,
  unit,
  width,
  height,
}: LineChartProps & { width: number; height: number }) {
  const margin = { top: 28, right: 24, bottom: 48, left: 56 };
  const innerW = Math.max(0, width - margin.left - margin.right);
  const innerH = Math.max(0, height - margin.top - margin.bottom);

  const labels = series[0]?.data.map((d) => d.label) ?? [];
  const xScale = scalePoint<string>({
    domain: labels,
    range: [0, innerW],
    padding: 0.5,
  });
  const allValues = series.flatMap((s) => s.data.map((d) => d.value));
  const maxVal = allValues.length ? Math.max(...allValues) : 1;
  const yScale = scaleLinear<number>({
    domain: [0, maxVal * 1.15 || 1],
    range: [innerH, 0],
    nice: true,
  });

  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip<{ name: string; datum: LineDatum }>();
  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    scroll: true,
    detectBounds: true,
  });

  return (
    <div ref={containerRef} style={{ position: 'relative', width, height }}>
      <svg width={width} height={height} data-chart="line">
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
          {series.map((s, sIdx) => {
            const color = chartTheme.series[sIdx % chartTheme.series.length];
            return (
              <g key={s.name}>
                <LinePath<LineDatum>
                  data={s.data}
                  x={(d) => xScale(d.label) ?? 0}
                  y={(d) => yScale(d.value)}
                  stroke={color}
                  strokeWidth={2.5}
                />
                {s.data.map((d) => (
                  <Circle
                    key={`${s.name}-${d.label}`}
                    cx={xScale(d.label) ?? 0}
                    cy={yScale(d.value)}
                    r={4}
                    fill={color}
                    stroke="var(--color-bg)"
                    strokeWidth={2}
                    onMouseMove={(e) =>
                      showTooltip({
                        tooltipData: { name: s.name, datum: d },
                        tooltipLeft: e.clientX,
                        tooltipTop: e.clientY,
                      })
                    }
                    onMouseLeave={() => hideTooltip()}
                  />
                ))}
              </g>
            );
          })}
        </Group>
      </svg>
      {series.length > 1 && (
        <div
          style={{
            position: 'absolute',
            top: 4,
            right: 8,
            display: 'flex',
            gap: 12,
            fontSize: 11,
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-outfit), sans-serif',
          }}
        >
          {series.map((s, sIdx) => (
            <span
              key={s.name}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background:
                    chartTheme.series[sIdx % chartTheme.series.length],
                }}
              />
              {s.name}
            </span>
          ))}
        </div>
      )}
      {tooltipOpen && tooltipData && (
        <TooltipInPortal
          key={`${tooltipLeft}-${tooltipTop}`}
          top={tooltipTop}
          left={tooltipLeft}
          style={chartTheme.tooltip}
        >
          <div style={{ fontWeight: 700, marginBottom: 2 }}>
            {tooltipData.datum.label}
          </div>
          <div>
            {tooltipData.name}: {tooltipData.datum.value}
            {unit ?? ''}
          </div>
        </TooltipInPortal>
      )}
    </div>
  );
}
