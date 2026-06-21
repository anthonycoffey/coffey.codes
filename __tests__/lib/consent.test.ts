import { describe, it, expect, beforeEach } from 'vitest';
import {
  CONSENT_DEFAULT_DENIED,
  consentDefaultInlineScript,
} from '@/lib/consent';

// A dataLayer entry indexed positionally, the way gtag.js reads commands.
type DataLayerEntry = {
  0?: unknown;
  1?: unknown;
  2?: Record<string, unknown>;
};

describe('Consent Mode default', () => {
  it('is denied-by-default for every storage signal', () => {
    expect(CONSENT_DEFAULT_DENIED).toMatchObject({
      ad_storage: 'denied',
      ad_personalization: 'denied',
      ad_user_data: 'denied',
      analytics_storage: 'denied',
    });
  });

  describe('inline head script', () => {
    it('uses the canonical gtag bootstrap (dataLayer + arguments-forwarding shim)', () => {
      const src = consentDefaultInlineScript();
      expect(src).toContain('window.dataLayer=window.dataLayer||[]');
      expect(src).toContain('function gtag(){dataLayer.push(arguments);}');
      expect(src).toContain("gtag('consent','default'");
    });

    describe('when executed (as it would be inline in <head>)', () => {
      beforeEach(() => {
        delete (window as Window & { dataLayer?: unknown[] }).dataLayer;
      });

      it('pushes the denied default as a gtag arguments object, not a plain array', () => {
        // Execute the snippet the way an inline <script> tag does: in global,
        // non-strict scope (so `window.dataLayer` and the bare `dataLayer`
        // reference inside the gtag shim resolve to the same global).
        new Function(consentDefaultInlineScript())();

        const dataLayer = (window as Window & { dataLayer?: DataLayerEntry[] })
          .dataLayer;
        expect(dataLayer).toHaveLength(1);

        const def = dataLayer?.[0];
        // The PR #220 regression: gtag.js ignores plain-array entries. The
        // canonical shim must forward a real `arguments` object.
        expect(Array.isArray(def)).toBe(false);
        expect(Object.prototype.toString.call(def)).toBe('[object Arguments]');
        expect(def?.[0]).toBe('consent');
        expect(def?.[1]).toBe('default');
        expect(def?.[2]?.analytics_storage).toBe('denied');
        expect(def?.[2]?.ad_storage).toBe('denied');
        expect(def?.[2]?.ad_user_data).toBe('denied');
        expect(def?.[2]?.ad_personalization).toBe('denied');
      });
    });
  });
});
