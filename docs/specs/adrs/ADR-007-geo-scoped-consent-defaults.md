---
id: ADR-007
title: 'Geo-scope the Consent Mode default (analytics granted outside opt-in regions) and re-assert stored consent inline'
status: accepted
date: 2026-07-05
deciders: [coffey]
supersedes: ''
superseded_by: ''
---

# ADR-007: Geo-scope the Consent Mode default and re-assert stored consent inline

## Status

`accepted`

## Context

[ADR-005](ADR-005-fix-consent-mode-datalayer-push.md) and
[ADR-006](ADR-006-consent-default-before-gtm.md) restored GA4 by fixing the
consent-grant serialization and emitting the denied default inline in `<head>`
before GTM. A live production audit on 2026-07-05 confirmed the grant now works,
but exposed two remaining issues:

1. **Over-restrictive default.** The inline default denies `analytics_storage`
   for *every* visitor, worldwide. Prior opt-in for first-party analytics is only
   legally required in the EEA, UK, and Switzerland (GDPR / ePrivacy / UK GDPR /
   Swiss FADP). The US operates an opt-out regime (including California's CPRA);
   Canada and most other jurisdictions do not mandate prior opt-in for analytics.
   A globally-denied default therefore discards a large volume of analytics we are
   permitted to collect — the site sits under GA4's ~1,000-users/day modeling
   threshold, so denied cookieless pings never appear in standard reports and the
   loss is total, not modeled.

2. **Returning-visitor re-assert race.** The stored-choice re-assertion (a
   returning visitor who previously accepted must be re-granted each load, since
   consent lives in the per-load `dataLayer`, not the GA cookie) lived in
   `ConsentManager`'s effect. `ConsentManager` mounts via `ConsentManagerLazy` —
   deferred to `requestIdleCallback` and, on the homepage, gated behind the
   three.js loader's `LOADER_DISMISSED_EVENT`. GTM loads independently on idle and
   fires the first `page_view`. Reproduced live: a returning consented visitor's
   first hit went out `gcs=G100` (denied) with a random `cid` that did not match
   the `_ga` cookie. On the homepage, a visitor who never clicks "enter" is
   recorded denied for the entire session.

## Decision

Two changes, both in the single source of truth
[`lib/consent.ts`](../../../lib/consent.ts) and its inline `<head>` script
([`components/ConsentDefaultScript.tsx`](../../../components/ConsentDefaultScript.tsx)):

1. **Geo-scoped defaults.** Emit two `consent default` commands: a global default
   with `analytics_storage: 'granted'` (and all `ad_*` still `denied`), and a
   region-scoped default with everything `denied` for `OPT_IN_REGIONS` (the 30
   EEA countries + `GB` + `CH`). Consent Mode applies the most specific matching
   default, so opt-in regions stay privacy-first while the rest of the world is
   counted from the first hit. Ads consent is unchanged (denied everywhere until
   explicit grant).

2. **Inline stored-consent re-assert.** Immediately after the defaults, the inline
   script reads `localStorage['google-consent']` synchronously and, if a choice is
   stored, pushes the matching `consent update` (granted/denied) — before GTM
   loads. This removes the race: the re-assertion no longer depends on
   `ConsentManager` mounting (idle- and loader-gated).
   [`ConsentManager`](../../../components/ConsentManager.tsx) keeps only the live
   Accept/Reject click handlers and the first-visit banner decision.

All commands remain gtag `arguments` objects (ADR-005 contract). Tests pin: the
two geo defaults and their storage values, the inline stored-choice re-assert
branches, and that `ConsentManager` no longer re-pushes consent on mount.

## Consequences

### Positive

- Analytics is collected from the majority of traffic (US + rest-of-world) that
  does not require prior opt-in, recovering reportable data lawfully.
- Returning consented visitors are granted before the first hit on every page,
  including the homepage behind the loader — the race is gone by construction.
- The privacy-first posture is preserved exactly where the law requires it.

### Negative / Trade-offs

- The inline `<head>` script grows (two defaults + a small `localStorage` read).
  Still a few hundred bytes, still parse-time. Acceptable for Consent Mode.
- The default posture is now a compliance-sensitive constant. The `OPT_IN_REGIONS`
  list must be kept current if jurisdictions change; it is centralized and
  commented for that reason.
- Reverses the 2026-05-10 global "deny everywhere" attestation to a geo-scoped
  one. This is a deliberate, signed-off policy change (2026-07-05), not drift.

### Neutral

- No change to the GTM container, the GA4 property, the banner UI/UX, or ad
  consent. Only the *default* consent state (by region) and *where* the stored
  re-assert runs changed.

## Alternatives Considered

### Option A: Server-side geo detection via Vercel `request.geo`

- **Description:** Read the visitor's country at the edge (middleware) and emit a
  single tailored default.
- **Pros:** One default command; no client region list.
- **Cons:** Couples consent to edge runtime + response caching (a cached HTML
  document would carry the wrong region's default); adds geo handling where none
  existed. Consent Mode's `region:` scoping already does this correctly, cache-safe
  and PII-free.
- **Why rejected:** More moving parts for no benefit over built-in region scoping.

### Option B: Keep global deny-by-default

- **Description:** Do nothing; stay strictest-everywhere.
- **Pros:** Zero change; simplest compliance story.
- **Cons:** Discards lawfully-collectible analytics from most of the audience;
  reports stay near-empty because the site is under the modeling threshold.
- **Why rejected:** The maintainer explicitly chose to maximize data within
  compliance (SPEC-034).

### Option C: Fix the race by de-lazying `ConsentManager`

- **Description:** Mount `ConsentManager` eagerly so its re-assert wins the race.
- **Pros:** Keeps consent logic in one component.
- **Cons:** Re-couples the banner UI to critical-path timing, re-introduces the
  homepage-loader ordering concern, and is still a post-hydration effect (later
  than a parse-time inline script).
- **Why rejected:** The inline re-assert is provably-first and decouples the
  banner's render timing from the consent signal.

## Notes

- Implements [SPEC-034](../active/SPEC-034-harden-ga4-tracking.md).
- Builds on [ADR-005](ADR-005-fix-consent-mode-datalayer-push.md) and
  [ADR-006](ADR-006-consent-default-before-gtm.md).
- Modifies [`lib/consent.ts`](../../../lib/consent.ts),
  [`components/ConsentManager.tsx`](../../../components/ConsentManager.tsx);
  updates [`docs/strategy/ga4-events.md`](../../strategy/ga4-events.md).
- Adds guardrails: `e2e/analytics-consent.spec.ts` and the
  `monitor-ga4` scheduled workflow.
