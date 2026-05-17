import { describe, expect, it } from 'vitest';

import { PeriscopeConfigSchema } from '../../src/lib/config.js';

describe('PeriscopeConfigSchema', () => {
  it('accepts a minimal valid config', () => {
    const parsed = PeriscopeConfigSchema.parse({
      siteUrl: 'sc-domain:example.com',
    });
    expect(parsed.siteUrl).toBe('sc-domain:example.com');
    expect(parsed.outputDir).toBe('docs/strategy/data');
    expect(parsed.ads.languageCode).toBe('languageConstants/1000');
    expect(parsed.ads.geoTargets).toEqual(['geoTargetConstants/2840']);
    expect(parsed.ga4.botRegions).toEqual(['China', 'Singapore']);
    expect(parsed.categories).toEqual([]);
  });

  it('rejects missing siteUrl', () => {
    expect(() => PeriscopeConfigSchema.parse({})).toThrow();
  });

  it('rejects empty siteUrl', () => {
    expect(() => PeriscopeConfigSchema.parse({ siteUrl: '' })).toThrow();
  });

  it('accepts a fully-populated config', () => {
    const parsed = PeriscopeConfigSchema.parse({
      siteUrl: 'sc-domain:coffey.codes',
      ga4PropertyId: '416080229',
      outputDir: 'docs/strategy/data',
      articles: {
        dir: 'app/(site)/articles/posts',
      },
      landingPages: {
        dir: 'app/lp',
        pageFile: 'page.tsx',
        brandSuffix: ' | Anthony Coffey',
      },
      categories: ['Web Development', 'Mobile Development'],
      ads: {
        languageCode: 'languageConstants/1000',
        geoTargets: ['geoTargetConstants/2840'],
      },
      ga4: {
        botRegions: ['China', 'Singapore'],
      },
    });
    expect(parsed.articles?.dir).toBe('app/(site)/articles/posts');
    expect(parsed.articles?.frontmatterFields.title).toBe('title');
    expect(parsed.landingPages?.pageFile).toBe('page.tsx');
    expect(parsed.landingPages?.brandSuffix).toBe(' | Anthony Coffey');
    expect(parsed.categories).toHaveLength(2);
  });

  it('articles.frontmatterFields defaults are applied when omitted', () => {
    const parsed = PeriscopeConfigSchema.parse({
      siteUrl: 'sc-domain:example.com',
      articles: { dir: 'posts' },
    });
    expect(parsed.articles?.frontmatterFields).toEqual({
      title: 'title',
      summary: 'summary',
      tags: 'tags',
      category: 'category',
    });
  });

  it('articles.frontmatterFields custom names override defaults', () => {
    const parsed = PeriscopeConfigSchema.parse({
      siteUrl: 'sc-domain:example.com',
      articles: {
        dir: 'posts',
        frontmatterFields: { title: 'name' },
      },
    });
    expect(parsed.articles?.frontmatterFields.title).toBe('name');
    expect(parsed.articles?.frontmatterFields.summary).toBe('summary');
  });
});
