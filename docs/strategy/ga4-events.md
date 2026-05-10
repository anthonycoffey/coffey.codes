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
- **Consent mode:** managed by [components/ConsentManager.tsx](components/ConsentManager.tsx); default state denies `ad_storage`, `ad_personalization`, and `analytics_storage` until the user grants via the banner. Compliance attestation was affirmed in GA4 on 2026-05-10 (Google may audit; the ConsentManager component is the audit answer).

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

## Walk-through log

### 2026-05-10

- Toggled `form_start` OFF as a key event.
- Confirmed decision to keep `file_download` ON (resume downloads = soft lead indicator).
- Created a custom GTM tag + trigger for the `form_submit` dataLayer event in workspace `GTM-KJC6Q389`. The tag did not previously exist, which explains why no `form_submit` events were recorded in the audit window.
- Marked `form_submit` ON as a GA4 key event.
- Affirmed the Google EU User Consent Policy compliance attestation in GA4 admin. The site's consent banner ([components/ConsentManager.tsx](components/ConsentManager.tsx)) is the audit answer if Google asks: default state denies all storage flags, granted only after explicit user opt-in.

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
