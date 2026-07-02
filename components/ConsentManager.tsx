'use client';
import React, { useState, useEffect } from 'react';

// Add type definitions for gtag
type ConsentMode = 'default' | 'update';
type ConsentStatus = 'granted' | 'denied';

interface ConsentSettings {
  ad_storage: ConsentStatus;
  ad_personalization: ConsentStatus;
  ad_user_data: ConsentStatus;
  analytics_storage: ConsentStatus;
  wait_for_update?: number;
}

// gtag.js only treats a dataLayer entry as a Consent Mode command when it is the
// `arguments` object produced by the canonical `gtag()` shim. A plain array
// (e.g. `['consent', 'update', {…}]`) is silently ignored, so the grant never
// reaches GA and `analytics_storage` stays denied for every visitor — including
// those who click "Accept". Forward a real arguments object instead.
// See docs/specs/adrs/ADR-005-fix-consent-mode-datalayer-push.md
const toGtagCommand = function (): IArguments {
  // eslint-disable-next-line prefer-rest-params
  return arguments;
} as (
  command: 'consent',
  type: ConsentMode,
  settings: ConsentSettings,
) => IArguments;

const GRANTED: ConsentSettings = {
  ad_storage: 'granted',
  ad_personalization: 'granted',
  ad_user_data: 'granted',
  analytics_storage: 'granted',
};

const DENIED: ConsentSettings = {
  ad_storage: 'denied',
  ad_personalization: 'denied',
  ad_user_data: 'denied',
  analytics_storage: 'denied',
};

const ConsentManager = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);

  useEffect(() => {
    try {
      const existingConsent = localStorage.getItem('google-consent');

      // The denied `consent default` is no longer pushed here. It is emitted
      // synchronously inline in the document <head> (ConsentDefaultScript) so it
      // is provably in dataLayer before GTM initializes — this component used to
      // race the GTM load and could lose. We only ensure dataLayer exists (for
      // the `update` push below) and decide whether to surface the banner.
      // See docs/specs/adrs/ADR-006-consent-default-before-gtm.md.
      window.dataLayer = window.dataLayer || [];

      // Re-apply a previously stored choice on every load. Consent state lives
      // in the dataLayer per page load and is NOT restored from the GA cookie,
      // so returning/refreshing visitors who already opted in must have their
      // grant re-asserted — otherwise every repeat hit is sent consent-denied.
      // (The denied `consent default` itself is emitted inline in <head>; see
      // the comment above and ADR-006.)
      if (existingConsent === 'accepted') {
        gtag('consent', 'update', GRANTED);
      } else if (existingConsent === 'rejected') {
        gtag('consent', 'update', DENIED);
      } else {
        // No prior choice — surface the banner.
        setIsVisible(true);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  const gtag = (
    command: 'consent',
    type: ConsentMode,
    settings: ConsentSettings,
  ) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(toGtagCommand(command, type, settings));
  };

  const handleAcceptConsent = () => {
    try {
      // Update consent state using gtag
      gtag('consent', 'update', GRANTED);

      // Store consent preference
      localStorage.setItem('google-consent', 'accepted');

      setHasConsented(true);
      setIsVisible(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRejectConsent = () => {
    try {
      // Update consent state using gtag
      gtag('consent', 'update', DENIED);

      // Store consent preference
      localStorage.setItem('google-consent', 'rejected');

      setHasConsented(false);
      setIsVisible(false);
    } catch (error) {
      console.error(error);
    }
  };

  // Don't render if already consented or not visible
  if (hasConsented || !isVisible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border
      animate-slide-up transform transition-all duration-500 ease-in-out"
    >
      <div className="mx-auto max-w-5xl px-4 py-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:flex-nowrap">
        <p className="flex-1 min-w-0 text-xs sm:text-sm text-c-muted text-center sm:text-left leading-tight">
          We use cookies to analyze site usage and improve your experience.
        </p>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={handleRejectConsent}
            className="px-3 py-1 rounded-md text-xs sm:text-sm text-c-muted
            hover:text-c-heading transition-colors duration-200"
          >
            Reject
          </button>

          <button
            onClick={handleAcceptConsent}
            className="px-3 py-1 rounded-md text-xs sm:text-sm font-medium
            bg-accent1-dark text-surface hover:opacity-90 transition-opacity duration-200"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsentManager;
