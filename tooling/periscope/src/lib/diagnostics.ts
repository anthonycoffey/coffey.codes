/**
 * Shared types for periscope's doctor command.
 *
 * Each engine ships a `diagnose*()` function in src/diagnostics/ that
 * returns a DiagnosticReport. The doctor command aggregates reports,
 * prints them, and exits with the right code.
 */

import type { EngineName } from '../types/snapshot.js';

export type CheckStatus = 'ok' | 'warn' | 'fail';

export interface Check {
  /** Short human-readable name, e.g. "listAccessibleCustomers". */
  name: string;
  status: CheckStatus;
  /** Optional one-line detail printed under the check. */
  detail?: string;
}

export interface DiagnosticReport {
  engine: EngineName;
  /** Overall status -- worst of any check's status. */
  status: CheckStatus;
  checks: Check[];
  /** Optional advisory notes printed under the report. */
  notes?: string[];
}

/** Reduce a list of check statuses to an overall status (worst wins). */
export function overallStatus(checks: Check[]): CheckStatus {
  if (checks.some((c) => c.status === 'fail')) return 'fail';
  if (checks.some((c) => c.status === 'warn')) return 'warn';
  return 'ok';
}
