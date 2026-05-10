import { describe, it, expect } from 'vitest';
import nextConfig from '@/next.config.js';

describe('next.config.js redirects', () => {
  it('contains no redirect chains (every destination resolves in one hop)', async () => {
    const redirects = await (
      nextConfig as {
        redirects?: () => Promise<{ source: string; destination: string }[]>;
      }
    ).redirects?.();

    expect(redirects).toBeDefined();
    if (!redirects) return;

    const sources = new Set(redirects.map((r) => r.source));
    const chains = redirects.filter((r) => sources.has(r.destination));

    expect(
      chains,
      `Found redirect chains — destination is itself a redirect source:\n` +
        chains.map((c) => `  ${c.source} → ${c.destination}`).join('\n'),
    ).toEqual([]);
  });

  it('every redirect uses permanent: true (308)', async () => {
    const redirects = await (
      nextConfig as {
        redirects?: () => Promise<
          { source: string; destination: string; permanent: boolean }[]
        >;
      }
    ).redirects?.();

    if (!redirects) return;

    const nonPermanent = redirects.filter((r) => !r.permanent);
    expect(
      nonPermanent,
      `These redirects should be permanent (308) but are 307:\n` +
        nonPermanent.map((r) => `  ${r.source}`).join('\n'),
    ).toEqual([]);
  });
});
