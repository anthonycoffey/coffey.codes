import { describe, it, expect } from 'vitest';
import { PERISCOPE_VERSION } from '../../src/index.js';

describe('periscope package skeleton', () => {
  it('exports a version constant', () => {
    expect(PERISCOPE_VERSION).toBe('0.0.0-dev');
  });
});
