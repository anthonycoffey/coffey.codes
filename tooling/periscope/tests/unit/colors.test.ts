import { describe, expect, it } from 'vitest';

import { color, colorByDelta } from '../../src/lib/colors.js';

// USE_COLOR is computed from process.stdout.isTTY at module load. In the
// vitest runner stdout isn't a TTY, so colors are disabled and the helpers
// produce plain strings. That's exactly the path we want to verify.

describe('color (no-TTY path in vitest)', () => {
  it('returns the input as a string when colors are off', () => {
    const red = color('31');
    expect(red('hello')).toBe('hello');
    expect(red(42)).toBe('42');
  });
});

describe('colorByDelta', () => {
  it('returns dim text for zero (plain string here, dim wrapper has no effect off-TTY)', () => {
    expect(colorByDelta(0, 'flat')).toBe('flat');
  });

  it('returns the input for positive and negative deltas (off-TTY)', () => {
    expect(colorByDelta(5, '+5')).toBe('+5');
    expect(colorByDelta(-3, '-3')).toBe('-3');
  });
});
