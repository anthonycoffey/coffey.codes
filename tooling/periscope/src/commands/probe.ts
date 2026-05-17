/**
 * `periscope probe <url>` command.
 *
 * Single URL in, top 30 keyword ideas out to stdout. Useful before
 * writing a competitive piece. No file output; one-shot exploratory
 * tool.
 */

import { generateIdeasFromUrl } from '../engines/ads.js';
import { getAdsAuth } from '../lib/auth.js';
import { USE_COLOR, bold, color, cyan, dim } from '../lib/colors.js';

const TOP_N = 30;

export interface ProbeCommandOptions {
  url: string;
  repoRoot?: string;
}

function fmtCompetition(v: string | null | undefined): string {
  if (!USE_COLOR) return v ?? '?';
  if (v === 'LOW') return color('32')(v);
  if (v === 'MEDIUM') return color('33')(v);
  if (v === 'HIGH') return color('31')(v);
  return v ?? '?';
}

export async function runProbe(options: ProbeCommandOptions): Promise<void> {
  const repoRoot = options.repoRoot ?? process.cwd();
  const { url } = options;
  if (!url || !url.startsWith('http')) {
    process.stderr.write('Usage: periscope probe <url>\n');
    process.exit(2);
  }

  const auth = await getAdsAuth(repoRoot);
  if (!auth) {
    process.stderr.write(
      '[probe] Google Ads env vars not configured. See docs/documentation/guides/seo-snapshot-setup.md.\n',
    );
    process.exit(1);
  }

  process.stderr.write(`[probe] Fetching ideas for ${url}\n`);

  let ideas;
  try {
    ideas = await generateIdeasFromUrl(url, { pageSize: 100, repoRoot });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    process.stderr.write(`[probe] failed: ${msg}\n`);
    process.exit(1);
  }

  if (ideas.length === 0) {
    process.stdout.write(
      `\nNo keyword ideas returned for ${url}. Possible causes: URL not indexed by Google, redirect chain, robots.txt block, or genuinely too niche.\n`,
    );
    return;
  }

  ideas.sort((a, b) => {
    const av = a.volumeAvgMonthly ?? 0;
    const bv = b.volumeAvgMonthly ?? 0;
    return bv - av;
  });

  process.stdout.write('\n');
  process.stdout.write(bold(`Keyword ideas for ${url}`) + '\n');
  process.stdout.write('\n');
  const header = `  ${'KEYWORD'.padEnd(40)} ${'VOLUME'.padEnd(12)} ${'COMPETITION'.padEnd(12)} ${'INDEX'.padStart(5)}`;
  process.stdout.write(dim(header) + '\n');
  for (const idea of ideas.slice(0, TOP_N)) {
    const kw = String(idea.keyword ?? '?').slice(0, 40).padEnd(40);
    const bucket = String(idea.volumeBucket ?? 'INSUFFICIENT').padEnd(12);
    const comp = fmtCompetition(idea.competition).padEnd(USE_COLOR ? 22 : 12);
    const idx = String(idea.competitionIndex ?? '?').padStart(5);
    process.stdout.write(`  ${cyan(kw)} ${bucket} ${comp} ${idx}\n`);
  }
  process.stdout.write('\n');
  process.stdout.write(
    dim(
      `(${Math.min(TOP_N, ideas.length)} of ${ideas.length} total ideas shown, sorted by avg monthly volume desc)`,
    ) + '\n',
  );
}
