# Ads launch runbook

The executable, click-by-click sequence for launching paid ads to the `/lp` pages at $5/day per platform. The strategy and copy live in the guides referenced below; this runbook is the order of operations and the exact settings. Work top to bottom. Do not start spending before the "Prerequisites" section is fully checked.

**Companion docs:**

- Channel copy and frameworks: [`ad-creatives/meta.md`](ad-creatives/meta.md), [`ad-creatives/google-search.md`](ad-creatives/google-search.md)
- Which ad points where: [`icp-landing-page-map.md`](icp-landing-page-map.md)
- Page copy standard: [`landing-page-copywriting.md`](landing-page-copywriting.md)
- Tracking and UTMs: [`tracking.md`](tracking.md), [`paid-ads-conversion-tracking.md`](paid-ads-conversion-tracking.md), [`../../../strategy/ga4-events.md`](../../../strategy/ga4-events.md)

## The one rule for a $5/day budget: start narrow

$5/day is roughly 1 to 3 clicks a day on Google Search and a few hundred impressions on Meta. If you split that across four ad groups and four audiences, nothing ever collects enough data to learn or to judge. So:

- **Google Search:** launch ONE campaign with ONE ad group (the highest-intent ICP), not all four. Add a second ad group only after the first shows qualified clicks.
- **Meta:** launch ONE campaign with ONE ad set (one ICP, one landing page). Add a second later.
- Pick the two ICPs to start (one per platform). Recommended openers: **Google Search -> Custom Web/Mobile** (`/lp/sme-web-mobile`, highest commercial intent) and **Meta -> SMB Web** (`/lp/smb-web-marketing`, owner-operators reachable cheaply). Adjust to whichever pipeline you most want to fill.
- Expect the first 1 to 2 weeks to be learning, not performance. Judge on message match and lead quality, not thin CPL numbers.

## Prerequisites (do not launch until every box is checked)

- [ ] The target `/lp` pages are deployed on production and each renders its `LeadForm`.
- [ ] A test submission on each target page produces an email (see [`contact-form-cloud-function.md`](../contact-form-cloud-function.md)) and fires `form_submit` in GA4 with the right `formName`.
- [ ] Google Ads account created and billing set.
- [ ] Meta Business account + ad account created and billing set.
- [ ] **Conversion tracking live before spend** (per [`paid-ads-conversion-tracking.md`](paid-ads-conversion-tracking.md)):
  - [ ] Google Ads: `form_submit` imported (GA4 link) OR a native Google Ads conversion tag in GTM, set as the primary conversion. Conversion Linker tag firing.
  - [ ] Meta: Pixel installed via GTM (gated on consent), `form_submit` mapped to a `Lead` event; CAPI optional at launch, recommended soon after.
  - [ ] Both tags gated on `ad_storage` consent to match the site's consent posture.
- [ ] Decide indexing for `/lp` pages. They now carry real content and self-canonicals, so indexing is fine; if you would rather they not compete in organic, add `robots: noindex, follow` to their metadata. This is a decision, not a blocker.
- [ ] UTM template ready per [`tracking.md`](tracking.md).

## Google Search build

Reference copy and keywords: [`ad-creatives/google-search.md`](ad-creatives/google-search.md).

1. [ ] **New campaign -> objective: Leads -> type: Search.** Uncheck the Display Network.
2. [ ] **Locations:** United States (or tighten to your service area). **Language:** English.
3. [ ] **Budget:** $5.00/day. **Bidding:** start on **Maximize Clicks with a max CPC cap** (or Manual CPC) while the account has no conversion history. Switch to a conversion-based strategy only after ~15 to 30 conversions exist.
4. [ ] **One ad group** for the opener ICP (e.g. "Custom Web/Mobile" -> `/lp/sme-web-mobile`). Add keywords in **phrase and exact match only** (no broad). Start with 5 to 10 tight keywords from the google-search doc.
5. [ ] **Negative keywords:** add the campaign-level starter list from the google-search doc (`free, cheap, jobs, salary, resume, course, tutorial, template, fiverr, upwork, wix, squarespace`, etc.).
6. [ ] **Responsive search ad:** paste 10 to 15 headlines and 3 to 4 descriptions from the ad-group assets in the google-search doc. Pin the keyword headline to position 1.
7. [ ] **Final URL:** the matched `/lp` page. **Tracking template / final-URL suffix (campaign level):** the canonical UTM from tracking.md, e.g. `utm_source=google_ads&utm_medium=cpc&utm_campaign=google_sme_web_mobile_q3&utm_content=rsa_v1&utm_term={keyword}`.
8. [ ] **Extensions:** sitelinks (`/case-studies`, `/portfolio`, `/contact`), callouts (12+ Years, Senior Engineer, On-Time Delivery, Austin), structured snippets (Web Apps, Mobile Apps, AI Integration), call extension if you want phone leads.
9. [ ] Confirm the conversion action shows in the campaign's "Conversions" column setup.
10. [ ] Publish.

## Meta build

Reference copy and audiences: [`ad-creatives/meta.md`](ad-creatives/meta.md).

1. [ ] **New campaign -> objective: Leads** (optimizing for the `Lead` event) or **Sales** if the Lead event is not yet firing enough; at launch with low volume you may optimize for Landing Page Views for the first few days, then switch to Lead once the Pixel records submissions.
2. [ ] **Advantage+ / CBO off** to start; set the budget at the ad-set level.
3. [ ] **One ad set** for the opener ICP (e.g. "SMB Web" -> `/lp/smb-web-marketing`). **Budget:** $5.00/day.
4. [ ] **Audience:** interest/behavior targeting from the meta doc (small-business owner, marketing, relevant platforms), US, age 30 to 55. Layer local geo if the ICP is local. Skip a lookalike until the Pixel has enough converters.
5. [ ] **Placements:** Advantage+ placements (let Meta optimize) at this budget.
6. [ ] **Creative:** one to two ads from the meta doc. Lead with a real photo and a pain-first first line. Set the primary text, headline, and description.
7. [ ] **Website URL + URL parameters:** the matched `/lp` page + the canonical Meta UTM, e.g. `utm_source=meta_ads&utm_medium=cpc&utm_campaign=meta_smb_web_marketing_q3&utm_content=single_image_v1`.
8. [ ] **CTA button:** "Learn More".
9. [ ] Confirm the Pixel is connected and the `Lead` event is selected as the optimization/conversion event (once firing).
10. [ ] Publish.

## Launch day

- [ ] Both campaigns live, each pointed at its matched `/lp` page with correct UTMs.
- [ ] Click each live ad's preview and confirm the landing page loads and the headline matches the ad's promise (message match).
- [ ] Submit one real test lead from an ad click; confirm it emails, shows in GA4 with the right `formName`, and (within a day) registers as a conversion in the platform.
- [ ] Note the launch date and the starting KPIs baseline (per tracking.md).

## First two weeks: monitoring cadence

Do not restructure daily. At this budget, changes need a few days to mean anything.

- **Daily (2 minutes):** confirm spend is happening and nothing is disapproved.
- **Every 2 to 3 days — Google:** open the **search terms report**, add negative keywords for anything off-intent. This is the single highest-value recurring action on a small Search budget.
- **Weekly:** review CTR, cost per `form_submit`, and lead quality in the CRM. Compare against the benchmarks in landing-page-copywriting.md (2 to 5 percent LP conversion for warm paid traffic).
- **Weekly:** if a landing page is getting clicks but no form submissions, the problem is the page or the message match, not the ad. Revisit the hero and the ad-to-page match before touching bids.

## Kill and scale rules

- **Pause an ad/keyword** only after it has spent enough to judge (at $5/day, give it a week-plus). Google: pause keywords with clicks and zero conversions once the search-terms report shows they are off-intent. Meta: pause the weaker creative once one clearly wins on cost per Lead.
- **Scale** only on proven, qualified leads (not raw CPL). When a channel produces qualified leads at an acceptable cost, raise its daily budget gradually (roughly 20 to 30 percent steps, not doubling) and only then add the second ad group / ad set.
- **Switch bidding** to Maximize Conversions or Target CPA (Google) / Lead optimization (Meta) once each has accumulated enough conversions for the algorithm to learn.
- **Add offline conversions** (per paid-ads-conversion-tracking.md) once the CRM tracks lead outcomes, so bidding optimizes toward real business, not just form fills.

## What I can help with after merge

- Walk the Google Ads and Meta consoles step by step (optionally driving the browser via the Chrome MCP while you are logged in).
- Finalize the exact keyword and negative lists and the RSA/Meta creative variants to paste.
- Verify the Pixel, CAPI, and Google Ads conversion fire correctly end to end.
- Set the UTMs and confirm they land cleanly in GA4.

Account creation, billing, and spend approval stay with you.

## Related

- [`ad-creatives/meta.md`](ad-creatives/meta.md), [`ad-creatives/google-search.md`](ad-creatives/google-search.md)
- [`paid-ads-conversion-tracking.md`](paid-ads-conversion-tracking.md), [`tracking.md`](tracking.md)
- [`icp-landing-page-map.md`](icp-landing-page-map.md), [`landing-page-copywriting.md`](landing-page-copywriting.md)
- [`roadmap.md`](roadmap.md), the phased plan this launch sits inside
