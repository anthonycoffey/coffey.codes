/**
 * ANSI color and box-drawing helpers.
 *
 * Consolidates the duplicated ANSI helpers that lived inline in
 * scripts/seo-snapshot-diff.mjs and scripts/keyword-probe-url.mjs.
 *
 * TTY detection: colors are emitted only when stdout is a TTY and
 * NO_COLOR is unset (matching https://no-color.org). Piped output and
 * CI logs stay clean.
 */

/** True when ANSI escapes are safe to emit on stdout. */
export const USE_COLOR: boolean = !!process.stdout.isTTY && !process.env.NO_COLOR;

/** Build a color-applying function for a single SGR code (or sequence like `1;96`). */
export function color(code: string): (s: string | number) => string {
  return (s) => (USE_COLOR ? `\x1b[${code}m${s}\x1b[0m` : String(s));
}

// ── Named single-code colors ────────────────────────────────────────────

export const bold = color('1');
export const dim = color('2');
export const red = color('31');
export const green = color('32');
export const yellow = color('33');
export const blue = color('34');
export const magenta = color('35');
export const cyan = color('36');
export const brightCyan = color('96');

// ── Compound styles ─────────────────────────────────────────────────────

/** Bold + bright cyan (`1;96`). Used for section titles in the diff output. */
export const boldCyan = color('1;96');

// ── Glyphs that have plain-text fallbacks ───────────────────────────────

/** Arrow used in "older → newer" rows; falls back to "->" without color. */
export const ARROW = USE_COLOR ? dim('→') : '->';

/** Bullet used in subheads; falls back to "-" without color. */
export const DOT = USE_COLOR ? dim('·') : '-';

// ── Delta helpers ───────────────────────────────────────────────────────

/**
 * Color text by delta sign: green when positive, red when negative,
 * dim when zero. Used for click/impression deltas.
 */
export function colorByDelta(delta: number, text: string): string {
  if (delta === 0) return dim(text);
  return delta > 0 ? green(text) : red(text);
}

// ── Box drawing ─────────────────────────────────────────────────────────

/**
 * Render a horizontal rule in bright cyan. Default character is the
 * heavy box-drawing horizontal `━`.
 */
export function rule(width: number, char = '━'): string {
  return brightCyan(char.repeat(width));
}

/**
 * Render the top of a titled box section:
 *   ╭─ <title> ──────────────────╮
 * `width` is the total cell width including the corners.
 */
export function sectionOpen(title: string, width: number): string {
  const inner = width - 5 - title.length;
  return (
    brightCyan('╭─ ') +
    boldCyan(title) +
    ' ' +
    brightCyan('─'.repeat(Math.max(0, inner))) +
    brightCyan('╮')
  );
}

/** Render the bottom of a titled box section: `╰─────...╯`. */
export function sectionClose(width: number): string {
  return brightCyan('╰' + '─'.repeat(width - 2) + '╯');
}
