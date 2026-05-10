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
- **Consent mode:** managed by [components/ConsentManager.tsx](components/ConsentManager.tsx); GA4 only collects after `ad_storage` and `analytics_storage` are granted

## Key events (formerly "conversions")

GA4 renamed "conversions" to "key events" in early 2024. The table tracks every event that has the **Mark as key event** toggle enabled in GA4 Admin → Events.

| GA4 event name | What user action triggers it | Where it fires (codebase) | GTM tag | Meaningful for SEO reporting? | Notes |
| --- | --- | --- | --- | --- | --- |
| `form_submit` (or whatever GTM forwards it as) | User submits the contact form | [components/ContactForm.tsx:59](components/ContactForm.tsx) `dataLayer.push({ event: 'form_submit', formName: 'contact' })` | TBD: confirm tag exists in `GTM-KJC6Q389` workspace, named something like "GA4 - Form Submit - Contact" | Yes. The contact form is the only conversion surface (no newsletter, no gated downloads per SPEC-017's posture) | Audit attributed 5 conversions over 180 days, 3 to homepage landing, 1 each to building-location-based-features and managing-secrets-firebase. GA4 attributes conversions to the landing page, not the page where the event fires, which explains why /contact landings showed 0 |
| _add row when a new key event is introduced_ | | | | | |

## Events present but NOT marked as key

Default GA4 enhanced-measurement events fire automatically and should NOT be marked as key events for SEO reporting. They're useful as engagement signals but inflate "conversion" counts if toggled on.

- `page_view`: every page load
- `scroll`: 90% scroll depth
- `click`: outbound link clicks
- `file_download`: downloads of files matching default extensions
- `video_start`, `video_progress`, `video_complete`: YouTube embeds (irrelevant on this site currently)
- `session_start`, `first_visit`: session lifecycle markers

If any of these show up with the key-event toggle ON in GA4 Admin → Events, turn them OFF.

## Conversion attribution behavior

GA4 attributes a conversion to the **landing page** of the session, not to the page where the event fired. Practical implications:

- A user landing on `/`, navigating to `/contact`, and submitting the form gets counted as a conversion attributed to `/`.
- A user landing directly on `/contact` and bouncing without submitting contributes a session to `/contact` with zero conversions.
- This is why audit Section 9.5 shows 3 conversions on `/` (12 organic-search sessions) and 0 on `/contact` (3 organic-search sessions).

When citing GA4 conversions in future SEO docs, always cite the landing-page attribution, not where the event fired.

## How to verify this doc is current

1. Open https://analytics.google.com → property `coffey.codes` → Admin → Events.
2. List every event with **Mark as key event** ON. Compare against the table above.
3. For each tracked key event, search the codebase for the event name (`grep "event: 'form_submit'"`-style).
4. Open https://tagmanager.google.com → workspace `GTM-KJC6Q389` → Tags. Confirm each key event has a tag forwarding the dataLayer event into GA4 with the matching event name.
5. If anything is out of sync, edit the table above, bump `last_reviewed:` in the frontmatter, and commit.

## Open questions for the next audit

- Are there `gtag('event', ...)` calls firing outside of GTM (i.e. directly to GA4) that bypass the tag manager? Audit suggests no, but `grep "gtag('event'"` should be re-run periodically.
- Should the contact form fire a more semantic event name (`generate_lead` is GA4's recommended name for contact-form-style conversions)? Renaming would require a GTM tag update and would reset the historical conversion count under the new name.
- Bot regions (China + Singapore) inflate session counts but don't trigger `form_submit` (no real human filling the form). Confirm this hypothesis at the next audit by filtering `form_submit` events by country and checking for any from those regions.
