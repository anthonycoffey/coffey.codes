import { describe, expect, it } from 'vitest';

import {
  normalizeArticleFrontmatter,
  parseFrontmatter,
} from '../../src/lib/frontmatter.js';

describe('parseFrontmatter', () => {
  it('returns null when input does not start with ---', () => {
    expect(parseFrontmatter('not frontmatter')).toBeNull();
    expect(parseFrontmatter('## Heading\nbody')).toBeNull();
  });

  it('returns null when closing --- is missing', () => {
    expect(parseFrontmatter('---\ntitle: stuck\nbody')).toBeNull();
  });

  it('parses a flat block', () => {
    const raw = `---
title: My Article
summary: A short summary
category: Web Development
tags: react, typescript, tdd
---

body`;
    expect(parseFrontmatter(raw)).toEqual({
      title: 'My Article',
      summary: 'A short summary',
      category: 'Web Development',
      tags: 'react, typescript, tdd',
    });
  });

  it('unquotes single and double quoted values', () => {
    const raw = `---
title: 'Quoted Single'
summary: "Quoted Double"
---
`;
    expect(parseFrontmatter(raw)).toEqual({
      title: 'Quoted Single',
      summary: 'Quoted Double',
    });
  });

  it('skips lines that do not match key: value', () => {
    const raw = `---
title: ok
- nope
---
`;
    expect(parseFrontmatter(raw)).toEqual({ title: 'ok' });
  });
});

describe('normalizeArticleFrontmatter', () => {
  it('uses default field names', () => {
    const fm = {
      title: 't',
      summary: 's',
      tags: 'a, b, c',
      category: 'cat',
    };
    expect(normalizeArticleFrontmatter(fm)).toEqual({
      title: 't',
      summary: 's',
      tags: ['a', 'b', 'c'],
      category: 'cat',
    });
  });

  it('falls back to defaults when fields are missing', () => {
    expect(normalizeArticleFrontmatter(null)).toEqual({
      title: '(no title)',
      summary: '',
      tags: [],
      category: '',
    });
    expect(normalizeArticleFrontmatter({})).toEqual({
      title: '(no title)',
      summary: '',
      tags: [],
      category: '',
    });
  });

  it('respects custom field name mapping', () => {
    const fm = { name: 'NameField', subject: 'SubjectField', keywords: 'x, y' };
    const normalized = normalizeArticleFrontmatter(fm, {
      title: 'name',
      summary: 'subject',
      tags: 'keywords',
    });
    expect(normalized.title).toBe('NameField');
    expect(normalized.summary).toBe('SubjectField');
    expect(normalized.tags).toEqual(['x', 'y']);
  });

  it('trims and filters empty tag entries', () => {
    expect(normalizeArticleFrontmatter({ tags: '  a , , b ,  c  ' }).tags).toEqual([
      'a',
      'b',
      'c',
    ]);
  });
});
