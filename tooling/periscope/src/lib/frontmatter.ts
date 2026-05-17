/**
 * Minimal YAML frontmatter parser.
 *
 * Reads the leading `---`-delimited block of a Markdown/MDX file and
 * returns a flat string map. Quoted values are unquoted. Lists, nested
 * objects, dates as Date instances etc. are not supported -- the audit
 * scripts only need flat strings, so we don't pull in gray-matter for
 * what amounts to 20 lines of parsing.
 *
 * Returns null when the file does not start with a frontmatter block.
 */

export interface FrontmatterFieldNames {
  title?: string;
  summary?: string;
  tags?: string;
  category?: string;
}

export type Frontmatter = Record<string, string>;

export function parseFrontmatter(raw: string): Frontmatter | null {
  if (!raw.startsWith('---')) return null;
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return null;
  const fm = raw.slice(3, end).trim();
  const out: Frontmatter = {};
  for (const line of fm.split(/\r?\n/)) {
    const m = line.match(/^([a-zA-Z]+):\s*(.*)$/);
    if (!m) continue;
    const key = m[1] ?? '';
    let value = (m[2] ?? '').trim();
    if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    } else if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    if (key) out[key] = value;
  }
  return out;
}

/**
 * Normalize a frontmatter map into an article record shape using the
 * configured field names. Defaults: title, summary, tags, category.
 * Tags are split on comma.
 */
export interface NormalizedArticleFrontmatter {
  title: string;
  summary: string;
  tags: string[];
  category: string;
}

export function normalizeArticleFrontmatter(
  fm: Frontmatter | null,
  fields: FrontmatterFieldNames = {},
): NormalizedArticleFrontmatter {
  const titleKey = fields.title ?? 'title';
  const summaryKey = fields.summary ?? 'summary';
  const tagsKey = fields.tags ?? 'tags';
  const categoryKey = fields.category ?? 'category';
  const rawTags = fm?.[tagsKey] ?? '';
  return {
    title: fm?.[titleKey] ?? '(no title)',
    summary: fm?.[summaryKey] ?? '',
    tags: rawTags
      ? rawTags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : [],
    category: fm?.[categoryKey] ?? '',
  };
}
