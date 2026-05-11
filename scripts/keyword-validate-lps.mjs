#!/usr/bin/env node
/**
 * LP target validator — SPEC-020 #3.
 *
 * For each app/lp/<slug>/page.tsx, extract the metadata title and the
 * first <h1>, seed Google Ads' KeywordPlanIdeaService with both, and
 * issue a verdict on whether the LP is targeting realistic keyword
 * volume.
 *
 * Verdict logic (per SPEC-020):
 *   - UNDER_INVESTED  : top idea volume bucket is <100 or 100-1K
 *   - WELL_TARGETED   : top idea volume bucket is 1K-10K or 10K-100K,
 *                       competition is LOW or MEDIUM
 *   - OVER_AMBITIOUS  : top idea volume bucket is 10K-100K or 100K+,
 *                       competition is HIGH
 *
 * Output: docs/strategy/data/keyword-lp-validation-<YYYY-MM-DD>.md
 *
 * Usage:
 *   node scripts/keyword-validate-lps.mjs
 */

import { promises as fs } from 'fs';
import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getAdsAuth,
  generateKeywordIdeas,
  bucketRank,
} from './lib/google-ads.mjs';

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(__filename), '..');
const LP_DIR = path.join(REPO_ROOT, 'app', 'lp');
const OUT_DIR = path.join(REPO_ROOT, 'docs', 'strategy', 'data');
const TOP_N_IDEAS = 5;

function ymd(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

// ── LP extraction ───────────────────────────────────────────────────

function listLps() {
  if (!existsSync(LP_DIR)) return [];
  const out = [];
  for (const name of readdirSync(LP_DIR)) {
    const dirPath = path.join(LP_DIR, name);
    if (!statSync(dirPath).isDirectory()) continue;
    const pagePath = path.join(dirPath, 'page.tsx');
    if (existsSync(pagePath)) {
      out.push({ slug: name, file: pagePath });
    }
  }
  return out;
}

function extractTitleAndH1(source) {
  // Pull the metadata title: title: 'Foo'  or  title: "Foo"
  let title = null;
  const titleMatch = source.match(
    /title:\s*['"]([^'"]+)['"]/,
  );
  if (titleMatch) {
    title = titleMatch[1];
  }
  // Strip the brand suffix from titles like
  // "Foo | Anthony Coffey - Solutions Architect, AI/ML"
  if (title) {
    title = title.split(' | ')[0].trim();
  }
  // Pull the first h1's text content. JSX can span multiple lines and
  // include className etc., so a multi-line greedy match within the
  // tag boundary is the cheapest accurate option.
  let h1 = null;
  const h1Match = source.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  if (h1Match) {
    h1 = h1Match[1]
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/[{][^}]+[}]/g, '')
      .trim();
  }
  return { title, h1 };
}

// ── Verdict ─────────────────────────────────────────────────────────

function verdict(ideas) {
  if (!ideas?.length) return 'NO_IDEAS';
  const top = ideas[0];
  const bucket = top.volumeBucket;
  const comp = top.competition;
  if (!bucket) return 'INSUFFICIENT_DATA';
  const rank = bucketRank(bucket);
  if (rank <= bucketRank('100-1K')) return 'UNDER_INVESTED';
  if (rank >= bucketRank('10K-100K') && comp === 'HIGH') return 'OVER_AMBITIOUS';
  if (rank >= bucketRank('1K-10K') && (comp === 'LOW' || comp === 'MEDIUM')) {
    return 'WELL_TARGETED';
  }
  // High volume but moderate competition -> still well-targeted.
  if (rank >= bucketRank('1K-10K')) return 'WELL_TARGETED';
  return 'UNDER_INVESTED';
}

function verdictBadge(v) {
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
    default:
      return v;
  }
}

// ── Markdown ────────────────────────────────────────────────────────

function renderLp(lp) {
  const lines = [];
  lines.push(`### \`/lp/${lp.slug}\``);
  lines.push(`- **Title:** ${lp.title ?? '(missing)'}`);
  lines.push(`- **H1:** ${lp.h1 ?? '(missing)'}`);
  if (lp.ideas?.length) {
    const top = lp.ideas[0];
    lines.push(
      `- **Top keyword idea:** \`${top.keyword}\` — bucket ${top.volumeBucket ?? '?'}, competition ${top.competition ?? '?'}`,
    );
  }
  lines.push(`- **Verdict:** ${verdictBadge(lp.verdict)}`);
  if (lp.ideas?.length > 1) {
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

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  const auth = await getAdsAuth();
  if (!auth) {
    console.error(
      '[validate-lps] Google Ads env vars not configured. See docs/documentation/guides/seo-snapshot-setup.md.',
    );
    process.exit(1);
  }

  const lps = listLps();
  if (lps.length === 0) {
    console.error(`[validate-lps] No LPs found under ${LP_DIR}`);
    process.exit(1);
  }
  console.error(`[validate-lps] Validating ${lps.length} LPs…`);

  for (const lp of lps) {
    const source = readFileSync(lp.file, 'utf-8');
    const { title, h1 } = extractTitleAndH1(source);
    lp.title = title;
    lp.h1 = h1;
    const seeds = [title, h1].filter(Boolean);
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
      });
    } catch (err) {
      lp.ideas = [];
      lp.ideasError = err?.message ?? String(err);
    }
    lp.verdict = verdict(lp.ideas);
    process.stderr.write('.');
  }
  process.stderr.write('\n');

  const lines = [];
  lines.push(`# LP target validation — ${ymd()}`);
  lines.push('');
  lines.push(
    `Validated ${lps.length} landing pages in \`app/lp/\` against Google Ads' KeywordPlanIdeaService. Each LP's metadata title and first <h1> seed the lookup; ${TOP_N_IDEAS} ideas per LP are kept in the report.`,
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

  const order = {
    OVER_AMBITIOUS: 0,
    UNDER_INVESTED: 1,
    WELL_TARGETED: 2,
    NO_IDEAS: 3,
    INSUFFICIENT_DATA: 4,
  };
  lps.sort((a, b) => (order[a.verdict] ?? 99) - (order[b.verdict] ?? 99));
  for (const lp of lps) {
    lines.push(renderLp(lp));
  }

  await fs.mkdir(OUT_DIR, { recursive: true });
  const outFile = path.join(OUT_DIR, `keyword-lp-validation-${ymd()}.md`);
  await fs.writeFile(outFile, lines.join('\n'));
  console.log(`Wrote ${outFile}  (${lps.length} LPs validated)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
