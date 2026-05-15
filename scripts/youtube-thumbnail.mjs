#!/usr/bin/env node
/**
 * Local YouTube thumbnail generator via hidden /og/youtube route.
 *
 * Usage:
 *   node scripts/youtube-thumbnail.mjs \
 *     --title "Hello World" \
 *     --category "Digital Marketing" \
 *     --category "SEO" \
 *     --out "tmp/hello-world.png"
 *
 * Notes:
 * - Route is localhost-only and non-production.
 * - Start Next dev server first (`npm run dev`).
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(__filename), '..');

function printUsage() {
  console.log(
    [
      'Usage:',
      '  node scripts/youtube-thumbnail.mjs --title "<title>" [--category "<category>"]... [--out <file>] [--base-url <url>]',
      '',
      'Examples:',
      '  node scripts/youtube-thumbnail.mjs --title "hello world" --category "Digital Marketing" --category "SEO"',
      '  node scripts/youtube-thumbnail.mjs --title "hello world" --category "Digital Marketing" --out "tmp/hello-world.png"',
      '',
      'Options:',
      '  --title       Required. Thumbnail title text.',
      '  --category    Optional, repeatable. Category label(s).',
      '  --out         Optional output file path. Default: tmp/youtube-thumbnail-<slug>.png',
      '  --base-url    Optional. Default: http://localhost:3000',
      '  -h, --help    Show this help.',
    ].join('\n'),
  );
}

function readOptionValue(argv, idx, name) {
  const arg = argv[idx];
  const prefixed = `--${name}=`;
  if (arg.startsWith(prefixed)) {
    return { value: arg.slice(prefixed.length), nextIdx: idx };
  }
  if (arg === `--${name}`) {
    const next = argv[idx + 1];
    if (!next || next.startsWith('--')) {
      throw new Error(`Missing value for --${name}`);
    }
    return { value: next, nextIdx: idx + 1 };
  }
  return null;
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function extFromContentType(contentType) {
  if (contentType.includes('image/jpeg')) return '.jpg';
  if (contentType.includes('image/webp')) return '.webp';
  return '.png';
}

function parseArgs(argv) {
  const out = {
    title: '',
    categories: [],
    baseUrl: 'http://localhost:3000',
    outFile: '',
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '-h' || arg === '--help') {
      out.help = true;
      continue;
    }

    const titleOpt = readOptionValue(argv, i, 'title');
    if (titleOpt) {
      out.title = titleOpt.value;
      i = titleOpt.nextIdx;
      continue;
    }

    const categoryOpt = readOptionValue(argv, i, 'category');
    if (categoryOpt) {
      out.categories.push(categoryOpt.value);
      i = categoryOpt.nextIdx;
      continue;
    }

    const outOpt = readOptionValue(argv, i, 'out');
    if (outOpt) {
      out.outFile = outOpt.value;
      i = outOpt.nextIdx;
      continue;
    }

    const baseUrlOpt = readOptionValue(argv, i, 'base-url');
    if (baseUrlOpt) {
      out.baseUrl = baseUrlOpt.value;
      i = baseUrlOpt.nextIdx;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!out.help && !out.title.trim()) {
    throw new Error('Missing required --title');
  }

  out.categories = out.categories.map((c) => c.trim()).filter(Boolean);
  out.title = out.title.trim();
  return out;
}

async function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(`[youtube-thumbnail] ${err?.message ?? String(err)}`);
    console.error('');
    printUsage();
    process.exit(2);
  }

  if (args.help) {
    printUsage();
    return;
  }

  const url = new URL('/og/youtube', args.baseUrl);
  url.searchParams.set('title', args.title);
  for (const category of args.categories) {
    url.searchParams.append('category', category);
  }

  let response;
  try {
    response = await fetch(url.toString());
  } catch (err) {
    console.error(
      `[youtube-thumbnail] Failed to reach ${url.origin}. Make sure the Next.js dev server is running (npm run dev).`,
    );
    console.error(`[youtube-thumbnail] ${err?.message ?? String(err)}`);
    process.exit(1);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    console.error(
      `[youtube-thumbnail] Request failed (${response.status} ${response.statusText}).`,
    );
    if (body) {
      console.error(`[youtube-thumbnail] Response body: ${body.slice(0, 300)}`);
    }
    process.exit(1);
  }

  const contentType = response.headers.get('content-type') || '';
  const outputExt = extFromContentType(contentType);
  const fallbackName = `youtube-thumbnail-${slugify(args.title) || 'untitled'}${outputExt}`;
  const outputPath = args.outFile
    ? path.resolve(REPO_ROOT, args.outFile)
    : path.resolve(REPO_ROOT, 'tmp', fallbackName);

  const bytes = Buffer.from(await response.arrayBuffer());
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, bytes);

  console.log(`Saved thumbnail: ${outputPath}`);
  console.log(`Source URL: ${url.toString()}`);
}

main().catch((err) => {
  console.error(`[youtube-thumbnail] ${err?.message ?? String(err)}`);
  process.exit(1);
});
