# Paid-ads conversion tracking

How to make Meta and Google Ads see the conversions that already fire in GA4, so the ad platforms optimize toward booked leads instead of raw clicks. Without this, a $5/day campaign spends against clicks and you fly blind on which ad actually produced a qualified inquiry.

Read [`../../../strategy/ga4-events.md`](../../../strategy/ga4-events.md) first. It is the source of truth for the site's events; this doc is about forwarding those events to the ad platforms. Consent behavior is governed by [`components/ConsentManager.tsx`](../../../../components/ConsentManager.tsx) and Google Consent Mode, which materially affects what these pixels are allowed to do (see the Consent section below).

## The conversion that matters

**Primary conversion: `form_submit`.** It fires once, after the contact/lead form gets a 2xx from the backend. It is the most meaningful lead signal on the site. Both Meta and Google Ads should treat `form_submit` as the primary (bidding) conversion.

**Secondary signal: `file_download`.** Resume downloads are a soft interest indicator. Optionally import as a secondary conversion, but never let smart bidding optimize toward it; it is not a lead.

Per-landing-page attribution comes from the `formName` parameter on the event (`lp_practical_ai`, `lp_sme_web_mobile`, `lp_smb_web_marketing`, `lp_strategic_partners`, and `contact` for the nav contact form). See the `formName` values in [`icp-landing-page-map.md`](icp-landing-page-map.md).

## Current setup this builds on

- **GA4 property:** `416080229`.
- **Tag manager:** GTM container `GTM-KJC6Q389`, loaded via [`components/GoogleAnalyticsClient.tsx`](../../../../components/GoogleAnalyticsClient.tsx).
- **Consent Mode:** [`components/ConsentManager.tsx`](../../../../components/ConsentManager.tsx) denies `ad_storage`, `ad_personalization`, and `analytics_storage` by default and grants only after the banner opt-in.
- **The event:** `dataLayer.push({ event: 'form_submit', formName: '<page>' })` fires from the form components inside the success branch.

Everything below is added inside GTM so there is one place to manage tags, one consent model, and no hard-coded pixel snippets in the app.

## Meta (Facebook/Instagram)

Two layers, both recommended: the browser Pixel and the server-side Conversions API (CAPI). Browser-only tracking degrades as browsers and consent choices block third-party storage, so CAPI backfills the gap.

### 1. Meta Pixel (browser)

1. In Meta Events Manager, create a Pixel (data source) for coffey.codes and copy the Pixel ID.
2. In GTM (`GTM-KJC6Q389`), add the Meta Pixel base tag (via the community "Facebook Pixel" template or a custom HTML tag), firing on all pages, **gated on ad-storage consent** (see Consent section).
3. Add an event tag that sends a Meta `Lead` standard event, triggered by the existing `form_submit` dataLayer event. Pass `formName` as a custom parameter so per-page reporting survives into Meta.
4. In Events Manager, mark `Lead` as the optimization event for the campaign.

### 2. Meta Conversions API (server)

CAPI sends the same `Lead` event from a server, keyed by an event ID that matches the browser event for deduplication. Options, cheapest first:

- **GTM Server-Side container** forwarding the `Lead` event to the Meta CAPI tag (best long-term, some setup).
- **A Meta CAPI Gateway** or a partner integration if server-side GTM is not worth standing up yet.
- At minimum, launch with the browser Pixel and add CAPI once the campaign is live and you can see attribution loss.

Match the browser and server event with a shared `event_id` so Meta deduplicates. Verify in Events Manager -> Test Events.

## Google Ads

Two ways to get `form_submit` into Google Ads. Pick one primary to avoid double-counting.

### Option A (simplest): import the GA4 conversion

1. In GA4, mark `form_submit` as a key event (already done, per `ga4-events.md`).
2. Link the GA4 property `416080229` to the Google Ads account (GA4 Admin -> Product links -> Google Ads).
3. In Google Ads -> Goals -> Conversions -> Import -> Google Analytics (GA4), import `form_submit`. Set it as the primary conversion action; set `file_download` as secondary or leave it out.

This reuses GA4's consent-aware collection and needs no new tag. The tradeoff is GA4's attribution model and a slightly longer data delay.

### Option B: native Google Ads conversion via GTM

1. In Google Ads -> Conversions, create a Website conversion action for "Lead / form submit," copy the conversion ID and label.
2. In GTM, add a Google Ads Conversion Tracking tag triggered by the `form_submit` dataLayer event, gated on ad-storage consent.
3. Add the Google Ads Conversion Linker tag (fires on all pages) so click IDs are captured.

Option B gives Google Ads first-party, faster conversion data and is the better base for smart bidding once volume exists. Do not run A and B for the same action at the same time, or you will double-count.

### Enhanced conversions (recommended with Option B)

Turn on Enhanced Conversions for Leads and pass hashed email from the form submission. This recovers conversions that cookies alone miss and improves smart-bidding accuracy. The lead form already collects email; GTM hashes it before send (Google's tag does the SHA-256).

## Offline conversion import (close the loop to revenue)

Clicks and form submits are lead signals, not revenue. The real optimization target is a qualified lead that becomes a client. Once the CRM (per [`../marketing/tracking.md`](tracking.md)) tracks lead outcomes, feed those back:

- **Google Ads:** capture the GCLID on the landing page (the Conversion Linker does this) and store it against the lead in the CRM. When a lead qualifies or closes, upload an offline conversion (Google Ads -> Conversions -> Import -> from clicks, via file upload or the API) so bidding learns which clicks produced real business.
- **Meta:** upload offline/qualified-lead events keyed by the lead's contact info or via the CAPI with a later event (for example a `Qualified` custom event) so Meta learns beyond the on-site form submit.

At $5/day this is a month-two refinement, not a launch blocker. But design the CRM to store GCLID and lead source from day one so the data exists when you want it.

## Consent Mode (do not skip)

The site denies `ad_storage` and `ad_personalization` by default and grants only on opt-in ([`components/ConsentManager.tsx`](../../../../components/ConsentManager.tsx)). Consequences:

- **Gate all ad pixels/tags on ad-storage consent** in GTM. A Meta Pixel or Google Ads tag that fires before consent violates the site's own consent posture and the EU User Consent Policy attestation affirmed in GA4 (see `ga4-events.md`).
- With Google Consent Mode v2 active, Google Ads uses **conversion modeling** to estimate conversions from users who declined, so denied-consent traffic is not fully lost.
- Meta's equivalent recovery comes from CAPI plus modeling; another reason to add CAPI rather than rely on the browser Pixel alone.
- Expect reported conversion counts to be lower than raw form submissions because some users decline. That gap is expected and correct, not a tracking bug.

## Verification checklist

1. Submit a real test lead on `/lp/practical-ai` with consent granted.
2. GA4 -> Realtime (or DebugView): confirm `form_submit` with `formName: lp_practical_ai`.
3. Meta Events Manager -> Test Events: confirm one `Lead` event, deduplicated across browser and CAPI.
4. Google Ads -> the conversion action shows "Recording conversions" within a day (GA4 import can lag longer).
5. Submit a second test with consent denied: confirm the ad tags do **not** fire and GA4 still models the session.
6. Re-run this checklist whenever GTM tags, the form's dataLayer push, or the consent banner change.

## Related

- [`../../../strategy/ga4-events.md`](../../../strategy/ga4-events.md), the event source of truth and consent attestation
- [`tracking.md`](tracking.md), UTM conventions and the KPI dashboard these conversions feed
- [`icp-landing-page-map.md`](icp-landing-page-map.md), the `formName` values per landing page
- [`ad-creatives/meta.md`](ad-creatives/meta.md), [`ad-creatives/google-search.md`](ad-creatives/google-search.md), the campaigns that optimize on these conversions
