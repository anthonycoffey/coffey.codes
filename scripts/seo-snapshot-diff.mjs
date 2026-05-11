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
 * If an engine exists in only one of the two files, that section is
 * skipped with a one-line note.
 */

import { readFileSync } from 'fs';
import path from 'path';

const FALLER_RATIO = 0.7;
const FALLER_MIN_OLDER_IMP = 10;
const NEW_ENTRANT_MIN_IMP = 5;
const TOP_N = 10;

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

// ── Formatters ───────────────────────────────────────────────────────

function fmtInt(n) {
  return Number(n ?? 0).toLocaleString('en-US');
}

function fmtPct(n) {
  return `${(Number(n ?? 0) * 100).toFixed(2)}%`;
}

function fmtSigned(n) {
  const v = Number(n ?? 0);
  if (v === 0) return '(flat)';
  const sign = v > 0 ? '+' : '';
  return `(${sign}${fmtInt(v)})`;
}

function fmtSignedPct(older, newer) {
  const o = Number(older ?? 0);
  const n = Number(newer ?? 0);
  const diff = n - o;
  if (diff === 0) return '(flat)';
  const sign = diff > 0 ? '+' : '';
  return `(${sign}${(diff * 100).toFixed(2)}pp)`;
}

function row(label, oldVal, newVal, suffix = '') {
  return `  ${label.padEnd(12)} ${String(oldVal).padStart(10)} -> ${String(newVal).padStart(10)}    ${suffix}`;
}

// ── Section: header ──────────────────────────────────────────────────

function header() {
  const oldWindow = older.window ?? {};
  const newWindow = newer.window ?? {};
  const oldDate = older.pulledAt?.slice(0, 10) ?? oldWindow.endDate ?? '?';
  const newDate = newer.pulledAt?.slice(0, 10) ?? newWindow.endDate ?? '?';
  const days = newWindow.days ?? oldWindow.days ?? '?';
  console.log(`SEO snapshot diff`);
  console.log(`  older: ${olderPath}  (pulled ${oldDate}, window ${oldWindow.startDate ?? '?'} to ${oldWindow.endDate ?? '?'})`);
  console.log(`  newer: ${newerPath}  (pulled ${newDate}, window ${newWindow.startDate ?? '?'} to ${newWindow.endDate ?? '?'})`);
  console.log(`  window days: ${days}`);
  console.log('');
}

// ── Section: GSC ─────────────────────────────────────────────────────

// SPEC-016-era snapshots stored GSC fields at the top level. SPEC-018
// nests them under `gsc`. Fall back so diffs across the format change
// still work.
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
  const o = gscView(older);
  const n = gscView(newer);
  console.log(`── GSC ──────────────────────────────────────────────────────────────`);
  if (!o && !n) {
    console.log('  (not present in either snapshot)');
    console.log('');
    return;
  }
  if (!o || !n) {
    console.log(`  (only present in ${o ? 'older' : 'newer'} snapshot — skipping)`);
    console.log('');
    return;
  }

  // Totals
  console.log('Totals');
  console.log(row('clicks', fmtInt(o.totals?.clicks), fmtInt(n.totals?.clicks), fmtSigned((n.totals?.clicks ?? 0) - (o.totals?.clicks ?? 0))));
  console.log(row('impressions', fmtInt(o.totals?.impressions), fmtInt(n.totals?.impressions), fmtSigned((n.totals?.impressions ?? 0) - (o.totals?.impressions ?? 0))));
  console.log(row('ctr', fmtPct(o.totals?.ctr), fmtPct(n.totals?.ctr), fmtSignedPct(o.totals?.ctr, n.totals?.ctr)));
  console.log('');

  // Top pages (clicks delta)
  console.log(`Top pages (clicks delta, top ${TOP_N})`);
  const pageDeltas = matchByKey(o.topPages ?? [], n.topPages ?? [], (r) => r.keys?.[0])
    .map(({ key, oldRow, newRow }) => ({
      key,
      delta: (newRow?.clicks ?? 0) - (oldRow?.clicks ?? 0),
      oldClicks: oldRow?.clicks ?? 0,
      newClicks: newRow?.clicks ?? 0,
    }))
    .filter((r) => r.delta !== 0)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, TOP_N);
  if (pageDeltas.length === 0) {
    console.log('  (no changes)');
  } else {
    for (const r of pageDeltas) {
      const sign = r.delta > 0 ? '+' : '';
      console.log(`  ${(sign + r.delta).padStart(4)}  ${r.key}`);
    }
  }
  console.log('');

  // Queries: new entrants
  console.log(`Top queries: new entrants (>=${NEW_ENTRANT_MIN_IMP} impressions in newer, absent in older)`);
  const entrants = findNewEntrants(o.topQueries ?? [], n.topQueries ?? [], (r) => r.keys?.[0]);
  if (entrants.length === 0) {
    console.log('  (none)');
  } else {
    for (const r of entrants.slice(0, TOP_N)) {
      const position = r.position != null ? `, position ${r.position.toFixed(1)}` : '';
      console.log(`  "${r.keys?.[0] ?? '?'}"   ${fmtInt(r.impressions)} impressions${position}`);
    }
  }
  console.log('');

  // Queries: fallers
  console.log('Top queries: fallers (>30% impression drop, older had >=10 imp)');
  const fallers = findFallers(o.topQueries ?? [], n.topQueries ?? [], (r) => r.keys?.[0]);
  if (fallers.length === 0) {
    console.log('  (none)');
  } else {
    for (const r of fallers.slice(0, TOP_N)) {
      const pct = ((r.newImp / r.oldImp - 1) * 100).toFixed(0);
      console.log(`  "${r.key}"   ${fmtInt(r.oldImp)} -> ${fmtInt(r.newImp)} (${pct}%)`);
    }
  }
  console.log('');
}

// ── Section: Bing ────────────────────────────────────────────────────

function diffBing() {
  const o = older.bing;
  const n = newer.bing;
  console.log(`── Bing ─────────────────────────────────────────────────────────────`);
  if (!o && !n) {
    console.log('  (not present in either snapshot)');
    console.log('');
    return;
  }
  if (!o || !n) {
    console.log(`  (only present in ${o ? 'older' : 'newer'} snapshot — skipping)`);
    console.log('');
    return;
  }

  console.log('Totals');
  console.log(row('clicks', fmtInt(o.totals?.clicks), fmtInt(n.totals?.clicks), fmtSigned((n.totals?.clicks ?? 0) - (o.totals?.clicks ?? 0))));
  console.log(row('impressions', fmtInt(o.totals?.impressions), fmtInt(n.totals?.impressions), fmtSigned((n.totals?.impressions ?? 0) - (o.totals?.impressions ?? 0))));
  console.log(row('ctr', fmtPct(o.totals?.ctr), fmtPct(n.totals?.ctr), fmtSignedPct(o.totals?.ctr, n.totals?.ctr)));
  if (o._note || n._note) {
    console.log(`  note: older=${o._note ?? '-'}, newer=${n._note ?? '-'}`);
  }
  console.log('');

  // Bing GetQueryStats rows have shape { Query, Clicks, Impressions,
  // AvgImpressionPosition, AvgClickPosition }
  const keyFn = (r) => r.Query;
  const impFn = (r) => r.Impressions ?? 0;

  console.log(`Top queries: new entrants (>=${NEW_ENTRANT_MIN_IMP} impressions in newer, absent in older)`);
  const entrants = findNewEntrants(o.topQueries ?? [], n.topQueries ?? [], keyFn, impFn);
  if (entrants.length === 0) {
    console.log('  (none)');
  } else {
    for (const r of entrants.slice(0, TOP_N)) {
      const pos = r.AvgImpressionPosition != null ? `, position ${Number(r.AvgImpressionPosition).toFixed(1)}` : '';
      console.log(`  "${r.Query ?? '?'}"   ${fmtInt(impFn(r))} impressions${pos}`);
    }
  }
  console.log('');

  console.log('Top queries: fallers (>30% impression drop, older had >=10 imp)');
  const fallers = findFallers(o.topQueries ?? [], n.topQueries ?? [], keyFn, impFn);
  if (fallers.length === 0) {
    console.log('  (none)');
  } else {
    for (const r of fallers.slice(0, TOP_N)) {
      const pct = ((r.newImp / r.oldImp - 1) * 100).toFixed(0);
      console.log(`  "${r.key}"   ${fmtInt(r.oldImp)} -> ${fmtInt(r.newImp)} (${pct}%)`);
    }
  }
  console.log('');
}

// ── Section: GA4 ─────────────────────────────────────────────────────

function diffGa4() {
  const o = older.ga4;
  const n = newer.ga4;
  console.log(`── GA4 ──────────────────────────────────────────────────────────────`);
  if (!o && !n) {
    console.log('  (not present in either snapshot)');
    console.log('');
    return;
  }
  if (!o || !n) {
    console.log(`  (only present in ${o ? 'older' : 'newer'} snapshot — skipping)`);
    console.log('');
    return;
  }

  // GA4 rows: { dimensionValues: [{value}, ...], metricValues: [{value}, ...] }
  // For trafficSources, dim[0] = channelGroup, metric[0] = sessions
  const sumSessions = (report) =>
    (report?.rows ?? []).reduce(
      (acc, row) => acc + Number(row.metricValues?.[0]?.value ?? 0),
      0,
    );

  console.log('Sessions (sum of trafficSources.sessions)');
  const oSess = sumSessions(o.trafficSources);
  const nSess = sumSessions(n.trafficSources);
  console.log(row('all', fmtInt(oSess), fmtInt(nSess), fmtSigned(nSess - oSess)));
  const oSessEx = sumSessions(o.trafficSourcesExBotRegions);
  const nSessEx = sumSessions(n.trafficSourcesExBotRegions);
  console.log(row('ex bot', fmtInt(oSessEx), fmtInt(nSessEx), fmtSigned(nSessEx - oSessEx)));
  console.log('');

  // Top organic landing pages: key by dimensionValues[0].value, metric[0] = sessions
  console.log(`Organic landing pages (sessions delta, top ${TOP_N})`);
  const keyFn = (r) => r.dimensionValues?.[0]?.value;
  const sessFn = (r) => Number(r.metricValues?.[0]?.value ?? 0);
  const pageDeltas = matchByKey(
    o.organicLandingPages?.rows ?? [],
    n.organicLandingPages?.rows ?? [],
    keyFn,
  )
    .map(({ key, oldRow, newRow }) => ({
      key,
      delta: sessFn(newRow ?? {}) - sessFn(oldRow ?? {}),
    }))
    .filter((r) => r.delta !== 0)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, TOP_N);
  if (pageDeltas.length === 0) {
    console.log('  (no changes)');
  } else {
    for (const r of pageDeltas) {
      const sign = r.delta > 0 ? '+' : '';
      console.log(`  ${(sign + r.delta).padStart(4)}  ${r.key}`);
    }
  }
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

// ── Main ─────────────────────────────────────────────────────────────

header();
diffGsc();
diffBing();
diffGa4();
