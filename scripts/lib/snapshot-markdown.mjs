// Renders an SEO snapshot JSON object into a Markdown summary.
// Pairs with seo-snapshot.mjs — the script writes both `snapshot-<date>.json`
// (for diff/data-viz tooling) and `snapshot-<date>.md` (for AI tools and
// human skim). Markdown is intentionally compact and section-cap'd; the raw
// JSON is still the source of truth for full data.

const fmtInt = (n) => (Number.isFinite(+n) ? Math.round(+n).toLocaleString('en-US') : '—');
const fmtPct = (n, d = 2) => (Number.isFinite(+n) ? (n * 100).toFixed(d) + '%' : '—');
const fmtPos = (n) => (Number.isFinite(+n) ? (+n).toFixed(1) : '—');
const fmtNum = (n, d = 2) => (Number.isFinite(+n) ? (+n).toFixed(d) : '—');

function fmtDuration(seconds) {
  if (!Number.isFinite(+seconds)) return '—';
  const s = Math.round(+seconds);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

function shortenUrl(u) {
  if (!u) return '';
  return u
    .replace(/^https?:\/\/[^/]+/, '')
    .replace(/^\/+$/, '/')
    || '/';
}

// GA4 returns parallel arrays — zip them into objects keyed by header name.
function ga4Rows(section) {
  if (!section?.rows?.length) return [];
  const dimNames = (section.dimensionHeaders ?? []).map((h) => h.name);
  const metNames = (section.metricHeaders ?? []).map((h) => h.name);
  return section.rows.map((row) => {
    const o = {};
    (row.dimensionValues ?? []).forEach((v, i) => (o[dimNames[i] ?? `dim${i}`] = v.value));
    (row.metricValues ?? []).forEach((v, i) => (o[metNames[i] ?? `met${i}`] = v.value));
    return o;
  });
}

function renderGscTopPages(rows, limit = 15) {
  if (!rows?.length) return '_(no GSC top-pages data)_';
  const head = '| URL | Clicks | Impr | CTR | Pos |\n|---|---:|---:|---:|---:|';
  const body = rows.slice(0, limit).map((r) => {
    const url = shortenUrl(r.keys?.[0] ?? '');
    return `| ${url} | ${fmtInt(r.clicks)} | ${fmtInt(r.impressions)} | ${fmtPct(r.ctr)} | ${fmtPos(r.position)} |`;
  });
  return [head, ...body].join('\n');
}

function renderGscTopQueries(rows, limit = 30) {
  if (!rows?.length) return '_(no GSC top-queries data)_';
  const head = '| Query | Clicks | Impr | CTR | Pos |\n|---|---:|---:|---:|---:|';
  const body = rows.slice(0, limit).map((r) => {
    const q = (r.keys?.[0] ?? '').replace(/\|/g, '\\|');
    return `| ${q} | ${fmtInt(r.clicks)} | ${fmtInt(r.impressions)} | ${fmtPct(r.ctr)} | ${fmtPos(r.position)} |`;
  });
  return [head, ...body].join('\n');
}

function renderGscBreakdown(rows, label, limit = 10) {
  if (!rows?.length) return `_(no ${label} data)_`;
  const head = `| ${label} | Clicks | Impr | CTR | Pos |\n|---|---:|---:|---:|---:|`;
  const body = rows.slice(0, limit).map((r) => {
    return `| ${r.keys?.[0] ?? '?'} | ${fmtInt(r.clicks)} | ${fmtInt(r.impressions)} | ${fmtPct(r.ctr)} | ${fmtPos(r.position)} |`;
  });
  return [head, ...body].join('\n');
}

function renderGa4TrafficSources(section, limit = 10) {
  const rows = ga4Rows(section);
  if (!rows.length) return '_(no GA4 traffic-sources data)_';
  // Sort by sessions DESC (numeric)
  rows.sort((a, b) => +b.sessions - +a.sessions);
  const head = '| Channel | Source | Medium | Sessions | Conversions |\n|---|---|---|---:|---:|';
  const body = rows.slice(0, limit).map((r) => {
    return `| ${r.sessionDefaultChannelGroup ?? '?'} | ${r.sessionSource ?? '?'} | ${r.sessionMedium ?? '?'} | ${fmtInt(r.sessions)} | ${fmtNum(r.conversions, 0)} |`;
  });
  return [head, ...body].join('\n');
}

function renderGa4LandingPages(section, limit = 10) {
  const rows = ga4Rows(section);
  if (!rows.length) return '_(no GA4 organic-landing-pages data)_';
  rows.sort((a, b) => +b.sessions - +a.sessions);
  const head = '| Page | Sessions | Bounce | Engaged | Avg dur |\n|---|---:|---:|---:|---:|';
  const body = rows.slice(0, limit).map((r) => {
    return `| ${shortenUrl(r.landingPagePlusQueryString)} | ${fmtInt(r.sessions)} | ${fmtPct(r.bounceRate)} | ${fmtPct(r.engagementRate)} | ${fmtDuration(r.averageSessionDuration)} |`;
  });
  return [head, ...body].join('\n');
}

function renderGa4UserBehavior(section) {
  // Devices subsection is the most useful skim.
  const rows = ga4Rows(section?.devices);
  if (!rows.length) return '_(no GA4 user-behavior data)_';
  const head = '| Device | Active users | Sessions | Engagement |\n|---|---:|---:|---:|';
  const body = rows.map((r) => {
    return `| ${r.deviceCategory ?? '?'} | ${fmtInt(r.activeUsers)} | ${fmtInt(r.sessions)} | ${fmtPct(r.engagementRate)} |`;
  });
  return [head, ...body].join('\n');
}

function ga4TotalSessions(section) {
  const rows = ga4Rows(section);
  return rows.reduce((sum, r) => sum + (+r.sessions || 0), 0);
}

export function renderSnapshotMarkdown(snapshot) {
  const date = (snapshot.pulledAt ?? '').slice(0, 10) || new Date().toISOString().slice(0, 10);
  const win = snapshot.window ?? snapshot.gsc?.window ?? {};

  const lines = [];

  lines.push(
    '---',
    `title: SEO snapshot — ${date}`,
    `tags: [seo, snapshot, gsc, ga4, bing, keywords]`,
    `date: ${date}`,
    `window_start: ${win.startDate ?? ''}`,
    `window_end: ${win.endDate ?? ''}`,
    '---',
    '',
    `# SEO snapshot — ${date}`,
    '',
    `**Window:** ${win.startDate ?? '?'} → ${win.endDate ?? '?'} (${win.days ?? '?'} days)  `,
    `**Site:** \`${snapshot.siteUrl ?? '?'}\`  `,
    `**Pulled:** ${snapshot.pulledAt ?? '?'}`,
    '',
  );

  // Headline numbers
  lines.push('## Headline numbers', '');
  const headRows = [];
  if (snapshot.gsc?.totals) {
    headRows.push(`| Google Search Console | ${fmtInt(snapshot.gsc.totals.clicks)} | ${fmtInt(snapshot.gsc.totals.impressions)} | ${fmtPct(snapshot.gsc.totals.ctr)} | — |`);
  }
  if (snapshot.bing?.totals) {
    const note = snapshot.bing._note ? ` *(${snapshot.bing._note})*` : '';
    headRows.push(`| Bing Webmaster${note} | ${fmtInt(snapshot.bing.totals.clicks)} | ${fmtInt(snapshot.bing.totals.impressions)} | ${fmtPct(snapshot.bing.totals.ctr)} | — |`);
  }
  if (snapshot.ga4?.trafficSources) {
    const total = ga4TotalSessions(snapshot.ga4.trafficSources);
    headRows.push(`| GA4 (all channels) | — | — | — | ${fmtInt(total)} |`);
  }
  if (snapshot.ga4?.trafficSourcesExBotRegions) {
    const total = ga4TotalSessions(snapshot.ga4.trafficSourcesExBotRegions);
    headRows.push(`| GA4 (excluding bot regions: ${(snapshot.ga4.botRegionsExcluded ?? []).join(', ') || '—'}) | — | — | — | ${fmtInt(total)} |`);
  }
  if (headRows.length) {
    lines.push('| Source | Clicks | Impressions | CTR | Sessions |', '|---|---:|---:|---:|---:|', ...headRows, '');
  } else {
    lines.push('_(no engines returned headline data)_', '');
  }

  // GSC
  if (snapshot.gsc) {
    lines.push('## GSC — top pages', '', renderGscTopPages(snapshot.gsc.topPages), '');
    lines.push('## GSC — top queries', '', renderGscTopQueries(snapshot.gsc.topQueries), '');
    lines.push('## GSC — countries', '', renderGscBreakdown(snapshot.gsc.countries, 'Country'), '');
    lines.push('## GSC — devices', '', renderGscBreakdown(snapshot.gsc.devices, 'Device', 5), '');
  }

  // GA4
  if (snapshot.ga4) {
    lines.push('## GA4 — traffic sources', '', renderGa4TrafficSources(snapshot.ga4.trafficSources), '');
    if (snapshot.ga4.trafficSourcesExBotRegions) {
      lines.push('### GA4 — traffic sources (bot regions excluded)', '', renderGa4TrafficSources(snapshot.ga4.trafficSourcesExBotRegions), '');
    }
    lines.push('## GA4 — organic landing pages', '', renderGa4LandingPages(snapshot.ga4.organicLandingPages), '');
    lines.push('## GA4 — user behavior (devices)', '', renderGa4UserBehavior(snapshot.ga4.userBehavior), '');
  }

  // Bing — only render detail section if there's something useful
  if (snapshot.bing && (snapshot.bing.topQueries?.length || snapshot.bing.trafficStats?.length)) {
    lines.push('## Bing — top queries', '');
    lines.push(renderGscTopQueries(snapshot.bing.topQueries, 15));
    lines.push('');
  }

  // Keywords (Google Ads Planner) — terse summary if present
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
    lines.push(`- Bot regions excluded from \`*ExBotRegions\` slices: ${snapshot.ga4.botRegionsExcluded.join(', ')} (per SPEC-018).`);
  }
  lines.push('- Full structured data: `snapshot-' + date + '.json` next to this file.');
  lines.push('');

  return lines.join('\n');
}
