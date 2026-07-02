import { consentDefaultInlineScript } from '@/lib/consent';

// Server component that emits the canonical Consent Mode denied default inline
// in the document <head>. Because it renders into the server HTML and runs
// synchronously during parse — before the GTM container is injected client-side
// by GoogleAnalyticsLazy on idle — the denied default is provably in
// `window.dataLayer` before gtag/GTM initializes.
//
// See docs/specs/adrs/ADR-006-consent-default-before-gtm.md.
export default function ConsentDefaultScript() {
  return (
    <script
      id="consent-default"
      dangerouslySetInnerHTML={{ __html: consentDefaultInlineScript() }}
    />
  );
}
