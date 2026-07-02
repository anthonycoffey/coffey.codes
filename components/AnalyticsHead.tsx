import ConsentDefaultScript from './ConsentDefaultScript';

// Analytics/consent <head> fragment. ORDER MATTERS and is the whole point of
// this component: the Consent Mode denied default must be in `window.dataLayer`
// before anything touches GTM, so the inline consent-default script is emitted
// FIRST, ahead of the GTM preconnect hint. The GTM container itself loads later
// still — client-side, on idle, via GoogleAnalyticsLazy in <body>, which is
// strictly after this <head> content in document order.
//
// See docs/specs/adrs/ADR-006-consent-default-before-gtm.md.
export default function AnalyticsHead() {
  return (
    <>
      <ConsentDefaultScript />
      <link rel="preconnect" href="https://www.googletagmanager.com" />
    </>
  );
}
