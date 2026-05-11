#!/usr/bin/env node
/**
 * Competitor URL probe — SPEC-020 #4.
 *
 * Single URL in, top 30 keyword ideas out (to stdout). Useful before
 * writing a competitive piece. No file output; one-shot exploratory tool.
 *
 * Usage:
 *   node scripts/keyword-probe-url.mjs https://competitor.com/their-post
 */

import { getAdsAuth, generateIdeasFromUrl } from './lib/google-ads.mjs';

const TOP_N = 30;

const USE_COLOR = process.stdout.isTTY && !process.env.NO_COLOR;
const c = (code) => (s) => (USE_COLOR ? `\x1b[${code}m${s}\x1b[0m` : String(s));
const bold = c('1');
const dim = c('2');
const cyan = c('36');

function fmtCompetition(v) {
  if (!USE_COLOR) return v ?? '?';
  if (v === 'LOW') return c('32')(v); // green
  if (v === 'MEDIUM') return c('33')(v); // yellow
  if (v === 'HIGH') return c('31')(v); // red
  return v ?? '?';
}

async function main() {
  const url = process.argv[2];
  if (!url || !url.startsWith('http')) {
    console.error('Usage: node scripts/keyword-probe-url.mjs <url>');
    process.exit(2);
  }

  const auth = await getAdsAuth();
  if (!auth) {
    console.error(
      '[probe-url] Google Ads env vars not configured. See docs/documentation/guides/seo-snapshot-setup.md.',
    );
    process.exit(1);
  }

  console.error(`[probe-url] Fetching ideas for ${url}…`);

  let ideas;
  try {
    ideas = await generateIdeasFromUrl(url, { pageSize: 100 });
  } catch (err) {
    console.error(`[probe-url] failed: ${err?.message ?? err}`);
    process.exit(1);
  }

  if (ideas.length === 0) {
    console.log(
      `\nNo keyword ideas returned for ${url}. Possible causes: URL not indexed by Google, redirect chain, robots.txt block, or genuinely too niche.`,
    );
    return;
  }

  ideas.sort((a, b) => {
    const av = a.volumeAvgMonthly ?? 0;
    const bv = b.volumeAvgMonthly ?? 0;
    return bv - av;
  });

  console.log('');
  console.log(bold(`Keyword ideas for ${url}`));
  console.log('');
  const header = `  ${'KEYWORD'.padEnd(40)} ${'VOLUME'.padEnd(12)} ${'COMPETITION'.padEnd(12)} ${'INDEX'.padStart(5)}`;
  console.log(dim(header));
  for (const idea of ideas.slice(0, TOP_N)) {
    const kw = String(idea.keyword ?? '?').slice(0, 40).padEnd(40);
    const bucket = String(idea.volumeBucket ?? 'INSUFFICIENT').padEnd(12);
    const comp = fmtCompetition(idea.competition).padEnd(
      USE_COLOR ? 22 : 12, // account for ANSI codes
    );
    const idx = String(idea.competitionIndex ?? '?').padStart(5);
    console.log(`  ${cyan(kw)} ${bucket} ${comp} ${idx}`);
  }
  console.log('');
  console.log(
    dim(`(${Math.min(TOP_N, ideas.length)} of ${ideas.length} total ideas shown, sorted by avg monthly volume desc)`),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
