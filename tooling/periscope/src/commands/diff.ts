/**
 * `periscope diff` command.
 *
 * Reads two snapshot JSON files and prints a per-engine delta to stdout.
 *
 * Sections per engine:
 *   - Totals (clicks, impressions, ctr)
 *   - Top pages by click delta
 *   - Top queries: new entrants (>=NEW_ENTRANT_MIN_IMP impressions in
 *     newer, absent in older)
 *   - Top queries: fallers (newer.impressions / older.impressions <
 *     FALLER_RATIO AND older.impressions >= FALLER_MIN_OLDER_IMP)
 *
 * Pure JSON manipulation. No SDK deps. No auth. ANSI colors and box
 * drawing when stdout is a TTY; plain text otherwise.
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';

import {
  ARROW,
  DOT,
  bold,
  boldCyan,
  brightCyan,
  colorByDelta,
  cyan,
  dim,
  green,
  red,
  rule,
  sectionClose,
  sectionOpen,
} from '../lib/colors.js';
import type {
  BingQueryRow,
  Ga4Section,
  GscRow,
  SnapshotEnvelope,
} from '../types/snapshot.js';

// ── Thresholds (match the .mjs script verbatim for parity) ─────────────

const FALLER_RATIO = 0.7;
const FALLER_MIN_OLDER_IMP = 10;
const NEW_ENTRANT_MIN_IMP = 5;
const TOP_N = 10;
const WIDTH = 72;

export interface DiffCommandOptions {
  older: string;
  newer: string;
}

// ── Number / delta formatters ──────────────────────────────────────────

function fmtInt(n: unknown): string {
  return Number(n ?? 0).toLocaleString('en-US');
}

function fmtPct(n: unknown): string {
  return `${(Number(n ?? 0) * 100).toFixed(2)}%`;
}

function fmtSigned(diff: number): string {
  if (diff === 0) return dim('flat');
  const sign = diff > 0 ? '+' : '';
  return colorByDelta(diff, `${sign}${fmtInt(diff)}`);
}

function fmtSignedPct(oldVal: unknown, newVal: unknown): string {
  const o = Number(oldVal ?? 0);
  const n = Number(newVal ?? 0);
  const diff = n - o;
  if (diff === 0) return dim('flat');
  const sign = diff > 0 ? '+' : '';
  return colorByDelta(diff, `${sign}${(diff * 100).toFixed(2)}pp`);
}

function totalRow(label: string, oldStr: string, newStr: string, suffix: string): string {
  const lbl = label.padEnd(13);
  const oldCol = String(oldStr).padStart(11);
  const newCol = String(newStr).padStart(10);
  return `    ${lbl}${oldCol}  ${ARROW}  ${newCol}    ${suffix}`;
}

function subhead(title: string, detail?: string): string {
  const head = bold(title);
  return detail ? `  ${head}  ${DOT}  ${dim(detail)}` : `  ${head}`;
}

// ── Diff helpers (pure, generic over row shape) ────────────────────────

interface MatchedPair<T> {
  key: string;
  oldRow: T | undefined;
  newRow: T | undefined;
}

function matchByKey<T>(
  oldRows: T[],
  newRows: T[],
  keyFn: (r: T) => string | null | undefined,
): MatchedPair<T>[] {
  const oldMap = new Map<string, T>();
  for (const r of oldRows) {
    const k = keyFn(r);
    if (k != null) oldMap.set(k, r);
  }
  const newMap = new Map<string, T>();
  for (const r of newRows) {
    const k = keyFn(r);
    if (k != null) newMap.set(k, r);
  }
  const keys = new Set<string>([...oldMap.keys(), ...newMap.keys()]);
  return [...keys].map((key) => ({
    key,
    oldRow: oldMap.get(key),
    newRow: newMap.get(key),
  }));
}

function findNewEntrants<T>(
  oldRows: T[],
  newRows: T[],
  keyFn: (r: T) => string | null | undefined,
  impFn: (r: T) => number,
): T[] {
  const oldKeys = new Set<string>();
  for (const r of oldRows) {
    const k = keyFn(r);
    if (k != null) oldKeys.add(k);
  }
  return newRows.filter((r) => {
    const k = keyFn(r);
    return k != null && !oldKeys.has(k) && impFn(r) >= NEW_ENTRANT_MIN_IMP;
  });
}

interface Faller {
  key: string;
  oldImp: number;
  newImp: number;
}

function findFallers<T>(
  oldRows: T[],
  newRows: T[],
  keyFn: (r: T) => string | null | undefined,
  impFn: (r: T) => number,
): Faller[] {
  const newMap = new Map<string, T>();
  for (const r of newRows) {
    const k = keyFn(r);
    if (k != null) newMap.set(k, r);
  }
  const out: Faller[] = [];
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

// ── Rendering blocks ───────────────────────────────────────────────────

interface Totals {
  clicks?: number;
  impressions?: number;
  ctr?: number;
}

function totalsBlock(out: NodeJS.WriteStream, o: Totals | undefined, n: Totals | undefined): void {
  const oc = o?.clicks ?? 0;
  const nc = n?.clicks ?? 0;
  const oi = o?.impressions ?? 0;
  const ni = n?.impressions ?? 0;
  out.write(subhead('Totals') + '\n');
  out.write(totalRow('clicks', fmtInt(oc), fmtInt(nc), fmtSigned(nc - oc)) + '\n');
  out.write(totalRow('impressions', fmtInt(oi), fmtInt(ni), fmtSigned(ni - oi)) + '\n');
  out.write(
    totalRow('ctr', fmtPct(o?.ctr), fmtPct(n?.ctr), fmtSignedPct(o?.ctr, n?.ctr)) + '\n',
  );
}

function pageDeltaBlock<T>(
  out: NodeJS.WriteStream,
  oldRows: T[],
  newRows: T[],
  keyFn: (r: T) => string | null | undefined,
  valFn: (r: T) => number,
  label: string,
): void {
  out.write(subhead(label, `top ${TOP_N}`) + '\n');
  const deltas = matchByKey(oldRows, newRows, keyFn)
    .map(({ key, oldRow, newRow }) => ({
      key,
      delta: valFn(newRow ?? ({} as T)) - valFn(oldRow ?? ({} as T)),
    }))
    .filter((r) => r.delta !== 0)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, TOP_N);
  if (deltas.length === 0) {
    out.write(`    ${dim('no changes')}\n`);
    return;
  }
  for (const r of deltas) {
    const sign = r.delta > 0 ? '+' : '';
    const deltaStr = colorByDelta(r.delta, (sign + r.delta).padStart(5));
    out.write(`    ${deltaStr}   ${r.key}\n`);
  }
}

function entrantsBlock<T>(
  out: NodeJS.WriteStream,
  oldRows: T[],
  newRows: T[],
  keyFn: (r: T) => string | null | undefined,
  impFn: (r: T) => number,
  posFn?: (r: T) => number | null,
): void {
  out.write(
    subhead(
      'New entrants',
      `≥${NEW_ENTRANT_MIN_IMP} impressions in newer, absent in older`,
    ) + '\n',
  );
  const entrants = findNewEntrants(oldRows, newRows, keyFn, impFn);
  if (entrants.length === 0) {
    out.write(`    ${dim('none')}\n`);
    return;
  }
  for (const r of entrants.slice(0, TOP_N)) {
    const pos = posFn ? posFn(r) : null;
    const tail = pos != null ? `${dim(', position')} ${pos.toFixed(1)}` : '';
    const key = keyFn(r) ?? '?';
    out.write(
      `    ${green('+')} ${cyan('"' + key + '"')}   ${fmtInt(impFn(r))} ${dim('imp')}${tail}\n`,
    );
  }
}

function fallersBlock<T>(
  out: NodeJS.WriteStream,
  oldRows: T[],
  newRows: T[],
  keyFn: (r: T) => string | null | undefined,
  impFn: (r: T) => number,
): void {
  out.write(
    subhead(
      'Fallers',
      `>30% impression drop, older had ≥${FALLER_MIN_OLDER_IMP} imp`,
    ) + '\n',
  );
  const fallers = findFallers(oldRows, newRows, keyFn, impFn);
  if (fallers.length === 0) {
    out.write(`    ${dim('none')}\n`);
    return;
  }
  for (const r of fallers.slice(0, TOP_N)) {
    const pct = ((r.newImp / r.oldImp - 1) * 100).toFixed(0);
    out.write(
      `    ${red('▼')} ${cyan('"' + r.key + '"')}   ${fmtInt(r.oldImp)} ${ARROW} ${fmtInt(r.newImp)} ${red('(' + pct + '%)')}\n`,
    );
  }
}

// ── Engine-specific views ──────────────────────────────────────────────

interface GscView {
  totals?: Totals;
  topPages?: GscRow[];
  topQueries?: GscRow[];
  countries?: GscRow[];
  devices?: GscRow[];
}

/**
 * Pull a normalized GSC view from a snapshot. Falls back to the SPEC-016
 * top-level duplicates if the modern `gsc` key is missing.
 */
function gscView(snap: SnapshotEnvelope): GscView | null {
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

function engineMissing(out: NodeJS.WriteStream, side: 'older' | 'newer'): void {
  out.write(`  ${dim('only present in ' + side + ' snapshot')}\n`);
}

function diffGsc(
  out: NodeJS.WriteStream,
  older: SnapshotEnvelope,
  newer: SnapshotEnvelope,
): void {
  out.write(sectionOpen('GSC', WIDTH) + '\n');
  const o = gscView(older);
  const n = gscView(newer);
  if (!o && !n) {
    out.write(`    ${dim('not present in either snapshot')}\n`);
    out.write(sectionClose(WIDTH) + '\n\n');
    return;
  }
  if (!o || !n) {
    engineMissing(out, o ? 'older' : 'newer');
    out.write(sectionClose(WIDTH) + '\n\n');
    return;
  }
  out.write('\n');
  totalsBlock(out, o.totals, n.totals);
  out.write('\n');
  pageDeltaBlock(
    out,
    o.topPages ?? [],
    n.topPages ?? [],
    (r) => r.keys?.[0],
    (r) => r.clicks ?? 0,
    'Top pages',
  );
  out.write('\n');
  entrantsBlock(
    out,
    o.topQueries ?? [],
    n.topQueries ?? [],
    (r) => r.keys?.[0],
    (r) => r.impressions ?? 0,
    (r) => r.position ?? null,
  );
  out.write('\n');
  fallersBlock(
    out,
    o.topQueries ?? [],
    n.topQueries ?? [],
    (r) => r.keys?.[0],
    (r) => r.impressions ?? 0,
  );
  out.write(sectionClose(WIDTH) + '\n\n');
}

function diffBing(
  out: NodeJS.WriteStream,
  older: SnapshotEnvelope,
  newer: SnapshotEnvelope,
): void {
  out.write(sectionOpen('Bing', WIDTH) + '\n');
  const o = older.bing;
  const n = newer.bing;
  if (!o && !n) {
    out.write(`    ${dim('not present in either snapshot')}\n`);
    out.write(sectionClose(WIDTH) + '\n\n');
    return;
  }
  if (!o || !n) {
    engineMissing(out, o ? 'older' : 'newer');
    out.write(sectionClose(WIDTH) + '\n\n');
    return;
  }
  out.write('\n');
  totalsBlock(out, o.totals, n.totals);
  if (o._note || n._note) {
    out.write(
      `    ${dim('note: older=' + (o._note ?? '-') + ', newer=' + (n._note ?? '-'))}\n`,
    );
  }
  out.write('\n');

  const keyFn = (r: BingQueryRow): string | null | undefined =>
    typeof r.Query === 'string' ? r.Query : undefined;
  const impFn = (r: BingQueryRow): number => Number(r.Impressions ?? 0);
  const posFn = (r: BingQueryRow): number | null =>
    r.AvgImpressionPosition != null ? Number(r.AvgImpressionPosition) : null;

  entrantsBlock(out, o.topQueries ?? [], n.topQueries ?? [], keyFn, impFn, posFn);
  out.write('\n');
  fallersBlock(out, o.topQueries ?? [], n.topQueries ?? [], keyFn, impFn);
  out.write(sectionClose(WIDTH) + '\n\n');
}

function diffGa4(
  out: NodeJS.WriteStream,
  older: SnapshotEnvelope,
  newer: SnapshotEnvelope,
): void {
  out.write(sectionOpen('GA4', WIDTH) + '\n');
  const o = older.ga4;
  const n = newer.ga4;
  if (!o && !n) {
    out.write(`    ${dim('not present in either snapshot')}\n`);
    out.write(sectionClose(WIDTH) + '\n\n');
    return;
  }
  if (!o || !n) {
    engineMissing(out, o ? 'older' : 'newer');
    out.write(sectionClose(WIDTH) + '\n\n');
    return;
  }
  out.write('\n');

  const sumSessions = (section: Ga4Section | undefined): number =>
    (section?.rows ?? []).reduce(
      (acc, row) => acc + Number(row.metricValues?.[0]?.value ?? 0),
      0,
    );

  const oSess = sumSessions(o.trafficSources);
  const nSess = sumSessions(n.trafficSources);
  const oSessEx = sumSessions(o.trafficSourcesExBotRegions);
  const nSessEx = sumSessions(n.trafficSourcesExBotRegions);

  out.write(subhead('Sessions', 'sum of trafficSources.sessions') + '\n');
  out.write(totalRow('all', fmtInt(oSess), fmtInt(nSess), fmtSigned(nSess - oSess)) + '\n');
  out.write(
    totalRow('ex bot', fmtInt(oSessEx), fmtInt(nSessEx), fmtSigned(nSessEx - oSessEx)) +
      '\n',
  );
  out.write('\n');

  pageDeltaBlock(
    out,
    o.organicLandingPages?.rows ?? [],
    n.organicLandingPages?.rows ?? [],
    (r) => r.dimensionValues?.[0]?.value,
    (r) => Number(r.metricValues?.[0]?.value ?? 0),
    'Organic landing pages (sessions delta)',
  );
  out.write(sectionClose(WIDTH) + '\n\n');
}

// ── Header ─────────────────────────────────────────────────────────────

function header(
  out: NodeJS.WriteStream,
  olderPath: string,
  newerPath: string,
  older: SnapshotEnvelope,
  newer: SnapshotEnvelope,
): void {
  const oldW = older.window;
  const newW = newer.window;
  const oldDate = older.pulledAt?.slice(0, 10) ?? oldW?.endDate ?? '?';
  const newDate = newer.pulledAt?.slice(0, 10) ?? newW?.endDate ?? '?';
  const days = newW?.days ?? oldW?.days ?? '?';
  const window = `${oldW?.startDate ?? '?'} ${ARROW} ${newW?.endDate ?? '?'}`;

  out.write('\n');
  out.write(rule(WIDTH) + '\n');
  const title = 'SEO snapshot diff';
  const pad = Math.floor((WIDTH - title.length) / 2);
  out.write(' '.repeat(pad) + boldCyan(title) + '\n');
  out.write(rule(WIDTH) + '\n');
  // brightCyan is also exported for any caller that needs the bare color
  void brightCyan;
  out.write('\n');
  out.write(
    `  ${dim(' older')}  ${ARROW}  ${path.basename(olderPath)}   ${dim('pulled')} ${oldDate}\n`,
  );
  out.write(
    `  ${dim(' newer')}  ${ARROW}  ${path.basename(newerPath)}   ${dim('pulled')} ${newDate}\n`,
  );
  out.write(`  ${dim('window')}  ${ARROW}  ${days} days  ${dim('(' + window + ')')}\n`);
  out.write('\n');
}

// ── Entry ──────────────────────────────────────────────────────────────

function readSnapshot(p: string): SnapshotEnvelope {
  const raw = readFileSync(path.resolve(p), 'utf-8');
  return JSON.parse(raw) as SnapshotEnvelope;
}

export function runDiff(options: DiffCommandOptions): void {
  const older = readSnapshot(options.older);
  const newer = readSnapshot(options.newer);
  const out = process.stdout;

  header(out, options.older, options.newer, older, newer);
  diffGsc(out, older, newer);
  diffBing(out, older, newer);
  diffGa4(out, older, newer);
}
