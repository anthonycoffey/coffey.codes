'use client';
import { useCallback, useState } from 'react';

// The Google Cloud Function endpoint, proxied via the `/functions/*` rewrite in
// next.config.js to https://us-central1-coffeywebdev-d0487.cloudfunctions.net/*.
// Shared by ContactForm and LeadForm so there is a single submit path.
const SUBMIT_ENDPOINT = '/functions/sendContactFormEmail';

export type LeadFormSubmitStatus = 'idle' | 'submitting' | 'sent' | 'error';

export interface UseLeadFormSubmit {
  /** POST the payload to the backend. Resolves true on a 2xx response, false otherwise. */
  submit: (payload: Record<string, unknown>) => Promise<boolean>;
  status: LeadFormSubmitStatus;
  /** True once a submission has succeeded. */
  isSent: boolean;
  /** Human-readable error from the last failed submission, or null. */
  error: string | null;
}

/**
 * Encapsulates the lead/contact form submit behavior: the POST to the Google
 * Cloud Function, success/error state, and the GA4 `form_submit` dataLayer push.
 * `formName` identifies the surface that produced the lead (e.g. `contact`,
 * `lp_practical_ai`) and flows into the dataLayer event for per-page attribution
 * (see docs/strategy/ga4-events.md).
 */
export function useLeadFormSubmit(formName: string): UseLeadFormSubmit {
  const [status, setStatus] = useState<LeadFormSubmitStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (payload: Record<string, unknown>): Promise<boolean> => {
      setError(null);
      setStatus('submitting');
      try {
        const response = await fetch(SUBMIT_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          setStatus('sent');
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: 'form_submit',
            formName,
          });
          return true;
        }

        const errorData = await response.json().catch(() => ({}));
        setError(
          errorData.message ||
            `An error occurred: ${response.statusText} (${response.status})`,
        );
        setStatus('error');
        return false;
      } catch {
        setError(
          'An error occurred while sending your message, please try again.',
        );
        setStatus('error');
        return false;
      }
    },
    [formName],
  );

  return { submit, status, isSent: status === 'sent', error };
}
