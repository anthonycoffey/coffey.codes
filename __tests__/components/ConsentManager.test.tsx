import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@heroicons/react/20/solid', () => ({
  XMarkIcon: () => <span data-testid="icon-x" />,
  CheckIcon: () => <span data-testid="icon-check" />,
}));

import ConsentManager from '@/components/ConsentManager';

// A dataLayer entry indexed positionally, the way gtag.js reads commands.
type DataLayerEntry = {
  0?: unknown;
  1?: unknown;
  2?: Record<string, unknown>;
};

const dataLayer = () =>
  ((window as Window & { dataLayer?: unknown[] }).dataLayer ??
    []) as DataLayerEntry[];

const consentCommands = () =>
  dataLayer().filter((entry) => entry && entry[0] === 'consent');

const findByType = (type: string) =>
  consentCommands().find((entry) => entry[1] === type);

describe('<ConsentManager /> consent-mode wiring', () => {
  beforeEach(() => {
    window.localStorage.clear();
    (window as Window & { dataLayer?: unknown[] }).dataLayer = [];
  });

  // The denied `consent default` is now emitted inline in the document <head>
  // (ConsentDefaultScript), before GTM loads, instead of from this component's
  // effect — which used to race the GTM load. ConsentManager must therefore NOT
  // push a second default; doing so would re-assert the default after GTM has
  // initialized. The default's arguments-shape + denied contract is guarded in
  // __tests__/lib/consent.test.ts. See ADR-006.
  it('does not push a consent default — that now lives in the inline head script', () => {
    render(<ConsentManager />);

    expect(findByType('default')).toBeUndefined();
  });

  it('grants analytics + ad storage as an arguments-shaped update when accepted', () => {
    render(<ConsentManager />);
    fireEvent.click(screen.getByRole('button', { name: /accept/i }));

    const update = findByType('update');
    expect(update).toBeDefined();
    expect(Array.isArray(update)).toBe(false); // regression guard for the bug
    expect(Object.prototype.toString.call(update)).toBe('[object Arguments]');
    expect(update?.[2]).toMatchObject({
      analytics_storage: 'granted',
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
    });
  });

  it('keeps storage denied as an arguments-shaped update when rejected', () => {
    render(<ConsentManager />);
    fireEvent.click(screen.getByRole('button', { name: /reject/i }));

    const update = findByType('update');
    expect(update).toBeDefined();
    expect(Array.isArray(update)).toBe(false);
    expect(update?.[2]?.analytics_storage).toBe('denied');
  });

  it('persists the consent choice so the banner does not reappear', () => {
    render(<ConsentManager />);
    fireEvent.click(screen.getByRole('button', { name: /accept/i }));
    expect(window.localStorage.getItem('google-consent')).toBe('accepted');
  });

  // Consent state is re-established per page load from the dataLayer, not from
  // the GA cookie. Returning visitors who already accepted must have their grant
  // re-asserted on mount, or every repeat hit goes out consent-denied.
  it('re-asserts a granted update on mount for a returning visitor who accepted', () => {
    window.localStorage.setItem('google-consent', 'accepted');
    render(<ConsentManager />);

    const update = findByType('update');
    expect(update).toBeDefined();
    expect(Array.isArray(update)).toBe(false);
    expect(update?.[2]?.analytics_storage).toBe('granted');
    // and the banner stays hidden for a returning visitor
    expect(
      screen.queryByRole('button', { name: /accept/i }),
    ).not.toBeInTheDocument();
  });

  it('re-asserts a denied update on mount for a returning visitor who rejected', () => {
    window.localStorage.setItem('google-consent', 'rejected');
    render(<ConsentManager />);

    const update = findByType('update');
    expect(update).toBeDefined();
    expect(update?.[2]?.analytics_storage).toBe('denied');
    expect(
      screen.queryByRole('button', { name: /accept/i }),
    ).not.toBeInTheDocument();
  });

  it('does not push any consent command on a first visit (no stored choice)', () => {
    render(<ConsentManager />);
    // No update (no stored choice) and no default (that now lives in the inline
    // head script, not this component — see ADR-006).
    expect(findByType('update')).toBeUndefined();
    expect(findByType('default')).toBeUndefined();
    // first-time visitor sees the banner
    expect(
      screen.getByRole('button', { name: /accept/i }),
    ).toBeInTheDocument();
  });
});
