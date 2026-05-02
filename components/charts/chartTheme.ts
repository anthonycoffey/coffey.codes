export const chartTheme = {
  series: [
    'var(--color-accent-1)',
    'var(--color-accent-3)',
    '#00FFB3',
    '#BD93F9',
  ],
  axisStroke: 'var(--color-border)',
  axisLabel: {
    fill: 'var(--color-text-muted)',
    fontSize: 11,
    fontFamily: 'var(--font-outfit), sans-serif',
    fontWeight: 500,
    letterSpacing: '0.04em',
  } as const,
  valueLabel: {
    fill: 'var(--color-heading)',
    fontSize: 12,
    fontFamily: 'var(--font-outfit), sans-serif',
    fontWeight: 700,
  } as const,
  tooltip: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
    padding: '8px 10px',
    borderRadius: 6,
    fontSize: 12,
    fontFamily: 'var(--font-outfit), sans-serif',
    boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
    pointerEvents: 'none' as const,
  },
};
