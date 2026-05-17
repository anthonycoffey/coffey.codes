/**
 * Google Ads volume bucket helpers.
 *
 * Accounts without spend history return bucketed volumes only.
 * Accounts with spend get precise integers; we still bucket them for
 * comparison consistency across snapshots.
 */

import type { VolumeBucket } from '../types/snapshot.js';

export const BUCKET_ORDER: VolumeBucket[] = [
  '<100',
  '100-1K',
  '1K-10K',
  '10K-100K',
  '100K+',
];

/** Position in BUCKET_ORDER (0..4). -1 for unknown labels. */
export function bucketRank(label: string | null | undefined): number {
  if (!label) return -1;
  return BUCKET_ORDER.indexOf(label as VolumeBucket);
}

/**
 * Derive a bucket label from an average-monthly-searches number.
 * Returns '<100' for null/0 so the result is always a valid label.
 */
export function bucketLabel(avgMonthly: number | string | null | undefined): VolumeBucket {
  const n = Number(avgMonthly ?? 0);
  if (!n || n < 100) return '<100';
  if (n < 1000) return '100-1K';
  if (n < 10000) return '1K-10K';
  if (n < 100000) return '10K-100K';
  return '100K+';
}
