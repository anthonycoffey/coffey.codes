/**
 * `periscope validate lps` command.
 *
 * For each <landingPages.dir>/<slug>/<pageFile>, extract the metadata
 * title and the first <h1>, seed Google Ads' KeywordPlanIdeaService
 * with both, and issue a verdict on whether the LP is targeting
 * realistic keyword volume.
 *
 * Verdict logic (per SPEC-020):
 *   - UNDER_INVESTED  : top idea volume bucket is <100 or 100-1K
 *   - WELL_TARGETED   : top idea volume bucket is 1K-10K or 10K-100K,
 *                       competition is LOW or MEDIUM (and 1K-10K+
 *                       generally, even at moderate competition)
 *   - OVER_AMBITIOUS  : top idea volume bucket is 10K-100K or 100K+,
 *                       competition is HIGH
 *
 * Output: <outputDir>/keyword-lp-validation-<YYYY-MM-DD>.md
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { promises as fs } from 'node:fs';
import path from 'node:path';

import {
  generateKeywordIdeas,
  type KeywordIdeaResult,
} from '../engines/ads.js';
import { getAdsAuth } from '../lib/auth.js';
import { bucketRank } from '../lib/bucket.js';
import { loadConfig } from '../lib/config.js';

const TOP_N_IDEAS = 5;
type Verdict =
  | 'WELL_TARGETED'
  | 'UNDER_INVESTED'
  | 'OVER_AMBITIOUS'
  | 'NO_IDEAS'
  | 'INSUFFICIENT_DATA';

export interface ValidateLpsCommandOptions {
  configPath?: string;
  repoRoot?: string;
}

interface LandingPage {
  slug: string;
  file: string;
  title?: string | null;
  h1?: string | null;
  ideas?: KeywordIdeaResult[];
  ideasError?: string;
  verdict?: Verdict;
}

function ymd(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

// ── LP extraction ───────────────────────────────────────────────────────

function listLps(lpDir: string, pageFile: string): LandingPage[] {
  if (!existsSync(lpDir)) return [];
  const out: LandingPage[] = [];
  for (const name of readdirSync(lpDir)) {
    const dirPath = path.join(lpDir, name);
    if (!statSync(dirPath).isDirectory()) continue;
    const pagePath = path.join(dirPath, pageFile);
    if (existsSync(pagePath)) {
      out.push({ slug: name, file: pagePath });
    }
  }
  return out;
}

function extractTitleAndH1(
  source: string,
  brandSuffix: string | undefined,
): { title: string | null; h1: string | null } {
  let title: string | null = null;
  const titleMatch = source.match(/title:\s*['"]([^'"]+)['"]/);
  if (titleMatch) {
    title = titleMatch[1] ?? null;
  }
  if (title && brandSuffix) {
    // Strip everything from the brand suffix onward (e.g. " | Anthony Coffey")
    const idx = title.indexOf(brandSuffix);
    if (idx > 0) title = title.slice(0, idx).trim();
  } else if (title) {
    // Default: strip after the first " | " if present.
    const piped = title.split(' | ');
    if (piped.length > 1) title = (piped[0] ?? '').trim();
  }
  let h1: string | null = null;
  const h1Match = source.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  if (h1Match) {
    h1 = (h1Match[1] ?? '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/[{][^}]+[}]/g, '')
      .trim();
  }
  return { title, h1 };
}

// ── Verdict ─────────────────────────────────────────────────────────────

function verdictFor(ideas: KeywordIdeaResult[] | undefined): Verdict {
  if (!ideas?.length) return 'NO_IDEAS';
  const top = ideas[0];
  if (!top) return 'NO_IDEAS';
  const bucket = top.volumeBucket;
  const comp = top.competition;
  if (!bucket) return 'INSUFFICIENT_DATA';
  const rank = bucketRank(bucket);
  if (rank <= bucketRank('100-1K')) return 'UNDER_INVESTED';
  if (rank >= bucketRank('10K-100K') && comp === 'HIGH') return 'OVER_AMBITIOUS';
  if (rank >= bucketRank('1K-10K') && (comp === 'LOW' || comp === 'MEDIUM')) {
    return 'WELL_TARGETED';
  }
  if (rank >= bucketRank('1K-10K')) return 'WELL_TARGETED';
  return 'UNDER_INVESTED';
}

function verdictBadge(v: Verdict): string {
  switch (v) {
    case 'WELL_TARGETED':
      return '🟢 **WELL_TARGETED**';
    case 'UNDER_INVESTED':
      return '🔵 UNDER_INVESTED';
    case 'OVER_AMBITIOUS':
      return '🟡 **OVER_AMBITIOUS**';
    case 'NO_IDEAS':
      return '❌ NO_IDEAS';
    case 'INSUFFICIENT_DATA':
      return '⏳ INSUFFICIENT_DATA';
  }
}

function renderLp(lp: LandingPage): string {
  const lines: string[] = [];
  lines.push(`### \`/lp/${lp.slug}\``);
  lines.push(`- **Title:** ${lp.title ?? '(missing)'}`);
  lines.push(`- **H1:** ${lp.h1 ?? '(missing)'}`);
  if (lp.ideas?.length) {
    const top = lp.ideas[0];
    if (top) {
      lines.push(
        `- **Top keyword idea:** \`${top.keyword}\` — bucket ${top.volumeBucket ?? '?'}, competition ${top.competition ?? '?'}`,
      );
    }
  }
  lines.push(`- **Verdict:** ${verdictBadge(lp.verdict ?? 'NO_IDEAS')}`);
  if (lp.ideas && lp.ideas.length > 1) {
    lines.push('');
    lines.push('Other ideas:');
    lines.push('');
    lines.push('| Keyword | Volume | Competition |');
    lines.push('| --- | --- | --- |');
    for (const idea of lp.ideas.slice(1, TOP_N_IDEAS)) {
      lines.push(
        `| \`${idea.keyword}\` | ${idea.volumeBucket ?? '?'} | ${idea.competition ?? '?'} |`,
      );
    }
  } else if (lp.ideasError) {
    lines.push(`- _Ideas failed:_ ${lp.ideasError}`);
  }
  lines.push('');
  return lines.join('\n');
}

// ── Entry ───────────────────────────────────────────────────────────────

export async function runValidateLps(
  options: ValidateLpsCommandOptions = {},
): Promise<void> {
  const repoRoot = options.repoRoot ?? process.cwd();
  const { config } = await loadConfig({
    repoRoot,
    configPath: options.configPath,
    envFallback: true,
  });

  if (!config.landingPages?.dir) {
    process.stderr.write(
      '[validate-lps] periscope.config.landingPages.dir is required for this command.\n',
    );
    process.exit(2);
  }

  const auth = await getAdsAuth(repoRoot);
  if (!auth) {
    process.stderr.write(
      '[validate-lps] Google Ads env vars not configured. See docs/documentation/guides/seo-snapshot-setup.md.\n',
    );
    process.exit(1);
  }

  const lpDir = path.resolve(repoRoot, config.landingPages.dir);
  const lps = listLps(lpDir, config.landingPages.pageFile);
  if (lps.length === 0) {
    process.stderr.write(`[validate-lps] No LPs found under ${lpDir}\n`);
    process.exit(1);
  }
  process.stderr.write(`[validate-lps] Validating ${lps.length} LPs\n`);

  for (const lp of lps) {
    const source = readFileSync(lp.file, 'utf-8');
    const { title, h1 } = extractTitleAndH1(source, config.landingPages.brandSuffix);
    lp.title = title;
    lp.h1 = h1;
    const seeds = [title, h1].filter((s): s is string => Boolean(s));
    if (seeds.length === 0) {
      lp.ideas = [];
      lp.ideasError = 'no extractable title or h1';
      lp.verdict = 'NO_IDEAS';
      continue;
    }
    try {
      lp.ideas = await generateKeywordIdeas({
        keywords: seeds,
        pageSize: 25,
        language: config.ads.languageCode,
        geo: config.ads.geoTargets[0],
        repoRoot,
      });
    } catch (err) {
      lp.ideas = [];
      lp.ideasError = err instanceof Error ? err.message : String(err);
    }
    lp.verdict = verdictFor(lp.ideas);
    process.stderr.write('.');
  }
  process.stderr.write('\n');

  const lines: string[] = [];
  lines.push(`# LP target validation — ${ymd()}`);
  lines.push('');
  lines.push(
    `Validated ${lps.length} landing pages in \`${config.landingPages.dir}\` against Google Ads' KeywordPlanIdeaService. Each LP's metadata title and first <h1> seed the lookup; ${TOP_N_IDEAS} ideas per LP are kept in the report.`,
  );
  lines.push('');
  lines.push('## Verdict legend');
  lines.push('');
  lines.push(
    '- **WELL_TARGETED**: top idea is 1K-10K+ volume with LOW or MEDIUM competition. Realistic SEO play.',
  );
  lines.push(
    '- **UNDER_INVESTED**: top idea is <1K volume. Page is targeting genuinely-niche traffic; SEO ceiling is single-digit clicks.',
  );
  lines.push(
    '- **OVER_AMBITIOUS**: top idea is 10K-100K+ volume with HIGH competition. Page is fighting category leaders; consider repositioning.',
  );
  lines.push('');
  lines.push('## Findings');
  lines.push('');

  const order: Record<Verdict, number> = {
    OVER_AMBITIOUS: 0,
    UNDER_INVESTED: 1,
    WELL_TARGETED: 2,
    NO_IDEAS: 3,
    INSUFFICIENT_DATA: 4,
  };
  lps.sort((a, b) => order[a.verdict ?? 'NO_IDEAS'] - order[b.verdict ?? 'NO_IDEAS']);
  for (const lp of lps) {
    lines.push(renderLp(lp));
  }

  const outputDir = path.resolve(repoRoot, config.outputDir);
  await fs.mkdir(outputDir, { recursive: true });
  const outFile = path.join(outputDir, `keyword-lp-validation-${ymd()}.md`);
  await fs.writeFile(outFile, lines.join('\n'));
  process.stdout.write(`Wrote ${outFile}  (${lps.length} LPs validated)\n`);
}
