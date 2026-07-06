import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import ConsentDefaultScript from '@/components/ConsentDefaultScript';
import AnalyticsHead from '@/components/AnalyticsHead';
import GoogleAnalyticsLazy from '@/components/GoogleAnalyticsLazy';

// The ADR-005 follow-up (now ADR-006): the Consent Mode denied default must be
// provably in dataLayer before GTM loads. This is guaranteed structurally, not
// by timing:
//
//   1. The consent default is emitted as a *parse-time inline* <script> in the
//      document <head> — it runs synchronously while the HTML is parsed.
//   2. The GTM container is *not* in the server HTML; it is injected later,
//      client-side, on idle, by GoogleAnalyticsLazy in <body>.
//
// (1) strictly precedes (2) in the document lifecycle, so the denied default is
// always applied to the first hit. These tests pin both halves.

describe('consent default runs before GTM', () => {
  describe('the consent default is a parse-time inline script', () => {
    const html = renderToStaticMarkup(<ConsentDefaultScript />);

    it('is an inline script (no src/async/defer) so it runs during parse', () => {
      expect(html.startsWith('<script')).toBe(true);
      expect(html).toContain('</script>');
      // External or deferred scripts would NOT be guaranteed before GTM.
      expect(html).not.toContain(' src=');
      expect(html).not.toMatch(/\sasync/);
      expect(html).not.toMatch(/\sdefer/);
    });

    it('sets geo-scoped Consent Mode defaults inline (ADR-007)', () => {
      expect(html).toContain("gtag('consent','default'");
      // Global default grants analytics (lawful outside opt-in regions)...
      expect(html).toContain('"analytics_storage":"granted"');
      // ...and a region-scoped default denies it inside the EEA/UK/CH.
      expect(html).toContain('"analytics_storage":"denied"');
      expect(html).toContain('"region":[');
      expect(html).toContain('"GB"');
      expect(html).toContain('"CH"');
      // Advertising stays denied by default everywhere until an explicit grant.
      // (The exact per-signal default values are pinned structurally in
      // __tests__/lib/consent.test.ts; here we only assert the inline shape.)
      expect(html).toContain('"ad_storage":"denied"');
    });
  });

  describe('AnalyticsHead head fragment', () => {
    const html = renderToStaticMarkup(<AnalyticsHead />);

    it('contains both the consent-default script and the GTM preconnect', () => {
      expect(html).toContain('id="consent-default"');
      expect(html).toContain('href="https://www.googletagmanager.com"');
      expect(html).toContain('rel="preconnect"');
    });
  });

  describe('the GTM container loads strictly later', () => {
    it('does not inject GTM synchronously — it is deferred to idle', () => {
      const { container } = render(<GoogleAnalyticsLazy />);
      // Nothing rendered on the first synchronous pass: the GTM container is
      // gated behind requestIdleCallback, so it cannot beat the inline,
      // parse-time consent default into dataLayer.
      expect(container.innerHTML).toBe('');
    });
  });
});
