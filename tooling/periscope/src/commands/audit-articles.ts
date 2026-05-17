/**
 * `periscope audit articles` command.
 *
 * Walks the configured articles directory (MDX files), parses
 * frontmatter, looks up each article's slug in the latest snapshot for
 * GSC context, asks Google Ads for related keyword ideas, and flags
 * OPPORTUNITY vs WELL_TARGETED vs NO_DATA_YET vs NO_IDEAS.
 *
 * Output: <outputDir>/keyword-audit-articles-<YYYY-MM-DD>.md
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { promises as fs } from 'node:fs';
import path from 'node:path';

import {
  generateKeywordIdeas,
  type KeywordIdeaResult,
} from '../engines/ads.js';
import { getAdsAuth } from '../lib/auth.js';
import { bucketRank } from '../lib/bucket.js';
import { loadConfig } from '../lib/config.js';
import {
  normalizeArticleFrontmatter,
  parseFrontmatter,
  type FrontmatterFieldNames,
} from '../lib/frontmatter.js';
import { isSnapshotStale, loadLatestSnapshot } from '../lib/snapshot-store.js';
import type { GscRow, SnapshotEnvelope } from '../types/snapshot.js';

const TOP_N_IDEAS = 10;
type Verdict = 'OPPORTUNITY' | 'WELL_TARGETED' | 'NO_DATA_YET' | 'NO_IDEAS';

export interface AuditArticlesCommandOptions {
  configPath?: string;
  repoRoot?: string;
}

interface Article {
  slug: string;
  file: string;
  title: string;
  summary: string;
  tags: string[];
  category: string;
  snapshot?: ArticleSnapshotStats | null;
  ideas?: KeywordIdeaResult[];
  ideasError?: string;
  verdict?: Verdict;
}

interface ArticleSnapshotStats {
  page: string;
  clicks: number;
  impressions: number;
  position: number | null | undefined;
}

function ymd(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

function readArticles(
  postsDir: string,
  frontmatterFields: FrontmatterFieldNames | undefined,
): Article[] {
  if (!existsSync(postsDir)) {
    throw new Error(`Posts directory not found: ${postsDir}`);
  }
  return readdirSync(postsDir)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => {
      const filePath = path.join(postsDir, f);
      const raw = readFileSync(filePath, 'utf-8');
      const fm = parseFrontmatter(raw);
      const norm = normalizeArticleFrontmatter(fm, frontmatterFields);
      return {
        slug: f.replace(/\.mdx$/, ''),
        file: f,
        title: norm.title,
        summary: norm.summary,
        tags: norm.tags,
        category: norm.category,
      };
    });
}

function findArticleInSnapshot(
  slug: string,
  snapshot: SnapshotEnvelope | null,
  siteHost: string | null,
): ArticleSnapshotStats | null {
  if (!snapshot) return null;
  const candidates = [
    `/articles/${slug}`,
    siteHost ? `https://${siteHost}/articles/${slug}` : null,
    siteHost ? `https://${siteHost}/articles/${slug}/` : null,
  ].filter(Boolean) as string[];
  const pages: GscRow[] = snapshot.gsc?.topPages ?? [];
  const pageMatch = pages.find((r) => candidates.some((c) => r.keys?.[0] === c));
  if (!pageMatch) return null;
  return {
    page: pageMatch.keys?.[0] ?? '',
    clicks: pageMatch.clicks ?? 0,
    impressions: pageMatch.impressions ?? 0,
    position: pageMatch.position,
  };
}

function verdictFor(article: Article): Verdict {
  if (!article.ideas?.length) return 'NO_IDEAS';
  if (!article.snapshot?.impressions) return 'NO_DATA_YET';
  const topIdea = article.ideas[0];
  const hasUpside = article.ideas.some((idea) => {
    const isBigEnough = bucketRank(idea.volumeBucket) >= bucketRank('1K-10K');
    const isAffordable = idea.competition === 'LOW' || idea.competition === 'MEDIUM';
    return isBigEnough && isAffordable && idea.keyword !== topIdea?.keyword;
  });
  if (hasUpside) return 'OPPORTUNITY';
  return 'WELL_TARGETED';
}

function verdictBadge(v: Verdict): string {
  switch (v) {
    case 'OPPORTUNITY':
      return '🟢 **OPPORTUNITY**';
    case 'WELL_TARGETED':
      return '✅ WELL_TARGETED';
    case 'NO_DATA_YET':
      return '⏳ NO_DATA_YET';
    case 'NO_IDEAS':
      return '❌ NO_IDEAS';
  }
}

function renderArticleBlock(article: Article): string {
  const lines: string[] = [];
  lines.push(`### \`${article.file}\``);
  lines.push(`- **Title:** ${article.title}`);
  if (article.category) lines.push(`- **Category:** ${article.category}`);
  if (article.snapshot) {
    const pos = article.snapshot.position;
    const posStr = typeof pos === 'number' ? pos.toFixed(1) : '?';
    lines.push(
      `- **Snapshot rank:** position ${posStr}, ${article.snapshot.impressions.toLocaleString()} impressions, ${article.snapshot.clicks} clicks`,
    );
  } else {
    lines.push('- **Snapshot rank:** (no GSC data for this slug)');
  }
  lines.push(`- **Verdict:** ${verdictBadge(article.verdict ?? 'NO_IDEAS')}`);
  if (article.ideas?.length) {
    lines.push('');
    lines.push('| Suggested keyword | Volume | Competition | Index |');
    lines.push('| --- | --- | --- | --- |');
    for (const idea of article.ideas.slice(0, TOP_N_IDEAS)) {
      lines.push(
        `| \`${idea.keyword}\` | ${idea.volumeBucket ?? 'INSUFFICIENT_DATA'} | ${idea.competition ?? '?'} | ${idea.competitionIndex ?? '?'} |`,
      );
    }
  } else if (article.ideasError) {
    lines.push(`- _Ideas failed:_ ${article.ideasError}`);
  }
  lines.push('');
  return lines.join('\n');
}

function siteHostFromConfig(siteUrl: string): string | null {
  if (siteUrl.startsWith('sc-domain:')) return siteUrl.slice('sc-domain:'.length);
  try {
    return new URL(siteUrl).host;
  } catch {
    return null;
  }
}

export async function runAuditArticles(
  options: AuditArticlesCommandOptions = {},
): Promise<void> {
  const repoRoot = options.repoRoot ?? process.cwd();
  const { config } = await loadConfig({
    repoRoot,
    configPath: options.configPath,
    envFallback: true,
  });

  if (!config.articles?.dir) {
    process.stderr.write(
      '[audit-articles] periscope.config.articles.dir is required for this command.\n',
    );
    process.exit(2);
  }

  const auth = await getAdsAuth(repoRoot);
  if (!auth) {
    process.stderr.write(
      '[audit-articles] Google Ads env vars not configured. Set GOOGLE_ADS_DEVELOPER_TOKEN, GOOGLE_ADS_CUSTOMER_ID, GOOGLE_ADS_LOGIN_CUSTOMER_ID and re-run.\n',
    );
    process.exit(1);
  }

  const outputDir = path.resolve(repoRoot, config.outputDir);
  const snapshot = await loadLatestSnapshot(outputDir);
  if (!snapshot) {
    process.stderr.write(
      `[audit-articles] No snapshot found in ${outputDir}. Articles will be audited without GSC context. Run \`periscope snapshot\` first for the full report.\n`,
    );
  } else if (isSnapshotStale(snapshot)) {
    process.stderr.write(
      `[audit-articles] Snapshot ${snapshot._sourceFile} is stale (>30 days). Consider re-running \`periscope snapshot\`.\n`,
    );
  }

  const postsDir = path.resolve(repoRoot, config.articles.dir);
  const articles = readArticles(postsDir, config.articles.frontmatterFields);
  process.stderr.write(
    `[audit-articles] Auditing ${articles.length} articles against Google Ads\n`,
  );

  const siteHost = siteHostFromConfig(config.siteUrl);

  for (const article of articles) {
    article.snapshot = findArticleInSnapshot(article.slug, snapshot, siteHost);
    const seedTerms = [article.title, ...article.tags].filter(Boolean);
    try {
      article.ideas = await generateKeywordIdeas({
        keywords: seedTerms.slice(0, 8),
        pageSize: 25,
        language: config.ads.languageCode,
        geo: config.ads.geoTargets[0],
        repoRoot,
      });
    } catch (err) {
      article.ideas = [];
      article.ideasError = err instanceof Error ? err.message : String(err);
    }
    article.verdict = verdictFor(article);
    process.stderr.write('.');
  }
  process.stderr.write('\n');

  const opportunityCount = articles.filter((a) => a.verdict === 'OPPORTUNITY').length;

  const lines: string[] = [];
  lines.push(`# Article keyword audit — ${ymd()}`);
  lines.push('');
  lines.push(
    `Audited ${articles.length} articles in \`${config.articles.dir}\` against Google Ads' KeywordPlanIdeaService. Each article's title + tags are the seed input; ${TOP_N_IDEAS} ideas per article are kept in the report.`,
  );
  lines.push('');
  lines.push(`**${opportunityCount} OPPORTUNITY flags.**`);
  if (snapshot) {
    lines.push(`Snapshot baseline: \`${snapshot._sourceFile ?? '(unknown)'}\``);
  } else {
    lines.push(
      'Snapshot baseline: _no snapshot found; verdicts default to NO_DATA_YET._',
    );
  }
  lines.push('');
  lines.push('## Findings');
  lines.push('');

  const order: Record<Verdict, number> = {
    OPPORTUNITY: 0,
    WELL_TARGETED: 1,
    NO_DATA_YET: 2,
    NO_IDEAS: 3,
  };
  articles.sort((a, b) => order[a.verdict ?? 'NO_IDEAS'] - order[b.verdict ?? 'NO_IDEAS']);
  for (const article of articles) {
    lines.push(renderArticleBlock(article));
  }

  await fs.mkdir(outputDir, { recursive: true });
  const outFile = path.join(outputDir, `keyword-audit-articles-${ymd()}.md`);
  await fs.writeFile(outFile, lines.join('\n'));
  process.stdout.write(
    `Wrote ${outFile}  (${opportunityCount} opportunities flagged)\n`,
  );
}
