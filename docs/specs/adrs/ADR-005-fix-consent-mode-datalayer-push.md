---
id: ADR-005
title: 'Forward Consent Mode commands as gtag arguments objects, not plain arrays'
status: accepted
date: 2026-06-20
deciders: [coffey]
supersedes: ''
superseded_by: ''
---

# ADR-005: Forward Consent Mode commands as gtag arguments objects, not plain arrays

## Status

`accepted`

## Context

GA4 stopped showing data in standard reports. The GA4 admin/data-stream panel
reported "No data received from your website yet" for Measurement ID
`G-MV8YG7QQW0`, despite traffic to the site. The obvious assumption — a broken
or missing tag — was wrong.

A live diagnosis of production (`coffey.codes` loaded in a headless Chrome with
the network and JS runtime inspected) established the following facts:

1. **The tag fires.** `GTM-KJC6Q389` loads, injects the GA4 config for
   `G-MV8YG7QQW0`, and a `page_view` `POST`s to
   `google-analytics.com/g/collect` returning `204`. The site is tagged
   correctly and Google accepts the hits.
2. **Every hit is consent-denied.** The collect request carried `gcs=G100`
   (`ad_storage` denied, `analytics_storage` denied) and no `_ga` cookie was
   ever set — even after clicking "Accept" on the consent banner.
3. **The grant never reached GA.** Inspecting `window.google_tag_data.ics`
   after accepting showed the consent entries unresolved (no `update` applied),
   and `document.cookie` contained no `_ga*` cookies.

The root cause was in [`components/ConsentManager.tsx`](../../../components/ConsentManager.tsx).
Its `gtag` helper pushed consent commands as **plain arrays**:

```ts
window.dataLayer?.push([command, type, settings]); // ❌ silently ignored
```

`gtag.js` only treats a `dataLayer` entry as a Consent Mode command when the
entry is the `arguments` object produced by the canonical
`function gtag(){ dataLayer.push(arguments); }` shim. A plain array is parsed as
an ordinary legacy `dataLayer` event and **never processed as a consent
command**. This was confirmed empirically in the same live session: replaying
the identical grant as an `arguments` object immediately resolved the consent
state (`analytics_storage: { update: true }`) and set the `_ga` /
`_ga_MV8YG7QQW0` cookies.

Because the GTM container defaults consent to denied (correct, privacy-first),
and the only path to `granted` was the broken array push, **100% of traffic —
including users who accept — was stuck as consent-denied, cookieless pings.**
The site sits under GA4's behavioral-modeling threshold (~1,000 users/day; see
[`docs/strategy/ga4-events.md`](../../strategy/ga4-events.md)), so denied
cookieless pings are not modeled into standard reports, which read as empty.

The regression lines up with the timeline: Consent Mode default-denied was
affirmed ~2026-05-10, which is when the reportable data disappeared. Prior to
that there was no consent gate, so all traffic was counted.

## Decision

Forward all Consent Mode commands as real gtag `arguments` objects instead of
plain arrays.

`ConsentManager` now builds the command via a small typed shim that returns its
own `arguments` object, and pushes that onto `window.dataLayer`:

```ts
const toGtagCommand = function (): IArguments {
  // eslint-disable-next-line prefer-rest-params
  return arguments;
} as (command: 'consent', type: ConsentMode, settings: ConsentSettings) => IArguments;

// ...
window.dataLayer = window.dataLayer || [];
window.dataLayer.push(toGtagCommand(command, type, settings));
```

This applies to both the `consent default` (denied) on mount and the
`consent update` (granted/denied) on the user's banner choice.

A regression test —
[`__tests__/components/ConsentManager.test.tsx`](../../../__tests__/components/ConsentManager.test.tsx)
— asserts that every pushed consent command is `[object Arguments]` and not an
`Array`, so the array-push form cannot silently return.

## Consequences

### Positive

- Accepting the consent banner now actually grants `analytics_storage`; GA sets
  its identity cookies and reports real, attributable sessions again.
- Consent Mode behaves as designed: denied by default, granted on explicit
  opt-in — the privacy posture is preserved, the data plumbing is fixed.
- The regression test pins the `arguments`-object contract for future edits.

### Negative / Trade-offs

- The shim relies on the `arguments` object and a type cast, which is less
  idiomatic than a plain function call and requires a one-line
  `eslint-disable prefer-rest-params`. This is inherent to how `gtag.js`
  identifies commands and is documented inline.
- Data only resumes accumulating from the deploy forward; the ~6-week gap of
  denied-only traffic is not recoverable in GA4 reporting.

### Neutral

- No change to the GTM container, the GA4 property, or the consent UI/UX. The
  fix is purely in how the command is serialized onto the `dataLayer`.
- The GTM-side denied default (source of `gcs=G100`) is unchanged and remains
  the correct privacy-first baseline.

## Alternatives Considered

### Option A: Set `analytics_storage` to granted by default in GTM

- **Description:** Flip the container's consent default so analytics is on
  unless the user opts out.
- **Pros:** Data would flow without depending on the banner push working.
- **Cons:** Abandons the privacy-first, opt-in posture affirmed for the Google
  EU User Consent Policy attestation; collects analytics from non-consenting
  EU users.
- **Why rejected:** Compliance regression masquerading as a fix. The bug was a
  serialization mistake, not a policy choice.

### Option B: Replace the bespoke helper with the official global gtag snippet

- **Description:** Inline the canonical `window.gtag = function(){dataLayer.push(arguments)}`
  snippet in the document head and call `window.gtag(...)` everywhere.
- **Pros:** Maximally idiomatic; matches Google's copy-paste reference exactly.
- **Cons:** Introduces a global, requires careful ordering against the lazily
  loaded GTM component, and is a larger change than the defect warrants.
- **Why rejected:** Deferred. The localized shim fixes the defect with the
  smallest surface area. A future hardening pass (guaranteeing the consent
  `default` runs before GTM loads) can revisit a global snippet — tracked as a
  follow-up, not a blocker.

## Notes

- Modifies [`components/ConsentManager.tsx`](../../../components/ConsentManager.tsx);
  adds [`__tests__/components/ConsentManager.test.tsx`](../../../__tests__/components/ConsentManager.test.tsx).
- Related: [`docs/strategy/ga4-events.md`](../../strategy/ga4-events.md)
  (consent-mode setup, modeling threshold), and the GA4 setup section there
  referencing [`components/GoogleAnalyticsClient.tsx`](../../../components/GoogleAnalyticsClient.tsx)
  (`GTM-KJC6Q389`).
- Follow-up (not in scope here): guarantee the `consent default` is in the
  `dataLayer` before GTM initializes — today `ConsentManager` and
  `GoogleAnalyticsLazy` are independent lazy components with no ordering
  guarantee; the container-level denied default currently covers the gap.
  **Resolved by [ADR-006](ADR-006-consent-default-before-gtm.md):** the denied
  default is now emitted as an inline `<script>` at the top of `<head>` (Option
  B above, adopted), so it lands in `dataLayer` before GTM loads.
