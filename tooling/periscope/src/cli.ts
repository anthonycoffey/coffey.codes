/**
 * Periscope CLI entry point.
 *
 * Built by tsup into dist/cli.js with a #!/usr/bin/env node banner.
 * Invoked as `periscope <command>` after `npm install`, or
 * `node tooling/periscope/dist/cli.js <command>` during local development.
 */

import { Command } from 'commander';
import { runSnapshot } from './commands/snapshot.js';

const program = new Command();

program
  .name('periscope')
  .description('SEO data tooling: pull snapshots, diff them, run keyword research.')
  .version('0.0.0-dev');

// ---------------------------------------------------------------------------
// snapshot
// ---------------------------------------------------------------------------

program
  .command('snapshot')
  .description('Pull a multi-engine SEO snapshot and write JSON + Markdown to outputDir.')
  .option('--engines <list>', 'Comma-separated engine list (gsc,ga4,bing,keywords)')
  .option('--window <days>', 'Window in days', '365')
  .option('--asof <date>', 'Anchor "today" to a YYYY-MM-DD; drives output filename and engine windows')
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
  .action(async () => {
    notImplemented('diff');
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
  .action(async () => {
    notImplemented('audit articles');
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
  .action(async () => {
    notImplemented('discover topics');
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
  .action(async () => {
    notImplemented('validate lps');
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
  .action(async () => {
    notImplemented('probe');
  });

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

program.parseAsync(process.argv).catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`[periscope] ${msg}\n`);
  process.exit(1);
});

function notImplemented(name: string): never {
  process.stderr.write(
    `[periscope] '${name}' is scaffolded but not yet implemented. See SPEC-023.\n`,
  );
  process.exit(2);
}
