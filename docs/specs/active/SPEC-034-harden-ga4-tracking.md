---
id: SPEC-034
title: 'Harden GA4 tracking: geo-scoped consent defaults, fix homepage grant race, CI + synthetic guardrails'
status: ready
created: 2026-07-05
author: Anthony Coffey
reviewers: []
affected_repos: [coffey-codes]
---

## Reviewer Notes

<!-- Leave empty until code review. -->

---

# Feature: Harden GA4 tracking

## Problem

GA4 standard reports went empty from ~2026-05-17 until the ADR-005/006 fixes
deployed on 2026-06-20 (root cause: consent grant pushed as a plain array,
silently ignored by gtag.js, so 100% of traffic stayed `analytics_storage:
denied` — and this site sits under GA4's ~1,000-users/day modeling threshold, so
denied cookieless pings never surface). A live production audit on 2026-07-05
confirmed the primary bug is fixed (accepting the banner now sets `_ga` cookies
and resolves `analytics_storage` to granted) but surfaced two remaining problems:

1. **Data left on the table.** The Consent Mode default denies `analytics_storage`
   for *every* visitor globally. Prior opt-in for first-party analytics is only
   legally required in the EEA/UK/Switzerland; the US (opt-out regime) and most
   of the world are not. Denying everyone by default discards analytics we are
   allowed to collect from the majority of traffic.

2. **A residual homepage race.** The returning-visitor consent re-assertion lives
   in `ConsentManager`, which mounts via `ConsentManagerLazy` — deferred to idle
   **and**, on the homepage, gated behind the three.js loader dismissal
   (`LOADER_DISMISSED_EVENT`). Meanwhile GTM fires the first `page_view` on idle.
   Reproduced live: a returning, previously-consented visitor's first hit went out
   `gcs=G100` (denied) with a throwaway `cid` that did not match the `_ga` cookie.
   On the homepage, a visitor who never clicks "enter" is recorded denied for the
   whole session.

3. **No guardrail.** Nothing in CI would have caught the original regression (the
   unit tests are JSDOM and cannot observe a real GA hit), and nothing watches
   production for drift after deploy. Tracking is mission-critical and needs both.

## Requirements

### Must have

1. WHEN a visitor loads the site from outside the opt-in regions (EEA/UK/CH), the
   system SHALL default `analytics_storage` to `granted` so the visit is counted
   without requiring a banner interaction, while keeping all `ad_*` signals
   `denied` by default.
2. WHEN a visitor loads the site from an opt-in region (EEA/UK/CH), the system
   SHALL default every storage signal to `denied` until an explicit banner grant,
   via Consent Mode region-scoped defaults.
3. WHEN a returning visitor with a stored `accepted`/`rejected` choice loads any
   page, the system SHALL re-assert that choice synchronously in the document
   `<head>` before GTM initializes, independent of the homepage loader — so the
   first hit carries the visitor's real consent.
4. WHEN the consent contract regresses (grant not forwarded as a gtag `arguments`
   object, inline default missing/after GTM, `form_submit` not pushed), a
   Playwright e2e test SHALL fail the build.
5. WHEN production tracking drifts (no granted hit achievable, inline default
   missing, GTM/GA fails to load), a scheduled synthetic monitor SHALL post an
   alert to a Slack Incoming Webhook.

### Nice to have

- Region list centralized in one exported constant for easy audit/update.

### Non-goals (what this does NOT do)

- Does NOT change ad-storage consent (ads stay denied-by-default globally; no ads
  are running yet — see [ads-launch-pending] memory / PR #226).
- Does NOT add server-side geo detection; Consent Mode's built-in `region:`
  scoping is used (PII-free, cache-safe) instead of reading Vercel `request.geo`.
- Does NOT recover the 2026-05-17 → 06-20 data gap (unrecoverable in GA4).
- Does NOT change the GTM container or GA4 property configuration.

## Design

### Geo-scoped Consent Mode defaults (`lib/consent.ts`)

The inline `<head>` script emits **two** `consent default` commands plus a
synchronous stored-choice re-assertion:

```
gtag('consent','default', GLOBAL)                 // analytics granted, ads denied
gtag('consent','default', {…DENIED, region:[…EEA,'GB','CH']})  // strict override
try { stored = localStorage['google-consent'];
      if accepted -> gtag('consent','update', GRANTED)
      else if rejected -> gtag('consent','update', DENIED) } catch {}
```

Region-specific defaults override the global default only for matching regions,
so EEA/UK/CH stay opt-in while everyone else is counted immediately. All commands
are forwarded as gtag `arguments` objects (ADR-005 contract preserved).

### Race fix (`ConsentManager.tsx` / `ConsentDefaultScript`)

Move the returning-visitor re-assertion out of the idle/loader-gated
`ConsentManager` effect and into the inline `<head>` script (runs at parse, before
GTM). `ConsentManager` keeps only: the live Accept/Reject click handlers and the
decision to surface the banner for first-time visitors. See ADR-007.

### CI e2e guardrail (`e2e/analytics-consent.spec.ts`)

Runs against the Vercel preview deploy (existing `e2e.yml`). Intercepts
`google-analytics.com/g/collect` to assert without polluting the shared GA4
property. Asserts: two geo defaults present in `dataLayer`; GA collect fires for
`tid=G-MV8YG7QQW0`; seeding `localStorage=accepted` yields a granted first hit
(race-fix guard); clicking Accept sets `_ga` and resolves consent granted;
`form_submit` is pushed on lead-form submit.

### Synthetic monitor (`scripts/monitor-ga4.mjs` + `.github/workflows/monitor-ga4.yml`)

Scheduled Playwright check against production. Asserts the inline default is
present before GTM, GTM/GA load, a collect hit fires, and an explicit grant
resolves to granted. Posts to `SLACK_WEBHOOK_URL` (repo secret) on failure. The
Slack app/webhook is provisioned by the maintainer.

## Edge cases

- [ ] SPA route change (no reload): head script does not re-run, but consent
      persists in the same `dataLayer`, so no re-assert is needed.
- [ ] `localStorage` unavailable/throwing (private mode): re-assert wrapped in
      try/catch; falls back to region defaults.
- [ ] Opt-in-region visitor who ignores the banner: stays denied (compliant).
- [ ] Monitor run must not pollute GA4: collect interception / no real hit sent.

## Acceptance criteria

1. `npm test` green, including updated `consent.test.ts`,
   `consent-gtm-ordering.test.tsx`, `ConsentManager.test.tsx`.
2. Inline `<head>` script contains a global default with `analytics_storage:
   'granted'` and a region-scoped default (EEA/UK/CH) with `analytics_storage:
   'denied'`.
3. e2e `analytics-consent.spec.ts` passes against a preview deploy.
4. Monitor workflow present, posts to Slack on failure, documented setup.
5. `npm run typecheck` and `npm run lint` clean.

## Constraints

- Node >= 24. Playwright image tag must match `@playwright/test` version.
- Reverses the 2026-05-10 global privacy-first attestation to a geo-scoped one;
  maintainer has signed off (2026-07-05).

## Tasks

- [ ] ADR-007 for geo-scoped defaults + inline stored-consent re-assert.
- [ ] `lib/consent.ts`: `OPT_IN_REGIONS`, `CONSENT_DEFAULT_GLOBAL`, region default,
      stored-choice re-assert in `consentDefaultInlineScript()`.
- [ ] `ConsentManager.tsx`: drop the raced re-assert; banner-only responsibility.
- [ ] Update unit tests.
- [ ] `e2e/analytics-consent.spec.ts`.
- [ ] `scripts/monitor-ga4.mjs` + `monitor-ga4.yml` workflow.
- [ ] Update `docs/strategy/ga4-events.md` consent section.

## Notes

- Follows [ADR-005](../adrs/ADR-005-fix-consent-mode-datalayer-push.md),
  [ADR-006](../adrs/ADR-006-consent-default-before-gtm.md),
  [ADR-007](../adrs/ADR-007-geo-scoped-consent-defaults.md).
- Live audit evidence (2026-07-05): pre-consent `gcs=G100`, post-Accept `_ga`
  cookie set + `analytics_storage {update:true}`; reload race showed `gcs=G100`
  with mismatched `cid`.
