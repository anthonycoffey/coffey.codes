import { Writable } from 'node:stream';

import { describe, expect, it } from 'vitest';

import { printReport } from '../../src/commands/doctor.js';
import {
  type Check,
  type DiagnosticReport,
  overallStatus,
} from '../../src/lib/diagnostics.js';

// ── overallStatus ──────────────────────────────────────────────────────

describe('overallStatus', () => {
  it('returns ok when every check is ok', () => {
    const checks: Check[] = [
      { name: 'a', status: 'ok' },
      { name: 'b', status: 'ok' },
    ];
    expect(overallStatus(checks)).toBe('ok');
  });

  it('returns warn when any check is warn and none failed', () => {
    const checks: Check[] = [
      { name: 'a', status: 'ok' },
      { name: 'b', status: 'warn' },
    ];
    expect(overallStatus(checks)).toBe('warn');
  });

  it('returns fail when any check failed (even with warns)', () => {
    const checks: Check[] = [
      { name: 'a', status: 'warn' },
      { name: 'b', status: 'fail' },
      { name: 'c', status: 'ok' },
    ];
    expect(overallStatus(checks)).toBe('fail');
  });

  it('returns ok for an empty check list', () => {
    expect(overallStatus([])).toBe('ok');
  });
});

// ── printReport ────────────────────────────────────────────────────────

function captureWritable(): { sink: Writable & { value: () => string }; chunks: string[] } {
  const chunks: string[] = [];
  const sink = new Writable({
    write(chunk, _enc, cb) {
      chunks.push(chunk.toString());
      cb();
    },
  });
  // Attach a helper for assertions.
  (sink as Writable & { value: () => string }).value = () => chunks.join('');
  return { sink: sink as Writable & { value: () => string }, chunks };
}

describe('printReport', () => {
  it('emits the engine label, status word, and every check name', () => {
    const report: DiagnosticReport = {
      engine: 'keywords',
      status: 'ok',
      checks: [
        { name: 'Service account loaded', status: 'ok', detail: 'svc@example' },
        { name: 'Access token mint', status: 'ok' },
      ],
    };
    const { sink } = captureWritable();
    // printReport's signature takes a NodeJS.WriteStream; the Writable cast is safe here.
    printReport(report, sink as unknown as NodeJS.WriteStream);
    const out = sink.value();
    expect(out).toContain('Google Ads');
    expect(out).toContain('Service account loaded');
    expect(out).toContain('svc@example');
    expect(out).toContain('Access token mint');
  });

  it('prints notes section when notes are present', () => {
    const report: DiagnosticReport = {
      engine: 'keywords',
      status: 'fail',
      checks: [{ name: 'listAccessibleCustomers', status: 'fail', detail: 'HTTP 403' }],
      notes: ['Token may be revoked.', 'Service account may need re-adding.'],
    };
    const { sink } = captureWritable();
    printReport(report, sink as unknown as NodeJS.WriteStream);
    const out = sink.value();
    expect(out).toContain('Token may be revoked.');
    expect(out).toContain('Service account may need re-adding.');
  });

  it('omits the notes section when there are no notes', () => {
    const report: DiagnosticReport = {
      engine: 'keywords',
      status: 'ok',
      checks: [{ name: 'ok', status: 'ok' }],
    };
    const { sink } = captureWritable();
    printReport(report, sink as unknown as NodeJS.WriteStream);
    expect(sink.value()).not.toContain('note:');
  });
});
