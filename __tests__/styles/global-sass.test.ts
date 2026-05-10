import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(__dirname, '..', '..');
const read = (p: string) => readFileSync(resolve(root, p), 'utf8');

describe('global.sass — route-specific rules extracted', () => {
  it('global.sass no longer contains route-specific selectors that block render on every page', () => {
    const src = read('styles/global.sass');

    // Article-specific (only render on /articles, /case-study)
    expect(src).not.toMatch(/^\.prose\b/m);
    expect(src).not.toMatch(/^\.callout\b/m);

    // Portfolio-specific
    expect(src).not.toMatch(/^\s*\.polaroid-card\b/m);
    expect(src).not.toMatch(/^\s*\.vhs-card\b/m);
    expect(src).not.toMatch(/^\s*\.retro-window\b/m);

    // Homepage-specific
    expect(src).not.toMatch(/^\s*\.logo-grid\b/m);
  });

  it('article-specific rules live in styles/article-prose.sass', () => {
    expect(existsSync(resolve(root, 'styles/article-prose.sass'))).toBe(true);
    const src = read('styles/article-prose.sass');
    expect(src).toMatch(/\.prose\b/);
    expect(src).toMatch(/\.callout\b/);
  });

  it('portfolio card rules live in styles/portfolio-cards.sass', () => {
    expect(existsSync(resolve(root, 'styles/portfolio-cards.sass'))).toBe(
      true,
    );
    const src = read('styles/portfolio-cards.sass');
    expect(src).toMatch(/\.polaroid-card\b/);
  });

  it('retro-window rules live in styles/retro-window.sass', () => {
    expect(existsSync(resolve(root, 'styles/retro-window.sass'))).toBe(true);
    const src = read('styles/retro-window.sass');
    expect(src).toMatch(/\.retro-window\b/);
  });

  it('logo-grid rules live in styles/logo-grid.sass', () => {
    expect(existsSync(resolve(root, 'styles/logo-grid.sass'))).toBe(true);
    const src = read('styles/logo-grid.sass');
    expect(src).toMatch(/\.logo-grid\b/);
  });
});
