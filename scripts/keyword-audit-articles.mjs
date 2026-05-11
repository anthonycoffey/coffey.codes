#!/usr/bin/env node
/**
 * Article keyword auditor — SPEC-020 #1.
 *
 * For each article in app/(site)/articles/posts/, this script:
 *   1. Parses the frontmatter (title, summary, tags, category).
 *   2. Looks up the article's slug in the latest SEO snapshot to find
 *      its current top GSC query, position, and impressions.
 *   3. Asks Google Ads' KeywordPlanIdeaService for related keywords
 *      using title + tags + summary as the seed.
 *   4. Flags articles where Ads suggests a higher-volume keyword the
 *      article isn't currently targeting (OPPORTUNITY), or confirms
 *      the article is already aimed at the best available term
 *      (WELL_TARGETED).
 *
 * Output: docs/strategy/data/keyword-audit-articles-<YYYY-MM-DD>.md
 *
 * Usage:
 *   node scripts/keyword-audit-articles.mjs
 *
 * Requires the SPEC-019 GOOGLE_ADS_* env vars. Optional: a recent
 * snapshot in docs/strategy/data/. If the snapshot is missing or
 * >30 days old, articles will still be audited (with a warning); the
 * "current top query" baseline simply won't be populated.
 */

import { promises as fs } from 'fs';
import { existsSync, readdirSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getAdsAuth,
  generateKeywordIdeas,
  loadLatestSnapshot,
  isSnapshotStale,
  bucketRank,
} from './lib/google-ads.mjs';

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(__filename), '..');
const POSTS_DIR = path.join(REPO_ROOT, 'app', '(site)', 'articles', 'posts');
const OUT_DIR = path.join(REPO_ROOT, 'docs', 'strategy', 'data');
const TOP_N_IDEAS = 10;

function ymd(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

// ── Frontmatter parser ──────────────────────────────────────────────

function parseFrontmatter(raw) {
  if (!raw.startsWith('---')) return null;
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return null;
  const fm = raw.slice(3, end).trim();
  const out = {};
  for (const line of fm.split(/\r?\n/)) {
    const m = line.match(/^([a-zA-Z]+):\s*(.*)$/);
    if (!m) continue;
    let [, key, value] = m;
    value = value.trim();
    if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    } else if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function readArticles() {
  if (!existsSync(POSTS_DIR)) {
    throw new Error(`Posts directory not found: ${POSTS_DIR}`);
  }
  return readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => {
      const filePath = path.join(POSTS_DIR, f);
      const raw = readFileSync(filePath, 'utf-8');
      const fm = parseFrontmatter(raw);
      return {
        slug: f.replace(/\.mdx$/, ''),
        file: f,
        title: fm?.title ?? '(no title)',
        summary: fm?.summary ?? '',
        tags: fm?.tags
          ? fm.tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        category: fm?.category ?? '',
      };
    });
}

// ── Snapshot lookup ─────────────────────────────────────────────────

function findArticleInSnapshot(slug, snapshot) {
  if (!snapshot) return null;
  const candidates = [
    `/articles/${slug}`,
    `https://coffey.codes/articles/${slug}`,
    `https://coffey.codes/articles/${slug}/`,
  ];
  const pageMatch = (snapshot.gsc?.topPages ?? []).find((r) =>
    candidates.some((c) => r.keys?.[0] === c),
  );
  if (!pageMatch) return null;
  // Also find the article's top query, if the snapshot has page+query data.
  // SPEC-019 snapshot has gsc.topQueries enriched; we can find the
  // article's queries by filtering pageQuery joined data if available.
  // The current snapshot shape doesn't expose page->query joins, so we
  // just return the page-level stats. Future SPEC could add a
  // page-query join report.
  return {
    page: pageMatch.keys?.[0],
    clicks: pageMatch.clicks ?? 0,
    impressions: pageMatch.impressions ?? 0,
    position: pageMatch.position,
  };
}

// ── Verdict logic ───────────────────────────────────────────────────

function verdict(article, ideas) {
  if (!ideas?.length) return 'NO_IDEAS';
  if (!article.snapshot?.impressions) return 'NO_DATA_YET';
  // OPPORTUNITY: at least one idea has volume bucket > "100-1K" and
  // competition LOW or MEDIUM and ISN'T the article's current top idea.
  const topIdea = ideas[0];
  const hasUpside = ideas.some((idea) => {
    const isBigEnough = bucketRank(idea.volumeBucket) >= bucketRank('1K-10K');
    const isAffordable =
      idea.competition === 'LOW' || idea.competition === 'MEDIUM';
    return isBigEnough && isAffordable && idea.keyword !== topIdea?.keyword;
  });
  if (hasUpside) return 'OPPORTUNITY';
  return 'WELL_TARGETED';
}

function verdictBadge(v) {
  switch (v) {
    case 'OPPORTUNITY':
      return '🟢 **OPPORTUNITY**';
    case 'WELL_TARGETED':
      return '✅ WELL_TARGETED';
    case 'NO_DATA_YET':
      return '⏳ NO_DATA_YET';
    case 'NO_IDEAS':
      return '❌ NO_IDEAS';
    default:
      return v;
  }
}

// ── Markdown rendering ──────────────────────────────────────────────

function renderArticleBlock(article) {
  const lines = [];
  lines.push(`### \`${article.file}\``);
  lines.push(`- **Title:** ${article.title}`);
  if (article.category) lines.push(`- **Category:** ${article.category}`);
  if (article.snapshot) {
    lines.push(
      `- **Snapshot rank:** position ${article.snapshot.position?.toFixed(1) ?? '?'}, ${article.snapshot.impressions.toLocaleString()} impressions, ${article.snapshot.clicks} clicks`,
    );
  } else {
    lines.push('- **Snapshot rank:** (no GSC data for this slug)');
  }
  lines.push(`- **Verdict:** ${verdictBadge(article.verdict)}`);
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

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  const auth = await getAdsAuth();
  if (!auth) {
    console.error(
      '[audit-articles] Google Ads env vars not configured. Set GOOGLE_ADS_DEVELOPER_TOKEN, GOOGLE_ADS_CUSTOMER_ID, GOOGLE_ADS_LOGIN_CUSTOMER_ID and re-run.',
    );
    process.exit(1);
  }

  const snapshot = await loadLatestSnapshot();
  if (!snapshot) {
    console.warn(
      '[audit-articles] No snapshot found in docs/strategy/data/. Articles will be audited without GSC context. Run `node scripts/seo-snapshot.mjs` first for the full report.',
    );
  } else if (isSnapshotStale(snapshot)) {
    console.warn(
      `[audit-articles] Snapshot ${snapshot._sourceFile} is stale (>30 days). Consider re-running seo-snapshot.mjs.`,
    );
  }

  const articles = readArticles();
  console.error(
    `[audit-articles] Auditing ${articles.length} articles against Google Ads…`,
  );

  for (const article of articles) {
    article.snapshot = findArticleInSnapshot(article.slug, snapshot);
    const seedTerms = [article.title, ...article.tags].filter(Boolean);
    try {
      // Keep seeds compact; Ads accepts up to 10 per call but rate-limits
      // multi-seed calls more aggressively.
      article.ideas = await generateKeywordIdeas({
        keywords: seedTerms.slice(0, 8),
        pageSize: 25,
      });
    } catch (err) {
      article.ideas = [];
      article.ideasError = err?.message ?? String(err);
    }
    article.verdict = verdict(article, article.ideas);
    process.stderr.write('.');
  }
  process.stderr.write('\n');

  const opportunityCount = articles.filter(
    (a) => a.verdict === 'OPPORTUNITY',
  ).length;

  const lines = [];
  lines.push(`# Article keyword audit — ${ymd()}`);
  lines.push('');
  lines.push(
    `Audited ${articles.length} articles in \`app/(site)/articles/posts/\` against Google Ads' KeywordPlanIdeaService. Each article's title + tags are the seed input; ${TOP_N_IDEAS} ideas per article are kept in the report.`,
  );
  lines.push('');
  lines.push(`**${opportunityCount} OPPORTUNITY flags.**`);
  if (snapshot) {
    lines.push(`Snapshot baseline: \`${snapshot._sourceFile}\``);
  } else {
    lines.push(
      'Snapshot baseline: _no snapshot found; verdicts default to NO_DATA_YET._',
    );
  }
  lines.push('');
  lines.push('## Findings');
  lines.push('');
  // Sort: OPPORTUNITY first, then WELL_TARGETED, then no-data
  const order = { OPPORTUNITY: 0, WELL_TARGETED: 1, NO_DATA_YET: 2, NO_IDEAS: 3 };
  articles.sort(
    (a, b) =>
      (order[a.verdict] ?? 99) - (order[b.verdict] ?? 99),
  );
  for (const article of articles) {
    lines.push(renderArticleBlock(article));
  }

  await fs.mkdir(OUT_DIR, { recursive: true });
  const outFile = path.join(OUT_DIR, `keyword-audit-articles-${ymd()}.md`);
  await fs.writeFile(outFile, lines.join('\n'));
  console.log(`Wrote ${outFile}  (${opportunityCount} opportunities flagged)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
