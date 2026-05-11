#!/usr/bin/env node
/**
 * SEO snapshot diff — SPEC-018.
 *
 * Reads two snapshot JSON files from docs/strategy/data/ and prints
 * a human-readable delta for every engine present in both files.
 *
 * Usage:
 *   node scripts/seo-snapshot-diff.mjs <older.json> <newer.json>
 *
 * No SDK deps. No auth. Pure JSON manipulation.
 *
 * Sections per engine:
 *   - Totals (clicks, impressions, ctr)
 *   - Top pages by click delta
 *   - Top queries: new entrants (>=5 impressions in newer, absent in older)
 *   - Top queries: fallers (newer.impressions / older.impressions < 0.7
 *     AND older.impressions >= 10)
 *
 * ANSI colors and box-drawing characters when stdout is a TTY; falls
 * back to plain text otherwise (so CI logs and piped output stay clean).
 */

import { readFileSync } from 'fs';
import path from 'path';

const FALLER_RATIO = 0.7;
const FALLER_MIN_OLDER_IMP = 10;
const NEW_ENTRANT_MIN_IMP = 5;
const TOP_N = 10;
const WIDTH = 72;

// ── CLI ──────────────────────────────────────────────────────────────

const argv = process.argv.slice(2);
if (argv.length !== 2) {
  console.error('Usage: node scripts/seo-snapshot-diff.mjs <older.json> <newer.json>');
  process.exit(2);
}

const [olderPath, newerPath] = argv;
const older = readSnapshot(olderPath);
const newer = readSnapshot(newerPath);

function readSnapshot(p) {
  const raw = readFileSync(path.resolve(p), 'utf-8');
  return JSON.parse(raw);
}

// ── Colors ───────────────────────────────────────────────────────────

const USE_COLOR = process.stdout.isTTY && !process.env.NO_COLOR;
const c = (code) => (s) => USE_COLOR ? `\x1b[${code}m${s}\x1b[0m` : String(s);
const bold = c('1');
const dim = c('2');
const red = c('31');
const green = c('32');
const yellow = c('33');
const cyan = c('36');
const brightCyan = c('96');
const boldCyan = (s) => (USE_COLOR ? `\x1b[1;96m${s}\x1b[0m` : String(s));

const ARROW = USE_COLOR ? dim('→') : '->';
const DOT = USE_COLOR ? dim('·') : '-';

// ── Number / delta formatters ────────────────────────────────────────

function fmtInt(n) {
  return Number(n ?? 0).toLocaleString('en-US');
}

function fmtPct(n) {
  return `${(Number(n ?? 0) * 100).toFixed(2)}%`;
}

function colorDelta(diff, text) {
  if (diff === 0) return dim(text);
  return diff > 0 ? green(text) : red(text);
}

function fmtSigned(diff) {
  if (diff === 0) return dim('flat');
  const sign = diff > 0 ? '+' : '';
  return colorDelta(diff, `${sign}${fmtInt(diff)}`);
}

function fmtSignedPct(oldVal, newVal) {
  const o = Number(oldVal ?? 0);
  const n = Number(newVal ?? 0);
  const diff = n - o;
  if (diff === 0) return dim('flat');
  const sign = diff > 0 ? '+' : '';
  return colorDelta(diff, `${sign}${(diff * 100).toFixed(2)}pp`);
}

function totalRow(label, oldStr, newStr, suffix) {
  const lbl = label.padEnd(13);
  const oldCol = String(oldStr).padStart(11);
  const newCol = String(newStr).padStart(10);
  return `    ${lbl}${oldCol}  ${ARROW}  ${newCol}    ${suffix}`;
}

// ── Box drawing ──────────────────────────────────────────────────────

function rule(char = '━') {
  return brightCyan(char.repeat(WIDTH));
}

function sectionOpen(title) {
  // total width = 1 (╭) + 2 (─ ) + title.length + 1 ( ) + N + 1 (╮)
  // => N = WIDTH - 5 - title.length
  const inner = WIDTH - 5 - title.length;
  return brightCyan('╭─ ') + boldCyan(title) + ' ' + brightCyan('─'.repeat(Math.max(0, inner))) + brightCyan('╮');
}

function sectionClose() {
  return brightCyan('╰' + '─'.repeat(WIDTH - 2) + '╯');
}

function subhead(title, detail) {
  const head = bold(title);
  return detail ? `  ${head}  ${DOT}  ${dim(detail)}` : `  ${head}`;
}

// ── Header ───────────────────────────────────────────────────────────

function header() {
  const oldW = older.window ?? {};
  const newW = newer.window ?? {};
  const oldDate = older.pulledAt?.slice(0, 10) ?? oldW.endDate ?? '?';
  const newDate = newer.pulledAt?.slice(0, 10) ?? newW.endDate ?? '?';
  const days = newW.days ?? oldW.days ?? '?';
  const window = `${oldW.startDate ?? '?'} ${ARROW} ${newW.endDate ?? '?'}`;

  console.log('');
  console.log(rule());
  const title = 'SEO snapshot diff';
  const pad = Math.floor((WIDTH - title.length) / 2);
  console.log(' '.repeat(pad) + boldCyan(title));
  console.log(rule());
  console.log('');
  console.log(`  ${dim(' older')}  ${ARROW}  ${path.basename(olderPath)}   ${dim('pulled')} ${oldDate}`);
  console.log(`  ${dim(' newer')}  ${ARROW}  ${path.basename(newerPath)}   ${dim('pulled')} ${newDate}`);
  console.log(`  ${dim('window')}  ${ARROW}  ${days} days  ${dim('(' + window + ')')}`);
  console.log('');
}

// ── Per-engine rendering helpers ─────────────────────────────────────

function engineMissing(side) {
  console.log(`  ${dim('only present in ' + side + ' snapshot')}`);
}

function emptyLine(text) {
  console.log(`    ${dim(text)}`);
}

function totalsBlock(oTotals, nTotals) {
  const oc = oTotals?.clicks ?? 0;
  const nc = nTotals?.clicks ?? 0;
  const oi = oTotals?.impressions ?? 0;
  const ni = nTotals?.impressions ?? 0;
  console.log(subhead('Totals'));
  console.log(totalRow('clicks', fmtInt(oc), fmtInt(nc), fmtSigned(nc - oc)));
  console.log(totalRow('impressions', fmtInt(oi), fmtInt(ni), fmtSigned(ni - oi)));
  console.log(totalRow('ctr', fmtPct(oTotals?.ctr), fmtPct(nTotals?.ctr), fmtSignedPct(oTotals?.ctr, nTotals?.ctr)));
}

function pageDeltaBlock(oldRows, newRows, keyFn, valFn, label) {
  console.log(subhead(label, `top ${TOP_N}`));
  const deltas = matchByKey(oldRows, newRows, keyFn)
    .map(({ key, oldRow, newRow }) => ({
      key,
      delta: valFn(newRow ?? {}) - valFn(oldRow ?? {}),
    }))
    .filter((r) => r.delta !== 0)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, TOP_N);
  if (deltas.length === 0) {
    emptyLine('no changes');
    return;
  }
  for (const r of deltas) {
    const sign = r.delta > 0 ? '+' : '';
    const deltaStr = colorDelta(r.delta, (sign + r.delta).padStart(5));
    console.log(`    ${deltaStr}   ${r.key}`);
  }
}

function entrantsBlock(oldRows, newRows, keyFn, impFn, posFn) {
  console.log(subhead('New entrants', `≥${NEW_ENTRANT_MIN_IMP} impressions in newer, absent in older`));
  const entrants = findNewEntrants(oldRows, newRows, keyFn, impFn);
  if (entrants.length === 0) {
    emptyLine('none');
    return;
  }
  for (const r of entrants.slice(0, TOP_N)) {
    const pos = posFn ? posFn(r) : null;
    const tail = pos != null ? `${dim(', position')} ${pos.toFixed(1)}` : '';
    console.log(`    ${green('+')} ${cyan('"' + (keyFn(r) ?? '?') + '"')}   ${fmtInt(impFn(r))} ${dim('imp')}${tail}`);
  }
}

function fallersBlock(oldRows, newRows, keyFn, impFn) {
  console.log(subhead('Fallers', `>30% impression drop, older had ≥${FALLER_MIN_OLDER_IMP} imp`));
  const fallers = findFallers(oldRows, newRows, keyFn, impFn);
  if (fallers.length === 0) {
    emptyLine('none');
    return;
  }
  for (const r of fallers.slice(0, TOP_N)) {
    const pct = ((r.newImp / r.oldImp - 1) * 100).toFixed(0);
    console.log(`    ${red('▼')} ${cyan('"' + r.key + '"')}   ${fmtInt(r.oldImp)} ${ARROW} ${fmtInt(r.newImp)} ${red('(' + pct + '%)')}`);
  }
}

// ── Section: GSC ─────────────────────────────────────────────────────

function gscView(snap) {
  if (snap.gsc) return snap.gsc;
  if (snap.totals || snap.topPages || snap.topQueries) {
    return {
      totals: snap.totals,
      topPages: snap.topPages,
      topQueries: snap.topQueries,
      countries: snap.countries,
      devices: snap.devices,
    };
  }
  return null;
}

function diffGsc() {
  console.log(sectionOpen('GSC'));
  const o = gscView(older);
  const n = gscView(newer);
  if (!o && !n) {
    emptyLine('not present in either snapshot');
    console.log(sectionClose());
    console.log('');
    return;
  }
  if (!o || !n) {
    engineMissing(o ? 'older' : 'newer');
    console.log(sectionClose());
    console.log('');
    return;
  }
  console.log('');
  totalsBlock(o.totals, n.totals);
  console.log('');
  pageDeltaBlock(
    o.topPages ?? [],
    n.topPages ?? [],
    (r) => r.keys?.[0],
    (r) => r.clicks ?? 0,
    'Top pages',
  );
  console.log('');
  entrantsBlock(
    o.topQueries ?? [],
    n.topQueries ?? [],
    (r) => r.keys?.[0],
    (r) => r.impressions ?? 0,
    (r) => r.position,
  );
  console.log('');
  fallersBlock(
    o.topQueries ?? [],
    n.topQueries ?? [],
    (r) => r.keys?.[0],
    (r) => r.impressions ?? 0,
  );
  console.log(sectionClose());
  console.log('');
}

// ── Section: Bing ────────────────────────────────────────────────────

function diffBing() {
  console.log(sectionOpen('Bing'));
  const o = older.bing;
  const n = newer.bing;
  if (!o && !n) {
    emptyLine('not present in either snapshot');
    console.log(sectionClose());
    console.log('');
    return;
  }
  if (!o || !n) {
    engineMissing(o ? 'older' : 'newer');
    console.log(sectionClose());
    console.log('');
    return;
  }
  console.log('');
  totalsBlock(o.totals, n.totals);
  if (o._note || n._note) {
    console.log(`    ${dim('note: older=' + (o._note ?? '-') + ', newer=' + (n._note ?? '-'))}`);
  }
  console.log('');

  const keyFn = (r) => r.Query;
  const impFn = (r) => r.Impressions ?? 0;
  const posFn = (r) =>
    r.AvgImpressionPosition != null ? Number(r.AvgImpressionPosition) : null;

  entrantsBlock(o.topQueries ?? [], n.topQueries ?? [], keyFn, impFn, posFn);
  console.log('');
  fallersBlock(o.topQueries ?? [], n.topQueries ?? [], keyFn, impFn);
  console.log(sectionClose());
  console.log('');
}

// ── Section: GA4 ─────────────────────────────────────────────────────

function diffGa4() {
  console.log(sectionOpen('GA4'));
  const o = older.ga4;
  const n = newer.ga4;
  if (!o && !n) {
    emptyLine('not present in either snapshot');
    console.log(sectionClose());
    console.log('');
    return;
  }
  if (!o || !n) {
    engineMissing(o ? 'older' : 'newer');
    console.log(sectionClose());
    console.log('');
    return;
  }
  console.log('');

  // For trafficSources, dim[0] = channelGroup, metric[0] = sessions
  const sumSessions = (report) =>
    (report?.rows ?? []).reduce(
      (acc, row) => acc + Number(row.metricValues?.[0]?.value ?? 0),
      0,
    );

  const oSess = sumSessions(o.trafficSources);
  const nSess = sumSessions(n.trafficSources);
  const oSessEx = sumSessions(o.trafficSourcesExBotRegions);
  const nSessEx = sumSessions(n.trafficSourcesExBotRegions);

  console.log(subhead('Sessions', 'sum of trafficSources.sessions'));
  console.log(totalRow('all', fmtInt(oSess), fmtInt(nSess), fmtSigned(nSess - oSess)));
  console.log(totalRow('ex bot', fmtInt(oSessEx), fmtInt(nSessEx), fmtSigned(nSessEx - oSessEx)));
  console.log('');

  pageDeltaBlock(
    o.organicLandingPages?.rows ?? [],
    n.organicLandingPages?.rows ?? [],
    (r) => r.dimensionValues?.[0]?.value,
    (r) => Number(r.metricValues?.[0]?.value ?? 0),
    'Organic landing pages (sessions delta)',
  );
  console.log(sectionClose());
  console.log('');
}

// ── Helpers ──────────────────────────────────────────────────────────

function matchByKey(oldRows, newRows, keyFn) {
  const oldMap = new Map();
  for (const r of oldRows) {
    const k = keyFn(r);
    if (k != null) oldMap.set(k, r);
  }
  const newMap = new Map();
  for (const r of newRows) {
    const k = keyFn(r);
    if (k != null) newMap.set(k, r);
  }
  const keys = new Set([...oldMap.keys(), ...newMap.keys()]);
  return [...keys].map((key) => ({
    key,
    oldRow: oldMap.get(key),
    newRow: newMap.get(key),
  }));
}

function findNewEntrants(oldRows, newRows, keyFn, impFn = (r) => r.impressions ?? 0) {
  const oldKeys = new Set();
  for (const r of oldRows) {
    const k = keyFn(r);
    if (k != null) oldKeys.add(k);
  }
  return newRows.filter(
    (r) => !oldKeys.has(keyFn(r)) && impFn(r) >= NEW_ENTRANT_MIN_IMP,
  );
}

function findFallers(oldRows, newRows, keyFn, impFn = (r) => r.impressions ?? 0) {
  const newMap = new Map();
  for (const r of newRows) {
    const k = keyFn(r);
    if (k != null) newMap.set(k, r);
  }
  const out = [];
  for (const r of oldRows) {
    const k = keyFn(r);
    if (k == null) continue;
    const oldImp = impFn(r);
    if (oldImp < FALLER_MIN_OLDER_IMP) continue;
    const newRow = newMap.get(k);
    const newImp = newRow ? impFn(newRow) : 0;
    if (newImp / oldImp < FALLER_RATIO) {
      out.push({ key: k, oldImp, newImp });
    }
  }
  return out.sort((a, b) => a.newImp / a.oldImp - b.newImp / b.oldImp);
}

// quiet unused-var warning for `yellow` (reserved for future "watch" highlight)
void yellow;

// ── Main ─────────────────────────────────────────────────────────────

header();
diffGsc();
diffBing();
diffGa4();
