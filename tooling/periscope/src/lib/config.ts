/**
 * periscope.config loader and zod schema.
 *
 * Looks for periscope.config.{ts,mjs,js,json} at the consumer repo
 * root. Validates against the schema; surfaces zod errors verbatim so
 * the field-naming is clear to the user.
 *
 * All commands consume config through this module. Env vars stay
 * supported as fallbacks for siteUrl, ga4PropertyId, outputDir, and the
 * various API credentials.
 */

import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { z } from 'zod';

// ── Schema ─────────────────────────────────────────────────────────────

export const FrontmatterFieldsSchema = z
  .object({
    title: z.string().default('title'),
    summary: z.string().default('summary'),
    tags: z.string().default('tags'),
    category: z.string().default('category'),
  })
  .default({});

export const ArticlesSchema = z
  .object({
    dir: z.string(),
    frontmatterFields: FrontmatterFieldsSchema,
  })
  .optional();

export const LandingPagesSchema = z
  .object({
    dir: z.string(),
    pageFile: z.string().default('page.tsx'),
    brandSuffix: z.string().optional(),
  })
  .optional();

export const AdsSchema = z
  .object({
    languageCode: z.string().default('languageConstants/1000'),
    geoTargets: z.array(z.string()).default(['geoTargetConstants/2840']),
  })
  .default({});

export const Ga4Schema = z
  .object({
    botRegions: z.array(z.string()).default(['China', 'Singapore']),
  })
  .default({});

export const PeriscopeConfigSchema = z.object({
  siteUrl: z.string().min(1),
  ga4PropertyId: z.string().optional(),
  outputDir: z.string().default('docs/strategy/data'),
  articles: ArticlesSchema,
  landingPages: LandingPagesSchema,
  ads: AdsSchema,
  ga4: Ga4Schema,
  categories: z.array(z.string()).default([]),
});

export type PeriscopeConfig = z.infer<typeof PeriscopeConfigSchema>;

// ── Loader ─────────────────────────────────────────────────────────────

const CONFIG_FILENAMES = [
  'periscope.config.ts',
  'periscope.config.mjs',
  'periscope.config.js',
  'periscope.config.json',
];

/**
 * Resolve which config file exists at the given root (priority order:
 * ts, mjs, js, json). Returns null when none of them are present.
 */
export function findConfigFile(repoRoot: string): string | null {
  for (const name of CONFIG_FILENAMES) {
    const candidate = path.join(repoRoot, name);
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

export interface LoadConfigOptions {
  /** Override the config file path. */
  configPath?: string;
  /** Repo root for searching when configPath is not set. Defaults to process.cwd(). */
  repoRoot?: string;
  /**
   * When true and no config file is found, fall back to an env-only
   * config built from process.env. This is the bridge used during the
   * SPEC-023 port -- once a periscope.config.ts exists in every
   * consumer, the env-only path becomes a deprecation candidate.
   */
  envFallback?: boolean;
}

/**
 * Load and validate the periscope config. Resolution order:
 *   1. options.configPath (explicit override)
 *   2. periscope.config.{ts,mjs,js,json} at options.repoRoot
 *   3. envFallback: synthesize a minimal config from process.env
 *
 * .ts/.mjs/.js are dynamic-imported; .json is fs-read.
 */
export async function loadConfig(
  options: LoadConfigOptions = {},
): Promise<{ config: PeriscopeConfig; sourcePath: string | null }> {
  const repoRoot = options.repoRoot ?? process.cwd();
  const explicit = options.configPath
    ? path.isAbsolute(options.configPath)
      ? options.configPath
      : path.resolve(repoRoot, options.configPath)
    : null;

  if (explicit && !existsSync(explicit)) {
    throw new Error(`periscope: --config points to a file that does not exist: ${explicit}`);
  }

  const sourcePath = explicit ?? findConfigFile(repoRoot);

  if (!sourcePath) {
    if (!options.envFallback) {
      throw new Error(
        `periscope: no periscope.config.{ts,mjs,js,json} found at ${repoRoot}. Create one or pass --config.`,
      );
    }
    return { config: buildEnvFallbackConfig(), sourcePath: null };
  }

  const raw = await importConfigFile(sourcePath);
  const parsed = PeriscopeConfigSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(
      `periscope: ${path.basename(sourcePath)} failed validation:\n${issues}`,
    );
  }
  return { config: parsed.data, sourcePath };
}

async function importConfigFile(filePath: string): Promise<unknown> {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.json') {
    const fs = await import('node:fs/promises');
    const text = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(text);
  }
  // .ts/.mjs/.js: dynamic import via file:// URL. For .ts files we rely on
  // Node 22's experimental TS support OR a build step that produces a
  // compiled file -- the consumer repo's choice. periscope itself doesn't
  // ship a TS loader.
  const fileUrl = pathToFileURL(filePath).href;
  const mod = (await import(fileUrl)) as { default?: unknown } & Record<string, unknown>;
  return mod.default ?? mod;
}

/**
 * Synthesize a config from process.env. Used when no periscope.config
 * file exists and envFallback is enabled. Mirrors the env vars the .mjs
 * scripts read directly.
 */
function buildEnvFallbackConfig(): PeriscopeConfig {
  const siteUrl = process.env.GSC_SITE_URL ?? '';
  if (!siteUrl) {
    throw new Error(
      'periscope (env fallback): GSC_SITE_URL is required when no periscope.config file is present.',
    );
  }
  const parsed = PeriscopeConfigSchema.parse({
    siteUrl,
    ga4PropertyId: process.env.GA4_PROPERTY_ID,
    outputDir: process.env.OUTPUT_DIR ?? 'docs/strategy/data',
  });
  return parsed;
}
