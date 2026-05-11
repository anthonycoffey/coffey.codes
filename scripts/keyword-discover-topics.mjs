#!/usr/bin/env node
/**
 * Topic discovery — SPEC-020 #2.
 *
 * Seeds Google Ads' KeywordPlanIdeaService with the site's article
 * categories + top GSC queries. Filters out ideas already covered by
 * existing article slugs. Groups by competition bucket, sorts by
 * volume bucket descending. Output: a ranked editorial backlog.
 *
 * Output: docs/strategy/data/keyword-topics-<YYYY-MM-DD>.md
 *
 * Usage:
 *   node scripts/keyword-discover-topics.mjs
 */

import { promises as fs } from 'fs';
import { existsSync, readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getAdsAuth,
  generateKeywordIdeas,
  loadLatestSnapshot,
  isSnapshotStale,
  bucketRank,
  BUCKET_ORDER,
} from './lib/google-ads.mjs';

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(__filename), '..');
const POSTS_DIR = path.join(REPO_ROOT, 'app', '(site)', 'articles', 'posts');
const OUT_DIR = path.join(REPO_ROOT, 'docs', 'strategy', 'data');

// Match the categories present in MDX frontmatter, per SPEC-015 audit.
// 'Development' is a typo of 'Mobile Development' on one post; we fold it.
const CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'Cloud & DevOps',
  'Software Engineering',
  'Tools & Productivity',
];

const TOTAL_IDEAS_TO_FETCH = 200;

function ymd(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

// ── "Already covered" heuristic ─────────────────────────────────────

function loadExistingSlugTokens() {
  if (!existsSync(POSTS_DIR)) return [];
  const slugs = readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''));
  return slugs.map((s) => new Set(s.split('-').filter((t) => t.length > 2)));
}

function tokensFromKeyword(kw) {
  return new Set(
    String(kw)
      .toLowerCase()
      .split(/[\s\-_/]+/)
      .filter((t) => t.length > 2),
  );
}

function isAlreadyCovered(ideaTokens, slugTokenSets) {
  for (const slugTokens of slugTokenSets) {
    const intersection = new Set(
      [...ideaTokens].filter((t) => slugTokens.has(t)),
    );
    if (
      intersection.size >= 1 &&
      intersection.size / ideaTokens.size >= 0.6
    ) {
      return true;
    }
  }
  return false;
}

// ── Grouping + sorting ──────────────────────────────────────────────

function groupAndSort(ideas) {
  const groups = {
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
  for (const key of Object.keys(groups)) {
    groups[key].sort((a, b) => {
      const r = bucketRank(b.volumeBucket) - bucketRank(a.volumeBucket);
      if (r !== 0) return r;
      return (a.competitionIndex ?? 99) - (b.competitionIndex ?? 99);
    });
  }
  return groups;
}

function renderTable(ideas, max = 30) {
  if (!ideas.length) return '_(no ideas in this bucket)_\n';
  const lines = [];
  lines.push('| Keyword | Volume | Competition | Index |');
  lines.push('| --- | --- | --- | --- |');
  for (const idea of ideas.slice(0, max)) {
    lines.push(
      `| \`${idea.keyword}\` | ${idea.volumeBucket ?? 'INSUFFICIENT_DATA'} | ${idea.competition ?? '?'} | ${idea.competitionIndex ?? '?'} |`,
    );
  }
  return lines.join('\n') + '\n';
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  const auth = await getAdsAuth();
  if (!auth) {
    console.error(
      '[discover-topics] Google Ads env vars not configured. See docs/documentation/guides/seo-snapshot-setup.md.',
    );
    process.exit(1);
  }

  const snapshot = await loadLatestSnapshot();
  let gscSeeds = [];
  if (snapshot && !isSnapshotStale(snapshot)) {
    gscSeeds = (snapshot.gsc?.topQueries ?? [])
      .map((r) => r.keys?.[0])
      .filter((q) => typeof q === 'string' && q.trim().length > 0)
      .slice(0, 25);
  } else if (!snapshot) {
    console.warn(
      '[discover-topics] No snapshot; seeding with categories only.',
    );
  } else {
    console.warn(
      `[discover-topics] Snapshot ${snapshot._sourceFile} is stale (>30 days); using its data anyway.`,
    );
    gscSeeds = (snapshot.gsc?.topQueries ?? [])
      .map((r) => r.keys?.[0])
      .filter(Boolean)
      .slice(0, 25);
  }

  const seeds = [...new Set([...gscSeeds, ...CATEGORIES])];
  console.error(
    `[discover-topics] Seeding KeywordPlanIdeaService with ${seeds.length} terms…`,
  );

  // Ads accepts up to 20 seeds per call comfortably; we cap.
  const ideas = await generateKeywordIdeas({
    keywords: seeds.slice(0, 20),
    pageSize: TOTAL_IDEAS_TO_FETCH,
  });

  // Filter out ideas already covered by existing slugs.
  const slugTokens = loadExistingSlugTokens();
  const fresh = ideas.filter((idea) => {
    const tokens = tokensFromKeyword(idea.keyword);
    if (tokens.size === 0) return false;
    return !isAlreadyCovered(tokens, slugTokens);
  });
  const droppedCount = ideas.length - fresh.length;

  const groups = groupAndSort(fresh);

  const lines = [];
  lines.push(`# Topic discovery — ${ymd()}`);
  lines.push('');
  lines.push(
    `Seeded Google Ads Keyword Planner with ${seeds.length} terms (${gscSeeds.length} top GSC queries + ${CATEGORIES.length} article categories). Returned ${ideas.length} ideas; dropped ${droppedCount} as "already covered" by existing article slugs (60% token overlap threshold).`,
  );
  lines.push('');
  if (snapshot) {
    lines.push(`Snapshot baseline: \`${snapshot._sourceFile}\``);
    lines.push('');
  }
  lines.push('Bucket order (high to low): ' + BUCKET_ORDER.join(' > '));
  lines.push('');

  lines.push('## High volume + low competition (write these first)');
  lines.push('');
  lines.push(renderTable(groups.HIGH_VOLUME_LOW_COMPETITION));

  lines.push(
    '## High volume + medium competition (defensible, will take time)',
  );
  lines.push('');
  lines.push(renderTable(groups.HIGH_VOLUME_MEDIUM_COMPETITION));

  lines.push('## Medium volume + low competition (quick wins for niche traffic)');
  lines.push('');
  lines.push(renderTable(groups.MEDIUM_VOLUME_LOW_COMPETITION));

  lines.push('## Remainder (high-competition or insufficient data)');
  lines.push('');
  lines.push(renderTable(groups.REMAINDER, 50));

  await fs.mkdir(OUT_DIR, { recursive: true });
  const outFile = path.join(OUT_DIR, `keyword-topics-${ymd()}.md`);
  await fs.writeFile(outFile, lines.join('\n'));
  console.log(
    `Wrote ${outFile}  (${fresh.length} fresh ideas across ${Object.keys(groups).length} buckets)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
