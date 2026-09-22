// Single source of truth for the Consent Mode v2 defaults.
//
// Posture (see ADR-007): analytics is granted by default OUTSIDE the opt-in
// regions (US opt-out regime, Canada, most of the world — first-party analytics
// is lawful there without prior opt-in), and denied by default INSIDE the opt-in
// regions (EEA + UK + Switzerland), where GDPR / ePrivacy / UK GDPR / Swiss FADP
// require explicit prior consent. Advertising signals stay denied everywhere
// until an explicit banner grant.
//
// The defaults are emitted inline and synchronously in the document <head>
// (see `components/ConsentDefaultScript.tsx`) so they land in `window.dataLayer`
// BEFORE the lazily-loaded GTM container initializes — GA4 applies the correct
// per-region default to the very first hit. The same inline script also
// re-asserts a returning visitor's stored choice synchronously, before GTM, so
// their first hit carries their real consent instead of racing the idle-loaded
// container and the homepage loader.
//
// See docs/specs/adrs/ADR-005..007.

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

export interface ConsentUpdateSettings {
  ad_storage: ConsentStatus;
  ad_personalization: ConsentStatus;
  ad_user_data: ConsentStatus;
  analytics_storage: ConsentStatus;
}

// Jurisdictions that require prior opt-in for analytics storage. ISO 3166-1
// alpha-2. EEA (EU 27 + Iceland/Liechtenstein/Norway) plus the UK and
// Switzerland. Keep current if the regulatory map changes; this list is the
// compliance boundary for the denied-by-default override below.
export const OPT_IN_REGIONS = [
  // EU 27
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
  'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK',
  'SI', 'ES', 'SE',
  // EEA non-EU
  'IS', 'LI', 'NO',
  // UK + Switzerland
  'GB', 'CH',
] as const;

// Global default (no region): analytics granted, advertising denied. Applies to
// every visitor not matched by the region-scoped override below.
export const CONSENT_DEFAULT_GLOBAL: ConsentDefaultSettings = {
  ad_storage: 'denied',
  ad_personalization: 'denied',
  ad_user_data: 'denied',
  analytics_storage: 'granted',
  wait_for_update: 3000,
};

// Opt-in-region default: everything denied until an explicit banner grant.
// Emitted with `region: OPT_IN_REGIONS` so it overrides the global default only
// inside the EEA/UK/CH.
export const CONSENT_DEFAULT_DENIED: ConsentDefaultSettings = {
  ad_storage: 'denied',
  ad_personalization: 'denied',
  ad_user_data: 'denied',
  analytics_storage: 'denied',
  wait_for_update: 3000,
};

// Explicit banner choices (no `wait_for_update` — these are `update` commands,
// not defaults). Shared with `components/ConsentManager.tsx`.
export const CONSENT_UPDATE_GRANTED: ConsentUpdateSettings = {
  ad_storage: 'granted',
  ad_personalization: 'granted',
  ad_user_data: 'granted',
  analytics_storage: 'granted',
};

export const CONSENT_UPDATE_DENIED: ConsentUpdateSettings = {
  ad_storage: 'denied',
  ad_personalization: 'denied',
  ad_user_data: 'denied',
  analytics_storage: 'denied',
};

// localStorage key the banner persists the visitor's choice under.
export const CONSENT_STORAGE_KEY = 'google-consent';

// The canonical gtag bootstrap plus the geo-scoped defaults and a synchronous
// re-assertion of any stored banner choice, as a single inline snippet. This is
// Google's documented Consent Mode pattern: create `dataLayer`, define the
// `gtag` shim that forwards its `arguments` object, then push the defaults.
// Emitting this synchronously at the top of <head> means it is the first consent
// command in `dataLayer`, before GTM loads — no ordering race with the in-app
// banner or the homepage loader.
export function consentDefaultInlineScript(): string {
  const regionDenied = { ...CONSENT_DEFAULT_DENIED, region: OPT_IN_REGIONS };
  return [
    'window.dataLayer=window.dataLayer||[];',
    'function gtag(){dataLayer.push(arguments);}',
    // Global default: analytics granted, ads denied.
    `gtag('consent','default',${JSON.stringify(CONSENT_DEFAULT_GLOBAL)});`,
    // Opt-in regions (EEA/UK/CH): deny everything until the banner grants.
    `gtag('consent','default',${JSON.stringify(regionDenied)});`,
    // Re-assert a stored banner choice synchronously, before GTM loads, so a
    // returning visitor's first hit carries their real consent — independent of
    // the idle-loaded container and the homepage loader (ADR-007).
    'try{',
    `var c=localStorage.getItem(${JSON.stringify(CONSENT_STORAGE_KEY)});`,
    `if(c==='accepted'){gtag('consent','update',${JSON.stringify(CONSENT_UPDATE_GRANTED)});}`,
    `else if(c==='rejected'){gtag('consent','update',${JSON.stringify(CONSENT_UPDATE_DENIED)});}`,
    '}catch(e){}',
  ].join('');
}
