/**
 * Snapshot file I/O.
 *
 * Reads and writes the per-engine JSON snapshots that live in the
 * project's configured outputDir (default: docs/strategy/data/).
 *
 * File naming convention: `snapshot-YYYY-MM-DD.json` plus a companion
 * `snapshot-YYYY-MM-DD.md`. Same date stem for both formats.
 */

import { promises as fs } from 'node:fs';
import { existsSync } from 'node:fs';
import path from 'node:path';

import type { SnapshotEnvelope } from '../types/snapshot.js';

export interface StoredSnapshot extends SnapshotEnvelope {
  /** Filename of the source on disk; added when loading from disk. */
  _sourceFile?: string;
}

/**
 * Find the most-recent snapshot in `outputDir`. Returns null when the
 * directory does not exist or contains no `snapshot-*.json` files.
 */
export async function loadLatestSnapshot(
  outputDir: string,
): Promise<StoredSnapshot | null> {
  if (!existsSync(outputDir)) return null;

  const files = (await fs.readdir(outputDir))
    .filter((f) => /^snapshot-\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .sort();

  if (files.length === 0) return null;

  const latest = files[files.length - 1];
  if (!latest) return null;

  const raw = await fs.readFile(path.join(outputDir, latest), 'utf-8');
  const data = JSON.parse(raw) as SnapshotEnvelope;
  return { ...data, _sourceFile: latest };
}

/** Return true if a snapshot's `pulledAt` is older than `days` days. */
export function isSnapshotStale(
  snapshot: SnapshotEnvelope | null | undefined,
  days = 30,
): boolean {
  if (!snapshot?.pulledAt) return true;
  const pulledAt = new Date(snapshot.pulledAt).getTime();
  if (Number.isNaN(pulledAt)) return true;
  const ageMs = Date.now() - pulledAt;
  return ageMs > days * 24 * 60 * 60 * 1000;
}

/**
 * Write a snapshot JSON to disk. Creates `outputDir` if missing.
 * Returns the absolute path written.
 */
export async function writeSnapshotJson(
  outputDir: string,
  envelope: SnapshotEnvelope,
  asof: Date = new Date(),
): Promise<string> {
  await fs.mkdir(outputDir, { recursive: true });
  const date = asof.toISOString().slice(0, 10);
  const filename = `snapshot-${date}.json`;
  const filePath = path.join(outputDir, filename);
  await fs.writeFile(filePath, JSON.stringify(envelope, null, 2) + '\n', 'utf-8');
  return filePath;
}

/**
 * Write a snapshot's Markdown companion next to its JSON. Same date
 * stem, `.md` extension. Returns the absolute path written.
 */
export async function writeSnapshotMarkdown(
  outputDir: string,
  markdown: string,
  asof: Date = new Date(),
): Promise<string> {
  await fs.mkdir(outputDir, { recursive: true });
  const date = asof.toISOString().slice(0, 10);
  const filename = `snapshot-${date}.md`;
  const filePath = path.join(outputDir, filename);
  await fs.writeFile(filePath, markdown, 'utf-8');
  return filePath;
}
