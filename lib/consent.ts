// Single source of truth for the Consent Mode v2 denied default.
//
// This default is privacy-first: every storage signal starts `denied` and is
// only ever flipped to `granted` by an explicit opt-in through the consent
// banner (see `components/ConsentManager.tsx`). It is emitted inline and
// synchronously in the document <head> (see `components/ConsentDefaultScript.tsx`)
// so it lands in `window.dataLayer` BEFORE the lazily-loaded GTM container
// initializes — guaranteeing GA4 applies the denied default to the very first
// hit instead of racing the in-app push.
//
// See docs/specs/adrs/ADR-006-consent-default-before-gtm.md.

export type ConsentStatus = 'granted' | 'denied';

export interface ConsentDefaultSettings {
  ad_storage: ConsentStatus;
  ad_personalization: ConsentStatus;
  ad_user_data: ConsentStatus;
  analytics_storage: ConsentStatus;
  // How long (ms) gtag waits for a `consent update` before acting on the
  // default, so the banner's grant can resolve the first hit.
  wait_for_update: number;
}

export const CONSENT_DEFAULT_DENIED: ConsentDefaultSettings = {
  ad_storage: 'denied',
  ad_personalization: 'denied',
  ad_user_data: 'denied',
  analytics_storage: 'denied',
  wait_for_update: 3000,
};

// The canonical gtag bootstrap plus the denied default, as a single inline
// snippet. This is Google's documented Consent Mode pattern verbatim: create
// `dataLayer`, define the `gtag` shim that forwards its `arguments` object, then
// push `consent default`. Emitting this synchronously at the top of <head> means
// the denied default is the first consent command in `dataLayer`, before GTM
// loads — no ordering race with the in-app banner.
export function consentDefaultInlineScript(): string {
  return [
    'window.dataLayer=window.dataLayer||[];',
    'function gtag(){dataLayer.push(arguments);}',
    `gtag('consent','default',${JSON.stringify(CONSENT_DEFAULT_DENIED)});`,
  ].join('');
}
