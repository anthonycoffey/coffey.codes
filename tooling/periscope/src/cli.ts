/**
 * Periscope CLI entry point.
 *
 * Built by tsup into dist/cli.js with a #!/usr/bin/env node banner.
 * Invoked as `periscope <command>` after `npm install`, or
 * `node tooling/periscope/dist/cli.js <command>` during local development.
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';

import { runAuditArticles } from './commands/audit-articles.js';
import { runDiff } from './commands/diff.js';
import { runDiscoverTopics } from './commands/discover-topics.js';
import { runDoctor } from './commands/doctor.js';
import { runProbe } from './commands/probe.js';
import { runSnapshot } from './commands/snapshot.js';
import { runValidateLps } from './commands/validate-lps.js';

/**
 * Read the package version from package.json at runtime. dist/cli.js sits
 * one level below the package root, so `../package.json` works whether
 * installed in node_modules or run from the source repo's dist/.
 */
function readPackageVersion(): string {
  try {
    const here = path.dirname(fileURLToPath(import.meta.url));
    const pkgPath = path.resolve(here, '..', 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as { version?: string };
    return pkg.version ?? '0.0.0-unknown';
  } catch {
    return '0.0.0-unknown';
  }
}

const program = new Command();

program
  .name('periscope')
  .description('SEO data tooling: pull snapshots, diff them, run keyword research.')
  .version(readPackageVersion());

// ---------------------------------------------------------------------------
// snapshot
// ---------------------------------------------------------------------------

program
  .command('snapshot')
  .description('Pull a multi-engine SEO snapshot and write JSON + Markdown to outputDir.')
  .option('--engines <list>', 'Comma-separated engine list (gsc,ga4,bing,keywords)')
  .option('--window <days>', 'Window in days', '365')
  .option(
    '--asof <date>',
    'Anchor "today" to a YYYY-MM-DD; drives output filename and engine windows',
  )
  .option('--dry-run', 'Plan without making API calls')
  .option('--config <path>', 'Override periscope.config path')
  .addHelpText(
    'after',
    `
Examples:
  $ periscope snapshot --dry-run
  $ periscope snapshot --engines=gsc,ga4
  $ periscope snapshot --window=180 --asof=2026-05-09
`,
  )
  .action(async (opts: {
    engines?: string;
    window?: string;
    asof?: string;
    dryRun?: boolean;
    config?: string;
  }) => {
    await runSnapshot({
      engines: opts.engines,
      window: opts.window,
      asof: opts.asof,
      dryRun: opts.dryRun,
      configPath: opts.config,
    });
  });

// ---------------------------------------------------------------------------
// diff
// ---------------------------------------------------------------------------

program
  .command('diff <older> <newer>')
  .description('Diff two snapshot JSON files. Prints per-engine deltas, movers, fallers.')
  .addHelpText(
    'after',
    `
Examples:
  $ periscope diff snapshot-2026-05-01.json snapshot-2026-05-15.json
`,
  )
  .action((older: string, newer: string) => {
    runDiff({ older, newer });
  });

// ---------------------------------------------------------------------------
// audit articles
// ---------------------------------------------------------------------------

const audit = program.command('audit').description('Auditing tools.');

audit
  .command('articles')
  .description('Audit MDX articles: flag OPPORTUNITY vs WELL_TARGETED keyword fit.')
  .option('--config <path>', 'Override periscope.config path')
  .addHelpText(
    'after',
    `
Examples:
  $ periscope audit articles
`,
  )
  .action(async (opts: { config?: string }) => {
    await runAuditArticles({ configPath: opts.config });
  });

// ---------------------------------------------------------------------------
// discover topics
// ---------------------------------------------------------------------------

const discover = program.command('discover').description('Discovery tools.');

discover
  .command('topics')
  .description('Seed Google Ads with categories + top GSC queries to surface editorial backlog.')
  .option('--config <path>', 'Override periscope.config path')
  .addHelpText(
    'after',
    `
Examples:
  $ periscope discover topics
`,
  )
  .action(async (opts: { config?: string }) => {
    await runDiscoverTopics({ configPath: opts.config });
  });

// ---------------------------------------------------------------------------
// validate lps
// ---------------------------------------------------------------------------

const validate = program.command('validate').description('Validation tools.');

validate
  .command('lps')
  .description('Validate /lp/* pages: UNDER_INVESTED / WELL_TARGETED / OVER_AMBITIOUS verdicts.')
  .option('--config <path>', 'Override periscope.config path')
  .addHelpText(
    'after',
    `
Examples:
  $ periscope validate lps
`,
  )
  .action(async (opts: { config?: string }) => {
    await runValidateLps({ configPath: opts.config });
  });

// ---------------------------------------------------------------------------
// probe
// ---------------------------------------------------------------------------

program
  .command('probe <url>')
  .description('One-shot competitor URL probe. Prints top 30 keyword ideas to stdout.')
  .option('--config <path>', 'Override periscope.config path')
  .addHelpText(
    'after',
    `
Examples:
  $ periscope probe https://competitor.com/their-post
`,
  )
  .action(async (url: string) => {
    await runProbe({ url });
  });

// ---------------------------------------------------------------------------
// doctor
// ---------------------------------------------------------------------------

program
  .command('doctor [engine]')
  .description('Diagnose engine credentials and access. Currently: ads (alias: keywords).')
  .addHelpText(
    'after',
    `
Examples:
  $ periscope doctor              # run all available checks
  $ periscope doctor ads          # check Google Ads access specifically
`,
  )
  .action(async (engine: string | undefined) => {
    await runDoctor({ engine });
  });

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

program.parseAsync(process.argv).catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`[periscope] ${msg}\n`);
  process.exit(1);
});
