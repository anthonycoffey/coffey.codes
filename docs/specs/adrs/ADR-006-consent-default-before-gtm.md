---
id: ADR-006
title: 'Emit the Consent Mode denied default inline in <head>, before GTM'
status: accepted
date: 2026-06-20
deciders: [coffey]
supersedes: ''
superseded_by: ''
---

# ADR-006: Emit the Consent Mode denied default inline in `<head>`, before GTM

## Status

`accepted`

## Context

[ADR-005](ADR-005-fix-consent-mode-datalayer-push.md) fixed the consent grant by
forwarding consent commands as `arguments` objects, and closed with an explicit
follow-up:

> guarantee the `consent default` is in the `dataLayer` before GTM initializes —
> today `ConsentManager` and `GoogleAnalyticsLazy` are independent lazy
> components with no ordering guarantee; the container-level denied default
> currently covers the gap.

Concretely, two unrelated client components decided the ordering:

- [`components/ConsentManager.tsx`](../../../components/ConsentManager.tsx) (via
  [`ConsentManagerLazy`](../../../components/ConsentManagerLazy.tsx)) pushed
  `consent default` (denied) from a `useEffect`.
- [`components/GoogleAnalyticsClient.tsx`](../../../components/GoogleAnalyticsClient.tsx)
  (via [`GoogleAnalyticsLazy`](../../../components/GoogleAnalyticsLazy.tsx))
  loads the GTM container `GTM-KJC6Q389` on `requestIdleCallback`.

Both mount lazily with no ordering relationship. Consent Mode requires the
`consent default` to be in `window.dataLayer` **before** gtag/GTM initializes so
GA4 applies the correct default to the very first hit. With the in-app push
racing the GTM load, the only thing reliably saving us was the GTM container's
own server-side denied default. The in-app default could be pushed *after* GTM
init and be a no-op — fragile, and dependent on container configuration rather
than the application asserting its own privacy posture.

## Decision

Emit the canonical Consent Mode denied default as an **inline `<script>` at the
top of the document `<head>`**, before the GTM preconnect — ADR-005's deferred
"Option B," now adopted.

- [`lib/consent.ts`](../../../lib/consent.ts) is the single source of truth for
  the denied default (`CONSENT_DEFAULT_DENIED`) and produces the inline snippet
  (`consentDefaultInlineScript()`). The snippet is Google's documented pattern
  verbatim: create `dataLayer`, define `function gtag(){dataLayer.push(arguments)}`,
  then `gtag('consent','default', {…denied…})`.
- [`components/ConsentDefaultScript.tsx`](../../../components/ConsentDefaultScript.tsx)
  renders that snippet as an inline script; it is composed with the GTM
  preconnect in [`components/AnalyticsHead.tsx`](../../../components/AnalyticsHead.tsx),
  which [`app/layout.tsx`](../../../app/layout.tsx) renders as the first content
  in `<head>`.
- Because the script is inline (no `src`/`async`/`defer`) it executes
  synchronously during HTML parse — before hydration, before the idle-deferred
  GTM container in `<body>` can load. The denied default is therefore *provably*
  the first consent command in `dataLayer`.
- [`ConsentManager`](../../../components/ConsentManager.tsx) no longer pushes the
  `consent default`; that responsibility moved to the inline script. It keeps
  only the `consent update` (granted/denied) on the user's banner choice, still
  forwarded as an `arguments` object per ADR-005. This also avoids re-asserting
  the default *after* GTM has initialized.

Tests pin both halves of the ordering guarantee:
[`__tests__/lib/consent.test.ts`](../../../__tests__/lib/consent.test.ts)
(the inline default is denied-by-default and pushes an `arguments` object, not a
plain array) and
[`__tests__/components/consent-gtm-ordering.test.tsx`](../../../__tests__/components/consent-gtm-ordering.test.tsx)
(the default is a parse-time inline script while GTM is not injected
synchronously).

## Consequences

### Positive

- The denied default is in `dataLayer` before GTM loads, independent of lazy
  mount timing — GA4 applies the correct privacy-first default to the first hit.
- The application asserts its own consent posture instead of relying solely on
  the GTM container's server-side default; the two now agree by construction.
- `consent default` is set exactly once, in the canonical place, before init —
  matching Google's reference implementation.

### Negative / Trade-offs

- Introduces a small inline script and a global `gtag`/`dataLayer` in `<head>`
  (one render-blocking parse of a few hundred bytes). This is inherent to
  Consent Mode and is the documented trade-off.
- A second, lazily-loaded path (`ConsentManager`) still owns `consent update`,
  so the consent wiring now spans the inline script (default) and the component
  (updates). The split is documented in both files and `lib/consent.ts`.

### Neutral

- No change to the GTM container, the GA4 property, the consent UI/UX, or the
  denied-by-default values. Only *where* and *when* the default is pushed
  changed.
- The GTM container's own server-side denied default remains in place as a
  redundant backstop; it is no longer the only thing preventing the race.

## Alternatives Considered

### Option A: Gate GTM on a "consent initialized" signal from ConsentManager

- **Description:** Have `GoogleAnalyticsLazy` wait for an event/flag set by
  `ConsentManager` after it pushes the default, and only then inject GTM.
- **Pros:** Keeps the default in one component; no inline script in `<head>`.
- **Cons:** Couples two independent lazy components, keeps consent wiring in
  post-hydration effects (still later than a parse-time script), and adds an
  event-coordination state machine to maintain. Strictly more moving parts than
  the canonical inline snippet, for a weaker guarantee.
- **Why rejected:** An inline head script is the standard, simplest, and
  provably-first solution; a runtime signal is more fragile and slower.

### Option B: Keep relying on the GTM container's server-side denied default

- **Description:** Do nothing in-app; trust the container's denied default to
  cover the race.
- **Pros:** Zero code change.
- **Cons:** The app does not assert its own posture; correctness depends on
  external container configuration that can drift, and the in-app default push
  remains a latent no-op race.
- **Why rejected:** This is the status quo the ADR-005 follow-up flagged as a
  gap to close.

## Notes

- Resolves the follow-up tracked in
  [ADR-005](ADR-005-fix-consent-mode-datalayer-push.md).
- Adds [`lib/consent.ts`](../../../lib/consent.ts),
  [`components/ConsentDefaultScript.tsx`](../../../components/ConsentDefaultScript.tsx),
  [`components/AnalyticsHead.tsx`](../../../components/AnalyticsHead.tsx);
  modifies [`app/layout.tsx`](../../../app/layout.tsx) and
  [`components/ConsentManager.tsx`](../../../components/ConsentManager.tsx).
- Adds [`__tests__/lib/consent.test.ts`](../../../__tests__/lib/consent.test.ts)
  and
  [`__tests__/components/consent-gtm-ordering.test.tsx`](../../../__tests__/components/consent-gtm-ordering.test.tsx).
