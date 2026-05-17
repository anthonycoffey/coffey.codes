/**
 * `periscope discover topics` command.
 *
 * Seeds Google Ads' KeywordPlanIdeaService with the configured
 * categories + top GSC queries from the latest snapshot. Filters out
 * ideas already covered by existing article slugs. Groups by competition
 * bucket, sorts by volume bucket desc. Output: a ranked editorial backlog.
 *
 * Output: <outputDir>/keyword-topics-<YYYY-MM-DD>.md
 */

import { existsSync, readdirSync } from 'node:fs';
import { promises as fs } from 'node:fs';
import path from 'node:path';

import {
  generateKeywordIdeas,
  type KeywordIdeaResult,
} from '../engines/ads.js';
import { getAdsAuth } from '../lib/auth.js';
import { BUCKET_ORDER, bucketRank } from '../lib/bucket.js';
import { loadConfig } from '../lib/config.js';
import { isSnapshotStale, loadLatestSnapshot } from '../lib/snapshot-store.js';

const TOTAL_IDEAS_TO_FETCH = 200;

export interface DiscoverTopicsCommandOptions {
  configPath?: string;
  repoRoot?: string;
}

function ymd(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

// ── "Already covered" heuristic ─────────────────────────────────────────

function loadExistingSlugTokens(postsDir: string): Set<string>[] {
  if (!existsSync(postsDir)) return [];
  const slugs = readdirSync(postsDir)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''));
  return slugs.map((s) => new Set(s.split('-').filter((t) => t.length > 2)));
}

function tokensFromKeyword(kw: string): Set<string> {
  return new Set(
    String(kw)
      .toLowerCase()
      .split(/[\s\-_/]+/)
      .filter((t) => t.length > 2),
  );
}

function isAlreadyCovered(
  ideaTokens: Set<string>,
  slugTokenSets: Set<string>[],
): boolean {
  for (const slugTokens of slugTokenSets) {
    const intersection = new Set(
      [...ideaTokens].filter((t) => slugTokens.has(t)),
    );
    if (intersection.size >= 1 && intersection.size / ideaTokens.size >= 0.6) {
      return true;
    }
  }
  return false;
}

// ── Grouping + sorting ──────────────────────────────────────────────────

type GroupKey =
  | 'HIGH_VOLUME_LOW_COMPETITION'
  | 'HIGH_VOLUME_MEDIUM_COMPETITION'
  | 'MEDIUM_VOLUME_LOW_COMPETITION'
  | 'REMAINDER';

function groupAndSort(ideas: KeywordIdeaResult[]): Record<GroupKey, KeywordIdeaResult[]> {
  const groups: Record<GroupKey, KeywordIdeaResult[]> = {
    HIGH_VOLUME_LOW_COMPETITION: [],
    HIGH_VOLUME_MEDIUM_COMPETITION: [],
    MEDIUM_VOLUME_LOW_COMPETITION: [],
    REMAINDER: [],
  };
  for (const idea of ideas) {
    const bucket = idea.volumeBucket;
    const comp = idea.competition;
    if (!bucket) {
      groups.REMAINDER.push(idea);
      continue;
    }
    const big = bucketRank(bucket) >= bucketRank('1K-10K');
    const mid = bucketRank(bucket) === bucketRank('100-1K');
    if (big && comp === 'LOW') {
      groups.HIGH_VOLUME_LOW_COMPETITION.push(idea);
    } else if (big && comp === 'MEDIUM') {
      groups.HIGH_VOLUME_MEDIUM_COMPETITION.push(idea);
    } else if (mid && comp === 'LOW') {
      groups.MEDIUM_VOLUME_LOW_COMPETITION.push(idea);
    } else {
      groups.REMAINDER.push(idea);
    }
  }
  for (const key of Object.keys(groups) as GroupKey[]) {
    groups[key].sort((a, b) => {
      const r = bucketRank(b.volumeBucket) - bucketRank(a.volumeBucket);
      if (r !== 0) return r;
      return (a.competitionIndex ?? 99) - (b.competitionIndex ?? 99);
    });
  }
  return groups;
}

function renderTable(ideas: KeywordIdeaResult[], max = 30): string {
  if (!ideas.length) return '_(no ideas in this bucket)_\n';
  const lines: string[] = [];
  lines.push('| Keyword | Volume | Competition | Index |');
  lines.push('| --- | --- | --- | --- |');
  for (const idea of ideas.slice(0, max)) {
    lines.push(
      `| \`${idea.keyword}\` | ${idea.volumeBucket ?? 'INSUFFICIENT_DATA'} | ${idea.competition ?? '?'} | ${idea.competitionIndex ?? '?'} |`,
    );
  }
  return lines.join('\n') + '\n';
}

// ── Entry ───────────────────────────────────────────────────────────────

export async function runDiscoverTopics(
  options: DiscoverTopicsCommandOptions = {},
): Promise<void> {
  const repoRoot = options.repoRoot ?? process.cwd();
  const { config } = await loadConfig({
    repoRoot,
    configPath: options.configPath,
    envFallback: true,
  });

  const auth = await getAdsAuth(repoRoot);
  if (!auth) {
    process.stderr.write(
      '[discover-topics] Google Ads env vars not configured. See docs/documentation/guides/seo-snapshot-setup.md.\n',
    );
    process.exit(1);
  }

  const outputDir = path.resolve(repoRoot, config.outputDir);
  const snapshot = await loadLatestSnapshot(outputDir);
  let gscSeeds: string[] = [];
  if (snapshot && !isSnapshotStale(snapshot)) {
    gscSeeds = (snapshot.gsc?.topQueries ?? [])
      .map((r) => r.keys?.[0])
      .filter((q): q is string => typeof q === 'string' && q.trim().length > 0)
      .slice(0, 25);
  } else if (!snapshot) {
    process.stderr.write(
      '[discover-topics] No snapshot; seeding with categories only.\n',
    );
  } else {
    process.stderr.write(
      `[discover-topics] Snapshot ${snapshot._sourceFile ?? '(unknown)'} is stale (>30 days); using its data anyway.\n`,
    );
    gscSeeds = (snapshot.gsc?.topQueries ?? [])
      .map((r) => r.keys?.[0])
      .filter((q): q is string => typeof q === 'string')
      .slice(0, 25);
  }

  const categories = config.categories ?? [];
  if (categories.length === 0 && gscSeeds.length === 0) {
    process.stderr.write(
      '[discover-topics] No seeds available: empty `categories` in config and no snapshot. Add categories to periscope.config.ts and re-run.\n',
    );
    process.exit(1);
  }

  const seeds = [...new Set([...gscSeeds, ...categories])];
  process.stderr.write(
    `[discover-topics] Seeding KeywordPlanIdeaService with ${seeds.length} terms\n`,
  );

  const ideas = await generateKeywordIdeas({
    keywords: seeds.slice(0, 20),
    pageSize: TOTAL_IDEAS_TO_FETCH,
    language: config.ads.languageCode,
    geo: config.ads.geoTargets[0],
    repoRoot,
  });

  // Filter out ideas already covered by existing slugs.
  const slugTokens = config.articles?.dir
    ? loadExistingSlugTokens(path.resolve(repoRoot, config.articles.dir))
    : [];
  const fresh = ideas.filter((idea) => {
    const tokens = tokensFromKeyword(idea.keyword);
    if (tokens.size === 0) return false;
    return !isAlreadyCovered(tokens, slugTokens);
  });
  const droppedCount = ideas.length - fresh.length;

  const groups = groupAndSort(fresh);

  const lines: string[] = [];
  lines.push(`# Topic discovery — ${ymd()}`);
  lines.push('');
  lines.push(
    `Seeded Google Ads Keyword Planner with ${seeds.length} terms (${gscSeeds.length} top GSC queries + ${categories.length} article categories). Returned ${ideas.length} ideas; dropped ${droppedCount} as "already covered" by existing article slugs (60% token overlap threshold).`,
  );
  lines.push('');
  if (snapshot) {
    lines.push(`Snapshot baseline: \`${snapshot._sourceFile ?? '(unknown)'}\``);
    lines.push('');
  }
  lines.push('Bucket order (high to low): ' + BUCKET_ORDER.join(' > '));
  lines.push('');

  lines.push('## High volume + low competition (write these first)');
  lines.push('');
  lines.push(renderTable(groups.HIGH_VOLUME_LOW_COMPETITION));

  lines.push('## High volume + medium competition (defensible, will take time)');
  lines.push('');
  lines.push(renderTable(groups.HIGH_VOLUME_MEDIUM_COMPETITION));

  lines.push('## Medium volume + low competition (quick wins for niche traffic)');
  lines.push('');
  lines.push(renderTable(groups.MEDIUM_VOLUME_LOW_COMPETITION));

  lines.push('## Remainder (high-competition or insufficient data)');
  lines.push('');
  lines.push(renderTable(groups.REMAINDER, 50));

  await fs.mkdir(outputDir, { recursive: true });
  const outFile = path.join(outputDir, `keyword-topics-${ymd()}.md`);
  await fs.writeFile(outFile, lines.join('\n'));
  process.stdout.write(
    `Wrote ${outFile}  (${fresh.length} fresh ideas across ${Object.keys(groups).length} buckets)\n`,
  );
}
