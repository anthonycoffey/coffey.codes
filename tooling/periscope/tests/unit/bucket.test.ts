import { describe, expect, it } from 'vitest';

import {
  BUCKET_ORDER,
  bucketLabel,
  bucketRank,
} from '../../src/lib/bucket.js';

describe('bucketLabel', () => {
  it('returns <100 for null/undefined/zero', () => {
    expect(bucketLabel(null)).toBe('<100');
    expect(bucketLabel(undefined)).toBe('<100');
    expect(bucketLabel(0)).toBe('<100');
    expect(bucketLabel('')).toBe('<100');
  });

  it('returns <100 for values below 100', () => {
    expect(bucketLabel(99)).toBe('<100');
    expect(bucketLabel(1)).toBe('<100');
  });

  it('returns 100-1K for values 100-999', () => {
    expect(bucketLabel(100)).toBe('100-1K');
    expect(bucketLabel(500)).toBe('100-1K');
    expect(bucketLabel(999)).toBe('100-1K');
  });

  it('returns 1K-10K for values 1000-9999', () => {
    expect(bucketLabel(1000)).toBe('1K-10K');
    expect(bucketLabel(5000)).toBe('1K-10K');
    expect(bucketLabel(9999)).toBe('1K-10K');
  });

  it('returns 10K-100K for values 10000-99999', () => {
    expect(bucketLabel(10000)).toBe('10K-100K');
    expect(bucketLabel(50000)).toBe('10K-100K');
    expect(bucketLabel(99999)).toBe('10K-100K');
  });

  it('returns 100K+ for values >=100000', () => {
    expect(bucketLabel(100000)).toBe('100K+');
    expect(bucketLabel(1_000_000)).toBe('100K+');
  });

  it('coerces string inputs', () => {
    expect(bucketLabel('1500')).toBe('1K-10K');
  });
});

describe('bucketRank', () => {
  it('returns the index of a known bucket', () => {
    expect(bucketRank('<100')).toBe(0);
    expect(bucketRank('100-1K')).toBe(1);
    expect(bucketRank('1K-10K')).toBe(2);
    expect(bucketRank('10K-100K')).toBe(3);
    expect(bucketRank('100K+')).toBe(4);
  });

  it('returns -1 for unknown labels', () => {
    expect(bucketRank('1M+')).toBe(-1);
    expect(bucketRank('')).toBe(-1);
    expect(bucketRank(null)).toBe(-1);
    expect(bucketRank(undefined)).toBe(-1);
  });

  it('preserves the BUCKET_ORDER sequence', () => {
    expect(BUCKET_ORDER).toEqual(['<100', '100-1K', '1K-10K', '10K-100K', '100K+']);
  });
});
