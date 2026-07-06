import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  CONSENT_DEFAULT_DENIED,
  CONSENT_DEFAULT_GLOBAL,
  OPT_IN_REGIONS,
  consentDefaultInlineScript,
} from '@/lib/consent';

// A dataLayer entry indexed positionally, the way gtag.js reads commands.
type DataLayerEntry = {
  0?: unknown;
  1?: unknown;
  2?: Record<string, unknown>;
};

const run = () => {
  // Execute the snippet the way an inline <script> tag does: in global,
  // non-strict scope (so `window.dataLayer` and the bare `dataLayer` reference
  // inside the gtag shim resolve to the same global).
  new Function(consentDefaultInlineScript())();
  return (window as Window & { dataLayer?: DataLayerEntry[] }).dataLayer ?? [];
};

describe('Consent Mode defaults', () => {
  it('grants analytics but denies ads in the global (non-region) default', () => {
    expect(CONSENT_DEFAULT_GLOBAL).toMatchObject({
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_personalization: 'denied',
      ad_user_data: 'denied',
    });
  });

  it('denies every storage signal in the opt-in-region default', () => {
    expect(CONSENT_DEFAULT_DENIED).toMatchObject({
      ad_storage: 'denied',
      ad_personalization: 'denied',
      ad_user_data: 'denied',
      analytics_storage: 'denied',
    });
  });

  it('covers the EEA + UK + Switzerland in the opt-in region list', () => {
    // Spot-check the compliance boundary rather than the whole list.
    for (const cc of ['DE', 'FR', 'IT', 'ES', 'IE', 'NO', 'IS', 'LI', 'GB', 'CH']) {
      expect(OPT_IN_REGIONS).toContain(cc);
    }
    // The US must NOT be opt-in (opt-out regime): it gets the granted default.
    expect(OPT_IN_REGIONS).not.toContain('US');
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
        window.localStorage.clear();
      });
      afterEach(() => {
        window.localStorage.clear();
      });

      it('pushes both defaults as gtag arguments objects, not plain arrays', () => {
        const dataLayer = run();
        const defaults = dataLayer.filter(
          (e) => e && e[0] === 'consent' && e[1] === 'default',
        );
        expect(defaults).toHaveLength(2);
        for (const def of defaults) {
          // The PR #220 regression: gtag.js ignores plain-array entries. The
          // canonical shim must forward a real `arguments` object.
          expect(Array.isArray(def)).toBe(false);
          expect(Object.prototype.toString.call(def)).toBe('[object Arguments]');
        }
      });

      it('emits a global default that grants analytics and denies ads', () => {
        const global = run()
          .filter((e) => e[0] === 'consent' && e[1] === 'default')
          .find((e) => !e[2]?.region);
        expect(global).toBeDefined();
        expect(global?.[2]?.analytics_storage).toBe('granted');
        expect(global?.[2]?.ad_storage).toBe('denied');
      });

      it('emits a region-scoped default that denies analytics in opt-in regions', () => {
        const region = run()
          .filter((e) => e[0] === 'consent' && e[1] === 'default')
          .find((e) => e[2]?.region);
        expect(region).toBeDefined();
        expect(region?.[2]?.analytics_storage).toBe('denied');
        expect(region?.[2]?.region).toContain('DE');
        expect(region?.[2]?.region).toContain('GB');
        expect(region?.[2]?.region).toContain('CH');
      });

      it('does not re-assert consent on a first visit (no stored choice)', () => {
        const update = run().find(
          (e) => e[0] === 'consent' && e[1] === 'update',
        );
        expect(update).toBeUndefined();
      });

      it('re-asserts a granted update synchronously for a returning visitor who accepted', () => {
        window.localStorage.setItem('google-consent', 'accepted');
        const update = run().find(
          (e) => e[0] === 'consent' && e[1] === 'update',
        );
        expect(update).toBeDefined();
        expect(Object.prototype.toString.call(update)).toBe('[object Arguments]');
        expect(update?.[2]?.analytics_storage).toBe('granted');
        expect(update?.[2]?.ad_storage).toBe('granted');
      });

      it('re-asserts a denied update synchronously for a returning visitor who rejected', () => {
        window.localStorage.setItem('google-consent', 'rejected');
        const update = run().find(
          (e) => e[0] === 'consent' && e[1] === 'update',
        );
        expect(update).toBeDefined();
        expect(update?.[2]?.analytics_storage).toBe('denied');
      });
    });
  });
});
