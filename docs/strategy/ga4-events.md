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

## Key events as of 2026-05-10

Walked through GA4 Admin → Events on 2026-05-10. Two events have **Mark as key event** ON:

| GA4 event name | Trigger | Source | Meaningful for SEO conversion reporting? | Recommendation |
| --- | --- | --- | --- | --- |
| `file_download` | User downloads a file matching GA4's default extension list (pdf, doc, xlsx, etc.) | GA4 enhanced-measurement default (no codebase trigger) | Soft engagement signal. Driven on this site mostly by `/Anthony%20Coffey%20-%20Resume.pdf` downloads (audit Section 3: 15 clicks / 365 days). | **Open question.** If the user wants resume views as a lead indicator, keep it ON. If the user wants conversion = contact form submit only, toggle OFF. |
| `form_start` | User begins typing into any form field | GA4 enhanced-measurement default (no codebase trigger) | **No.** Fires on form interaction, not completion. Inflates conversion counts with abandoned starts. | **Toggle OFF.** It does not represent a meaningful conversion. |

## Key event the audit assumed but is not currently active

| GA4 event name | Trigger | Source | Status |
| --- | --- | --- | --- |
| `form_submit` | User successfully submits the contact form (after the API responds 2xx) | [components/ContactForm.tsx:57-61](components/ContactForm.tsx) `dataLayer.push({ event: 'form_submit', formName: 'contact' })` inside the `response.ok` branch | **Not in GA4 Recent Events.** Either the GTM tag forwarding this dataLayer event into GA4 does not exist, or no one has completed a submission in the last ~30 days. Verify GTM workspace `GTM-KJC6Q389` for a tag with trigger "Custom Event = form_submit". If absent, create it. |

## Reinterpretation of the audit's 5 "conversions"

Audit Section 9.5 attributed 5 conversions over 180 days to organic-search landing pages:

| Audit row | Sessions | Conversions | Probable real meaning |
| --- | --- | --- | --- |
| `/` (homepage) | 12 | 3 | Likely 3 resume PDF downloads (`file_download`) plus possibly form_starts on a homepage form widget |
| `/articles/building-location-based-features-using-expo-location` | 110 | 1 | Likely a single `file_download` (resume PDF link in a footer or sidebar) |
| `/articles/managing-secrets-firebase-apphosting-yaml-nextjs` | 89 | 1 | Likely a single `file_download` |

The audit's framing ("the contact form is the conversion goal; the homepage is converting at a higher rate per-session than any article") was based on the assumption that the conversion event was contact form submission. That assumption was wrong. The conversions are mostly resume downloads.

This does not invalidate the audit's other findings, but the conversion-oriented interpretation in Section 9.5 needs revisiting once `form_submit` is wired and accumulating data. Do the revision in the next quarterly audit (2026-Q3), not retroactively in the frozen Q2 doc.

## Events present but NOT marked as key

Default GA4 enhanced-measurement events fire automatically. Currently visible in Recent Events:

- `page_view`: every page load
- `scroll`: 90% scroll depth
- `click`: outbound link clicks
- `file_download`: see table above (currently keyed)
- `form_start`: see table above (currently keyed; recommend toggling off)
- `session_start`, `first_visit`, `user_engagement`: session lifecycle markers

Default events listed in admin but with no stream data:

- `purchase`: GA4's default ecommerce event. No purchase action on this site. Ignore.

## Conversion attribution behavior

GA4 attributes a key event to the **landing page** of the session, not to the page where the event fired. Practical implications:

- A user landing on `/`, navigating to `/contact`, and submitting the form (when `form_submit` is keyed) gets counted attributed to `/`.
- A user landing directly on `/contact` and bouncing without action contributes a session to `/contact` with zero key events.
- This explains why the audit showed 3 conversions on `/` (12 organic sessions) and 0 on `/contact` (3 organic sessions): the homepage is where most journeys start, including journeys that lead to the resume download.

When citing GA4 conversions in future SEO docs, always cite the landing-page attribution, not where the event fired.

## Action items (for the user, post-walk-through)

- [ ] Toggle `form_start` OFF as a key event in GA4 Admin → Events.
- [ ] Decide whether `file_download` should remain a key event (resume views as a lead indicator) or be toggled off. Document the decision here.
- [ ] In GTM workspace `GTM-KJC6Q389`, verify or create a tag forwarding the `form_submit` dataLayer event into GA4 with the GA4-recommended event name (`generate_lead` is GA4's canonical name for contact-form completions; `form_submit` also works).
- [ ] Once the tag is live, mark the GA4 event ON as a key event in GA4 Admin → Events.
- [ ] Wait 14-30 days for data to accumulate, then re-pull the audit's conversion numbers using the now-correct event.

## How to verify this doc is current

1. Open https://analytics.google.com → property `coffey.codes` → Admin → Events.
2. List every event with **Mark as key event** ON. Compare against the table above.
3. For each tracked key event, search the codebase for the event name (`grep "event: 'form_submit'"`-style).
4. Open https://tagmanager.google.com → workspace `GTM-KJC6Q389` → Tags. Confirm each key event has a tag forwarding the dataLayer event into GA4 with the matching event name.
5. If anything is out of sync, edit the table above, bump `last_reviewed:` in the frontmatter, and commit.

## Open questions for the next audit

- After the GTM tag is wired and `form_submit` is a key event for 30+ days, what does the contact-form conversion rate actually look like? Hypothesis: lower than 5/6,792 = 0.07%, since the audit count was inflated by file_download.
- Should `file_download` be split by file path (resume.pdf vs. anything else) so resume-specifically can be tracked separately? GA4 supports per-event parameters; the dimension would be `link_url`.
- Bot regions (China + Singapore) inflate session counts but bots don't fill forms or click resume links. Confirm at the next audit by filtering the contact-form key event by country.
