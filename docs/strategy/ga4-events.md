---
title: 'GA4 events and conversion definitions'
last_reviewed: 2026-05-10
maintainer: Anthony Coffey
related_specs: [SPEC-016]
---

# GA4 events and conversion definitions

Living document. Whenever a GA4 key event is added, removed, or renamed, update the table below. The audit (`docs/strategy/seo-audit-2026-Q2.md`) cited 5 conversions over 180 days but did not verify the underlying event; this doc closes that gap and prevents future audits from making the same assumption.

## Setup

- **Property:** coffey.codes (id `416080229`)
- **Tag manager:** Google Tag Manager (`GTM-KJC6Q389`), loaded via [components/GoogleAnalyticsClient.tsx](components/GoogleAnalyticsClient.tsx)
- **Consent mode:** geo-scoped defaults are emitted inline in `<head>` from [lib/consent.ts](lib/consent.ts) (see [ADR-007](../specs/adrs/ADR-007-geo-scoped-consent-defaults.md)), with live Accept/Reject handled by [components/ConsentManager.tsx](components/ConsentManager.tsx). Since 2026-07-05 (SPEC-034): `analytics_storage` is **granted by default outside the opt-in regions** (US opt-out regime, Canada, rest of world) and **denied by default inside the EEA/UK/Switzerland** (`OPT_IN_REGIONS`) until the banner grants; all `ad_*` signals stay denied everywhere until an explicit grant. A returning visitor's stored choice is re-asserted synchronously in the same inline script before GTM loads. This supersedes the 2026-05-10 global deny-everywhere attestation; the geo-scoped posture is the current audit answer if Google asks.

## Key events as of 2026-05-10

Walked GA4 Admin → Events and the GTM workspace on 2026-05-10. The final configuration:

| GA4 event name | Trigger | Source | Why keyed | Status |
| --- | --- | --- | --- | --- |
| `file_download` | User downloads a file matching GA4's default extension list (pdf, doc, xlsx, etc.). Driven on this site mostly by `/Anthony%20Coffey%20-%20Resume.pdf`. | GA4 enhanced-measurement default (no codebase trigger) | Resume downloads are a soft lead indicator. Decision made on 2026-05-10 to keep this keyed. | ON |
| `form_submit` | User successfully submits the contact form (after the API responds 2xx). | [components/ContactForm.tsx:57-61](components/ContactForm.tsx) `dataLayer.push({ event: 'form_submit', formName: 'contact' })` inside the `response.ok` branch. GTM tag + trigger added 2026-05-10 (did not previously exist, which is why the audit window saw zero `form_submit` events). | The contact form is the only direct lead surface on the site (per SPEC-017's Win Without Pitching posture: no newsletter, no gated downloads). Form completions are the most meaningful conversion signal available. | ON |

## Events present but NOT marked as key

Default GA4 enhanced-measurement events that fire automatically. None of these should be keyed for SEO conversion reporting on this site.

- `page_view`: every page load
- `scroll`: 90% scroll depth
- `click`: outbound link clicks
- `form_start`: fires on form interaction, not completion. Was keyed at audit time; **toggled OFF on 2026-05-10** because it inflated conversion counts with abandoned starts.
- `session_start`, `first_visit`, `user_engagement`: session lifecycle markers
- `purchase`: GA4's default ecommerce event. No purchase action on this site. Ignore.

## Reinterpretation of the audit's 5 "conversions"

Audit Section 9.5 attributed 5 conversions over 180 days to organic-search landing pages. With the corrected key-event picture, the most likely composition:

| Audit row | Sessions | Conversions | Most likely composition |
| --- | --- | --- | --- |
| `/` (homepage) | 12 | 3 | A mix of resume PDF downloads (`file_download`) and form_starts (which was keyed at the time) on a homepage form widget |
| `/articles/building-location-based-features-using-expo-location` | 110 | 1 | Likely a `file_download` (resume PDF link in a footer or sidebar) |
| `/articles/managing-secrets-firebase-apphosting-yaml-nextjs` | 89 | 1 | Likely a `file_download` |

The audit's framing ("the contact form is the conversion goal; the homepage is converting at a higher rate per-session than any article") was based on the assumption that the conversion event was contact form submission. That assumption was wrong. At the time the audit ran, `form_submit` was not being recorded by GA4 at all (the GTM tag was missing), and the events that were keyed (`file_download`, `form_start`) were mostly resume views and form interactions, not lead completions.

The audit's other findings (top pages, top queries, striking distance, pillar concentration) are independent of the conversion mistake and stand. Only Section 9.5's conversion narrative needs revisiting.

The Q2 audit is frozen and not retroactively edited. The Q3 audit (target 2026-08-10) will redo the conversion section now that `form_submit` is wired and `form_start` is no longer noise.

## Conversion attribution behavior

GA4 attributes a key event to the **landing page** of the session, not to the page where the event fired. Practical implications:

- A user landing on `/`, navigating to `/contact`, and submitting the form gets counted as a conversion attributed to `/`.
- A user landing directly on `/contact` and bouncing without action contributes a session to `/contact` with zero key events.
- This is why the audit showed 3 "conversions" on `/` and 0 on `/contact`: the homepage is where most journeys start.

When citing GA4 conversions in future SEO docs, always cite the landing-page attribution, not where the event fired.

## Forwarding conversions to Meta and Google Ads

GA4 key events do not automatically reach the ad platforms. For paid campaigns (see [`../documentation/guides/marketing/paid-ads-conversion-tracking.md`](../documentation/guides/marketing/paid-ads-conversion-tracking.md)), `form_submit` is forwarded as the primary conversion:

- **Google Ads:** either import the GA4 `form_submit` key event via the GA4 -> Google Ads link, or fire a native Google Ads conversion tag from the same `form_submit` dataLayer event in GTM. Use one, not both, to avoid double-counting.
- **Meta:** a GTM tag maps `form_submit` to a Meta `Lead` standard event (browser Pixel), ideally deduplicated with a server-side Conversions API event.
- **Consent:** every ad tag must be gated on `ad_storage` consent, consistent with the ConsentManager default-deny posture attested above. Denied-consent conversions are recovered through Consent Mode v2 modeling, so platform-reported counts run lower than raw submissions by design.
- **Offline conversions:** once the CRM tracks lead outcomes, upload qualified/won events (keyed by GCLID for Google, contact info or CAPI for Meta) so bidding optimizes toward revenue, not just form fills.

### `form_submit` `formName` values

The event carries a `formName` parameter identifying the surface that produced the lead. This is the per-page attribution key for paid campaigns.

| `formName` | Surface |
| --- | --- |
| `contact` | Nav/`/contact` contact form ([components/ContactForm.tsx](../../components/ContactForm.tsx)) |
| `lp_practical_ai` | `/lp/practical-ai` lead form |
| `lp_sme_web_mobile` | `/lp/sme-web-mobile` lead form |
| `lp_smb_web_marketing` | `/lp/smb-web-marketing` lead form |
| `lp_strategic_partners` | `/lp/strategic-partners` lead form |

The `lp_*` values are produced by the shared `LeadForm` component introduced for the landing-page funnel (each `/lp` page passes its own `formName`). Cross-reference [`../documentation/guides/marketing/icp-landing-page-map.md`](../documentation/guides/marketing/icp-landing-page-map.md).

> ⚠️ **`formName` is NOT yet captured in GA4** (confirmed by reviewing the GTM container export on 2026-07-05). The `form_submit` GA4 Event tag (`tagId 7`) declares no event parameters, so the `formName` the app pushes is dropped — every lead lands in one undifferentiated bucket and per-landing-page conversion attribution is impossible. **Fix (GTM UI, ~2 min):** (1) create a Data Layer Variable named `formName` (data layer variable name `formName`); (2) on the `form_submit GA4 Event` tag add an event parameter `form_name` = `{{formName}}`; (3) in GA4 Admin → Custom definitions, register a custom dimension `form_name` (event-scoped). The app side is guarded by `e2e/analytics-consent.spec.ts` (asserts the push always carries a non-empty `formName`).

## Walk-through log

### 2026-05-10

- Toggled `form_start` OFF as a key event.
- Confirmed decision to keep `file_download` ON (resume downloads = soft lead indicator).
- Created a custom GTM tag + trigger for the `form_submit` dataLayer event in workspace `GTM-KJC6Q389`. The tag did not previously exist, which explains why no `form_submit` events were recorded in the audit window.
- Marked `form_submit` ON as a GA4 key event.
- Affirmed the Google EU User Consent Policy compliance attestation in GA4 admin. The site's consent banner ([components/ConsentManager.tsx](components/ConsentManager.tsx)) is the audit answer if Google asks: default state denies all storage flags, granted only after explicit user opt-in.

### 2026-07-05 — GTM container export review (SPEC-034)

Reviewed the exported `GTM-KJC6Q389` container against the live property to verify the server side, plus GA4 Admin → Consent settings.

**Confirmed healthy:**

- GA4 config tag (`tagId 5`, `googtag` → `G-MV8YG7QQW0`) fires on *Consent Initialization – All Pages*; `form_submit GA4 Event` tag (`tagId 7`) fires on the `form_submit` custom-event trigger. Both wired correctly.
- Both tags have `consentStatus: NOT_SET`. This is **correct** for advanced Consent Mode — the Google/GA4 tags respect `analytics_storage` on their own (cookieless pings when denied). Do **not** add a "require `analytics_storage`" additional-consent check; that would fully block the tag when denied and forfeit cookieless pings + modeling.
- GA4 Consent settings panel: "Good / No issues detected." Behavioral + advertising consent signals both show **inactive** — expected, since the outage denied everyone; behavioral analytics signals should flip to **active** after the SPEC-034 geo-scoped granted-default deploys. **Watch this as the post-merge health signal.**

**Gaps found (tracked):**

1. **`formName` not captured** → see the ⚠️ note under "`form_submit` `formName` values" above. GTM-side fix, ~2 min. App side now guarded by e2e.
2. **No container-level consent default exists.** The container has no CMP template / Consent Initialization tag setting consent defaults. The inline `<head>` script (`lib/consent.ts`, ADR-006/007) is the **sole** authority for Consent Mode defaults — there is no GTM "backstop" (the ADR-005/006 prose implying one was inaccurate; corrected in ADR-007 Notes). This is *why* the `e2e/analytics-consent.spec.ts` + `monitor-ga4` guardrails matter: nothing else catches a regression in that script.
3. **SPA page_views — verify Enhanced Measurement.** The GA4 tag has no History Change trigger, so internal Next.js soft navigations are only counted if GA4 Data Stream → Enhanced Measurement → **"Page changes based on browser history events"** is ON. Verify in GA4 Admin; if off, multi-page journeys register as a single page_view.
4. **Future — ad tags need consent gating.** When Meta/Google Ads conversion tags are added (see `../documentation/guides/marketing/paid-ads-conversion-tracking.md`), they MUST carry an additional-consent check requiring `ad_storage` — unlike the analytics tags, ad tags do need to be gated (ads stay denied-by-default everywhere).

## How to verify this doc is current

1. Open https://analytics.google.com → property `coffey.codes` → Admin → Events.
2. List every event with **Mark as key event** ON. Compare against the table above.
3. For each tracked key event, search the codebase for the event name (`grep "event: 'form_submit'"`-style).
4. Open https://tagmanager.google.com → workspace `GTM-KJC6Q389` → Tags. Confirm each keyed event has a tag forwarding the dataLayer event into GA4 with the matching event name.
5. If anything is out of sync, edit the table above, bump `last_reviewed:` in the frontmatter, append a dated entry under "Walk-through log", and commit.

## Open questions for the next audit

- After 30+ days with `form_submit` keyed and `form_start` unkeyed, what does the contact-form conversion rate actually look like? Hypothesis: well under 0.1% of sessions, since the audit's inflated 5/6,792 = 0.07% rate was dominated by file_downloads.
- Should `file_download` be split by file path (resume.pdf vs. anything else) so resume-specifically can be tracked? GA4 supports per-event parameters; the dimension would be `link_url`. Worth doing if any non-resume PDFs get published on the site.
- Bot regions (China + Singapore) inflate session counts but bots don't fill forms or click resume links. Confirm at the Q3 audit by filtering both `form_submit` and `file_download` events by country.
- Now that consent attestation is affirmed in GA4, behavioral modeling for unconsented users should activate at the threshold (~1,000 users/day for 7+ days). The site is probably under that threshold, so this is more of a future-state note than an action item.
