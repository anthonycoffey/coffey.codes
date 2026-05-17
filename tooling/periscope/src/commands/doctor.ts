/**
 * `periscope doctor` command.
 *
 * Runs credential + access checks against the engines periscope talks
 * to. Currently the Ads engine is the only one with a diagnostic
 * module; other engines (gsc, ga4, bing) can plug in by adding
 * src/diagnostics/<engine>.ts and registering here.
 *
 * Exits 0 when all checks pass, 1 when any fail, 2 when an unknown
 * engine was requested.
 */

import { existsSync } from 'node:fs';
import path from 'node:path';

import { diagnoseAds } from '../diagnostics/ads.js';
import { bold, dim, green, red, yellow } from '../lib/colors.js';
import type { CheckStatus, DiagnosticReport } from '../lib/diagnostics.js';

export interface DoctorCommandOptions {
  /** Optional engine filter. If unset, all available diagnostics run. */
  engine?: string;
  /** Project root override. Defaults to process.cwd(). */
  repoRoot?: string;
}

const ENGINE_LABELS: Record<string, string> = {
  keywords: 'Google Ads (keywords engine)',
};

const AVAILABLE_DIAGNOSTICS: Record<
  string,
  (repoRoot: string) => Promise<DiagnosticReport>
> = {
  // Alias `ads` to the keywords-engine diagnostic since users think
  // "Ads" while periscope's engine name is `keywords`.
  ads: diagnoseAds,
  keywords: diagnoseAds,
};

function statusGlyph(s: CheckStatus): string {
  if (s === 'ok') return green('✓');
  if (s === 'warn') return yellow('!');
  return red('✗');
}

function statusWord(s: CheckStatus): string {
  if (s === 'ok') return green('ok');
  if (s === 'warn') return yellow('warn');
  return red('fail');
}

export function printReport(
  report: DiagnosticReport,
  out: NodeJS.WriteStream = process.stdout,
): void {
  const label = ENGINE_LABELS[report.engine] ?? report.engine;
  out.write('\n');
  out.write(`${bold(label)}  ${statusWord(report.status)}\n`);
  for (const check of report.checks) {
    out.write(`  ${statusGlyph(check.status)} ${check.name}\n`);
    if (check.detail) {
      out.write(`     ${dim(check.detail)}\n`);
    }
  }
  if (report.notes?.length) {
    out.write('\n');
    for (const note of report.notes) {
      out.write(`  ${dim('note:')} ${note}\n`);
    }
  }
}

function loadDotenv(repoRoot: string): void {
  if (typeof process.loadEnvFile !== 'function') return;
  for (const name of ['.env', '.env.local']) {
    const f = path.join(repoRoot, name);
    if (existsSync(f)) {
      try {
        process.loadEnvFile(f);
      } catch {
        // Tolerate malformed env files; engine checks surface missing values.
      }
    }
  }
}

export async function runDoctor(options: DoctorCommandOptions = {}): Promise<void> {
  const repoRoot = options.repoRoot ?? process.cwd();
  loadDotenv(repoRoot);

  const requested = options.engine?.toLowerCase();
  const enginesToRun: string[] = requested
    ? [requested]
    : Object.keys(AVAILABLE_DIAGNOSTICS).filter(
        (k) => !['ads'].includes(k), // dedupe the `ads` alias from default run
      );

  if (requested && !AVAILABLE_DIAGNOSTICS[requested]) {
    process.stderr.write(
      `[doctor] Unknown engine: ${requested}. Supported: ${Object.keys(AVAILABLE_DIAGNOSTICS).join(', ')}\n`,
    );
    process.exit(2);
  }

  const reports: DiagnosticReport[] = [];
  for (const engine of enginesToRun) {
    const diagnose = AVAILABLE_DIAGNOSTICS[engine];
    if (!diagnose) continue;
    const report = await diagnose(repoRoot);
    reports.push(report);
    printReport(report);
  }

  process.stdout.write('\n');
  const failed = reports.filter((r) => r.status === 'fail');
  const warned = reports.filter((r) => r.status === 'warn');
  if (failed.length > 0) {
    process.stdout.write(red(`Failed: ${failed.length}/${reports.length}\n`));
    process.exit(1);
  } else if (warned.length > 0) {
    process.stdout.write(
      yellow(`Warnings: ${warned.length}/${reports.length}\n`),
    );
  } else {
    process.stdout.write(green(`All ${reports.length} check group(s) passed.\n`));
  }
}
