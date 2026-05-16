/**
 * Snapshot Markdown renderer.
 *
 * Ported from scripts/lib/snapshot-markdown.mjs. Pairs with the JSON
 * snapshot: the JSON is the source of truth, the Markdown is the
 * human/AI skim. Section structure and column ordering match the .mjs
 * version byte-for-byte (SPEC-023 parity).
 */

import type {
  BingEngineData,
  Ga4Section,
  GscRow,
  SnapshotEnvelope,
} from '../types/snapshot.js';

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

const fmtInt = (n: unknown): string =>
  Number.isFinite(Number(n))
    ? Math.round(Number(n)).toLocaleString('en-US')
    : '—';

const fmtPct = (n: unknown, d = 2): string =>
  Number.isFinite(Number(n)) ? (Number(n) * 100).toFixed(d) + '%' : '—';

const fmtPos = (n: unknown): string =>
  Number.isFinite(Number(n)) ? Number(n).toFixed(1) : '—';

const fmtNum = (n: unknown, d = 2): string =>
  Number.isFinite(Number(n)) ? Number(n).toFixed(d) : '—';

function fmtDuration(seconds: unknown): string {
  if (!Number.isFinite(Number(seconds))) return '—';
  const s = Math.round(Number(seconds));
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

function shortenUrl(u: string | undefined): string {
  if (!u) return '';
  return (
    u
      .replace(/^https?:\/\/[^/]+/, '')
      .replace(/^\/+$/, '/') || '/'
  );
}

// ---------------------------------------------------------------------------
// GA4 row zipping
// ---------------------------------------------------------------------------

/**
 * GA4 returns parallel arrays for dimensions and metrics; this zips them
 * into a plain object keyed by header name for easier downstream access.
 */
function ga4Rows(section: Ga4Section | undefined): Record<string, string>[] {
  if (!section?.rows?.length) return [];
  const dimNames = (section.dimensionHeaders ?? []).map((h) => h.name);
  const metNames = (section.metricHeaders ?? []).map((h) => h.name);
  return section.rows.map((row) => {
    const o: Record<string, string> = {};
    (row.dimensionValues ?? []).forEach((v, i) => {
      const key = dimNames[i] ?? `dim${i}`;
      o[key] = v.value ?? '';
    });
    (row.metricValues ?? []).forEach((v, i) => {
      const key = metNames[i] ?? `met${i}`;
      o[key] = v.value ?? '';
    });
    return o;
  });
}

function ga4TotalSessions(section: Ga4Section | undefined): number {
  const rows = ga4Rows(section);
  return rows.reduce((sum, r) => sum + (Number(r.sessions) || 0), 0);
}

// ---------------------------------------------------------------------------
// GSC table renderers
// ---------------------------------------------------------------------------

function renderGscTopPages(rows: GscRow[] | undefined, limit = 15): string {
  if (!rows?.length) return '_(no GSC top-pages data)_';
  const head = '| URL | Clicks | Impr | CTR | Pos |\n|---|---:|---:|---:|---:|';
  const body = rows.slice(0, limit).map((r) => {
    const url = shortenUrl(r.keys?.[0] ?? '');
    return `| ${url} | ${fmtInt(r.clicks)} | ${fmtInt(r.impressions)} | ${fmtPct(r.ctr)} | ${fmtPos(r.position)} |`;
  });
  return [head, ...body].join('\n');
}

function renderGscTopQueries(rows: GscRow[] | undefined, limit = 30): string {
  if (!rows?.length) return '_(no GSC top-queries data)_';
  const head = '| Query | Clicks | Impr | CTR | Pos |\n|---|---:|---:|---:|---:|';
  const body = rows.slice(0, limit).map((r) => {
    const q = (r.keys?.[0] ?? '').replace(/\|/g, '\\|');
    return `| ${q} | ${fmtInt(r.clicks)} | ${fmtInt(r.impressions)} | ${fmtPct(r.ctr)} | ${fmtPos(r.position)} |`;
  });
  return [head, ...body].join('\n');
}

function renderGscBreakdown(
  rows: GscRow[] | undefined,
  label: string,
  limit = 10,
): string {
  if (!rows?.length) return `_(no ${label} data)_`;
  const head = `| ${label} | Clicks | Impr | CTR | Pos |\n|---|---:|---:|---:|---:|`;
  const body = rows.slice(0, limit).map((r) => {
    return `| ${r.keys?.[0] ?? '?'} | ${fmtInt(r.clicks)} | ${fmtInt(r.impressions)} | ${fmtPct(r.ctr)} | ${fmtPos(r.position)} |`;
  });
  return [head, ...body].join('\n');
}

// ---------------------------------------------------------------------------
// GA4 table renderers
// ---------------------------------------------------------------------------

function renderGa4TrafficSources(
  section: Ga4Section | undefined,
  limit = 10,
): string {
  const rows = ga4Rows(section);
  if (!rows.length) return '_(no GA4 traffic-sources data)_';
  rows.sort((a, b) => Number(b.sessions) - Number(a.sessions));
  const head =
    '| Channel | Source | Medium | Sessions | Conversions |\n|---|---|---|---:|---:|';
  const body = rows.slice(0, limit).map((r) => {
    return `| ${r.sessionDefaultChannelGroup ?? '?'} | ${r.sessionSource ?? '?'} | ${r.sessionMedium ?? '?'} | ${fmtInt(r.sessions)} | ${fmtNum(r.conversions, 0)} |`;
  });
  return [head, ...body].join('\n');
}

function renderGa4LandingPages(
  section: Ga4Section | undefined,
  limit = 10,
): string {
  const rows = ga4Rows(section);
  if (!rows.length) return '_(no GA4 organic-landing-pages data)_';
  rows.sort((a, b) => Number(b.sessions) - Number(a.sessions));
  const head =
    '| Page | Sessions | Bounce | Engaged | Avg dur |\n|---|---:|---:|---:|---:|';
  const body = rows.slice(0, limit).map((r) => {
    return `| ${shortenUrl(r.landingPagePlusQueryString)} | ${fmtInt(r.sessions)} | ${fmtPct(r.bounceRate)} | ${fmtPct(r.engagementRate)} | ${fmtDuration(r.averageSessionDuration)} |`;
  });
  return [head, ...body].join('\n');
}

function renderGa4UserBehavior(
  userBehavior:
    | { devices: Ga4Section; countries?: Ga4Section; engagement?: Ga4Section }
    | undefined,
): string {
  const rows = ga4Rows(userBehavior?.devices);
  if (!rows.length) return '_(no GA4 user-behavior data)_';
  const head =
    '| Device | Active users | Sessions | Engagement |\n|---|---:|---:|---:|';
  const body = rows.map((r) => {
    return `| ${r.deviceCategory ?? '?'} | ${fmtInt(r.activeUsers)} | ${fmtInt(r.sessions)} | ${fmtPct(r.engagementRate)} |`;
  });
  return [head, ...body].join('\n');
}

// ---------------------------------------------------------------------------
// Bing helper: reuse GSC top-queries shape since Bing's API rows have
// the same field names when we treat them as `keys: [Query]`-style rows.
// The actual port renders Bing rows directly without the keys[] shim.
// ---------------------------------------------------------------------------

function renderBingTopQueries(
  rows: BingEngineData['topQueries'] | undefined,
  limit = 15,
): string {
  if (!rows?.length) return '_(no Bing top-queries data)_';
  const head = '| Query | Clicks | Impr |\n|---|---:|---:|';
  const body = rows.slice(0, limit).map((r) => {
    const q = String(r.Query ?? '').replace(/\|/g, '\\|');
    return `| ${q} | ${fmtInt(r.Clicks)} | ${fmtInt(r.Impressions)} |`;
  });
  return [head, ...body].join('\n');
}

// ---------------------------------------------------------------------------
// Public entry: full snapshot → markdown
// ---------------------------------------------------------------------------

export function renderSnapshotMarkdown(snapshot: SnapshotEnvelope): string {
  const date =
    (snapshot.pulledAt ?? '').slice(0, 10) ||
    new Date().toISOString().slice(0, 10);
  const win = snapshot.window ?? snapshot.gsc?.window;

  const lines: string[] = [];

  lines.push(
    '---',
    `title: SEO snapshot — ${date}`,
    `tags: [seo, snapshot, gsc, ga4, bing, keywords]`,
    `date: ${date}`,
    `window_start: ${win?.startDate ?? ''}`,
    `window_end: ${win?.endDate ?? ''}`,
    '---',
    '',
    `# SEO snapshot — ${date}`,
    '',
    `**Window:** ${win?.startDate ?? '?'} → ${win?.endDate ?? '?'} (${win?.days ?? '?'} days)  `,
    `**Site:** \`${snapshot.siteUrl ?? '?'}\`  `,
    `**Pulled:** ${snapshot.pulledAt ?? '?'}`,
    '',
  );

  // Headline numbers
  lines.push('## Headline numbers', '');
  const headRows: string[] = [];
  if (snapshot.gsc?.totals) {
    headRows.push(
      `| Google Search Console | ${fmtInt(snapshot.gsc.totals.clicks)} | ${fmtInt(snapshot.gsc.totals.impressions)} | ${fmtPct(snapshot.gsc.totals.ctr)} | — |`,
    );
  }
  if (snapshot.bing?.totals) {
    const note = snapshot.bing._note ? ` *(${snapshot.bing._note})*` : '';
    headRows.push(
      `| Bing Webmaster${note} | ${fmtInt(snapshot.bing.totals.clicks)} | ${fmtInt(snapshot.bing.totals.impressions)} | ${fmtPct(snapshot.bing.totals.ctr)} | — |`,
    );
  }
  if (snapshot.ga4?.trafficSources) {
    const total = ga4TotalSessions(snapshot.ga4.trafficSources);
    headRows.push(`| GA4 (all channels) | — | — | — | ${fmtInt(total)} |`);
  }
  if (snapshot.ga4?.trafficSourcesExBotRegions) {
    const total = ga4TotalSessions(snapshot.ga4.trafficSourcesExBotRegions);
    const regions = (snapshot.ga4.botRegionsExcluded ?? []).join(', ') || '—';
    headRows.push(
      `| GA4 (excluding bot regions: ${regions}) | — | — | — | ${fmtInt(total)} |`,
    );
  }
  if (headRows.length) {
    lines.push(
      '| Source | Clicks | Impressions | CTR | Sessions |',
      '|---|---:|---:|---:|---:|',
      ...headRows,
      '',
    );
  } else {
    lines.push('_(no engines returned headline data)_', '');
  }

  // GSC
  if (snapshot.gsc) {
    lines.push(
      '## GSC — top pages',
      '',
      renderGscTopPages(snapshot.gsc.topPages),
      '',
    );
    lines.push(
      '## GSC — top queries',
      '',
      renderGscTopQueries(snapshot.gsc.topQueries),
      '',
    );
    lines.push(
      '## GSC — countries',
      '',
      renderGscBreakdown(snapshot.gsc.countries, 'Country'),
      '',
    );
    lines.push(
      '## GSC — devices',
      '',
      renderGscBreakdown(snapshot.gsc.devices, 'Device', 5),
      '',
    );
  }

  // GA4
  if (snapshot.ga4) {
    lines.push(
      '## GA4 — traffic sources',
      '',
      renderGa4TrafficSources(snapshot.ga4.trafficSources),
      '',
    );
    if (snapshot.ga4.trafficSourcesExBotRegions) {
      lines.push(
        '### GA4 — traffic sources (bot regions excluded)',
        '',
        renderGa4TrafficSources(snapshot.ga4.trafficSourcesExBotRegions),
        '',
      );
    }
    lines.push(
      '## GA4 — organic landing pages',
      '',
      renderGa4LandingPages(snapshot.ga4.organicLandingPages),
      '',
    );
    lines.push(
      '## GA4 — user behavior (devices)',
      '',
      renderGa4UserBehavior(snapshot.ga4.userBehavior),
      '',
    );
  }

  // Bing detail (only when there's something useful)
  if (
    snapshot.bing &&
    (snapshot.bing.topQueries?.length || snapshot.bing.trafficStats?.length)
  ) {
    lines.push('## Bing — top queries', '');
    lines.push(renderBingTopQueries(snapshot.bing.topQueries, 15));
    lines.push('');
  }

  // Keywords (Google Ads Planner) summary
  if (snapshot.keywords) {
    const k = snapshot.keywords;
    lines.push(
      '## Keywords (Google Ads Planner)',
      '',
      `- Historical metrics returned: **${fmtInt(k.historicalMetrics?.length ?? 0)}**`,
      `- Keyword ideas returned: **${fmtInt(k.ideas?.length ?? 0)}**`,
      '',
    );
  }

  // Notes
  lines.push('## Notes', '');
  if (snapshot.ga4?.botRegionsExcluded?.length) {
    lines.push(
      `- Bot regions excluded from \`*ExBotRegions\` slices: ${snapshot.ga4.botRegionsExcluded.join(', ')} (per SPEC-018).`,
    );
  }
  lines.push(`- Full structured data: \`snapshot-${date}.json\` next to this file.`);
  lines.push('');

  return lines.join('\n');
}
