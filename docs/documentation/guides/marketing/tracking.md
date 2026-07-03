# Marketing KPI Tracking Framework

This document establishes the framework for tracking Key Performance Indicators (KPIs) to measure the effectiveness of marketing and advertising efforts, based on Section IX of `marketing-advertising-strategy.md`.

## Core Principle

Consistently measure performance across the funnel (awareness, engagement, conversion) to understand what's working, calculate ROI, and make data-driven optimization decisions.

## Tracking Tools

- **Website Analytics:** Google Analytics (GA4, property `416080229`) via GTM `GTM-KJC6Q389`. See [`../../../strategy/ga4-events.md`](../../../strategy/ga4-events.md).
- **Advertising Platforms:** Meta Ads Manager, Google Ads, LinkedIn Ads Manager, Reddit Ads Dashboard.
- **Ad conversion tracking:** Meta Pixel + Conversions API and Google Ads conversions, both fed by the `form_submit` event. Setup in [`paid-ads-conversion-tracking.md`](paid-ads-conversion-tracking.md).
- **Lead Tracking:** CRM (Simple spreadsheet initially, consider dedicated CRM later e.g., HubSpot Free, Zoho CRM Free). Store GCLID and lead source per lead so offline conversions can be uploaded later.

## Key Performance Indicators (KPIs) & Dashboard Template

_(Based on Strategy Doc Section IX.D - Targets are illustrative examples, adjust based on real data)_

| KPI Category        | Specific Metric            | Target/Benchmark (Example) | Tracking Method      | Reporting Frequency | Notes                                                            |
| :------------------ | :------------------------- | :------------------------- | :------------------- | :------------------ | :--------------------------------------------------------------- |
| **Website**         | Website Sessions           | Increase 15% QoQ           | GA4                  | Monthly             | Overall traffic trend.                                           |
|                     | Traffic Sources            | Monitor Mix %              | GA4                  | Monthly             | Identify top channels (Organic, Social, Paid, Referral, Direct). |
|                     | Avg. Session Duration      | > 1 min 30 sec             | GA4                  | Monthly             | Engagement indicator.                                            |
|                     | Bounce Rate                | < 55%                      | GA4                  | Monthly             | Lower is better; indicates relevance.                            |
|                     | Goal Completions (Forms)   | > 10 / month               | GA4 (Goal Tracking)  | Monthly             | Measures website conversion effectiveness.                       |
|                     | Page Views (Service Pages) | Track Trends               | GA4                  | Monthly             | Interest in specific offerings.                                  |
| **Ads - LinkedIn**  | Impressions                | Track                      | LinkedIn Ads Manager | Weekly/Monthly      | Ad visibility.                                                   |
|                     | Reach                      | Track                      | LinkedIn Ads Manager | Weekly/Monthly      | Unique users reached.                                            |
|                     | CTR                        | > 0.56% (Image Ad Avg)     | LinkedIn Ads Manager | Weekly/Monthly      | Ad relevance/creative effectiveness.                             |
|                     | CPC                        | Track                      | LinkedIn Ads Manager | Weekly/Monthly      | Cost efficiency of clicks.                                       |
|                     | Leads Generated (Tracked)  | > 5 qualified / month      | LinkedIn Ads / CRM   | Monthly             | Volume of leads attributed to LinkedIn.                          |
|                     | Conversion Rate (on site)  | Track                      | GA4 / LinkedIn Pixel | Monthly             | % of clicks leading to website goal completion.                  |
|                     | CPL (Cost Per Lead)        | < $150 (Adjust based LTV)  | LinkedIn Ads / CRM   | Monthly             | Cost efficiency of lead generation. **Critical ROI metric.**     |
| **Ads - Reddit**    | Impressions                | Track                      | Reddit Ads Dashboard | Weekly/Monthly      | (If used) Ad visibility.                                         |
| (If Applicable)     | CTR                        | > 0.5% (Varies by Sub)     | Reddit Ads Dashboard | Weekly/Monthly      | (If used) Ad relevance.                                          |
|                     | Relevant Inquiries         | Track Qualitatively        | Reddit Ads / CRM     | Monthly             | (If used) Assess quality of leads/comments.                      |
| **Leads (Overall)** | Total Leads (All Sources)  | Track Volume               | CRM                  | Monthly             | Overall inquiry volume.                                          |
|                     | Qualified Leads            | > 15 / month (Goal)        | CRM (Qualification)  | Monthly             | Leads meeting ICP criteria.                                      |
|                     | Lead Source Breakdown      | Track % per Channel        | CRM                  | Monthly             | Identify highest performing channels for _qualified_ leads.      |
|                     | Lead-to-Proposal Rate      | > 50% (Goal)               | CRM                  | Monthly             | % of qualified leads receiving a proposal.                       |
|                     | Proposal Win Rate          | > 30% (Goal)               | CRM                  | Monthly             | % of proposals accepted.                                         |
| **Overall ROI**     | CAC (Client Acq. Cost)     | < $1000 (Adjust based LTV) | CRM / Accounting     | Monthly/Quarterly   | Total Mktg Spend / New Clients. **Critical ROI metric.**         |
|                     | LTV:CAC Ratio              | > 3:1 (Goal)               | CRM / Accounting     | Quarterly           | Lifetime Value vs Acquisition Cost. **Critical ROI metric.**     |

**Meta and Google Search ads** use the same metric rows as the LinkedIn block above (Impressions, CTR, CPC, Leads, Conversion Rate, CPL/cost per `form_submit`), tracked in Meta Ads Manager and Google Ads respectively rather than LinkedIn Ads Manager. At the current $5/day-per-platform budget, conversion volume is low, so judge early performance on message match and lead quality over statistically thin CPL deltas. The primary conversion for both platforms is the `form_submit` event, imported per [`paid-ads-conversion-tracking.md`](paid-ads-conversion-tracking.md); per-landing-page attribution comes from the event's `formName` parameter (see [`icp-landing-page-map.md`](icp-landing-page-map.md)).

## Measurement Methodology

- **Baseline Establishment (Action Item - Phase 0/1):** Before launching significant campaigns (Phase 1), capture baseline metrics for key website KPIs (e.g., monthly sessions, traffic sources, existing conversion rates if any) from GA4 to measure future impact accurately.
- **Lead Source Tracking:**
  - **UTM Parameters:** Use a consistent UTM structure for all paid campaigns and important links to track sources effectively in GA4. See the canonical convention below.
    - `utm_source`: Platform name (e.g., `linkedin`, `reddit`, `meta_ads`, `google_ads`, `partner_site`).
    - `utm_medium`: Marketing medium (e.g., `cpc`, `social`, `email`, `referral`).
    - `utm_campaign`: Specific campaign name (e.g., `linkedin_ai_consulting_q2`, `reddit_webdev_austin`).
    - `utm_content`: Ad group or specific creative identifier (e.g., `adgroup_cto`, `image_ad_v1`, `text_link_footer`).
    - `utm_term`: (Optional) Paid keywords.

### Canonical UTM convention for paid ads

One naming scheme across every platform so GA4 reports stay parseable. Lowercase, underscores, no spaces. Pattern:

- `utm_source`: the platform. Use `meta_ads`, `google_ads`, `linkedin`, `reddit`.
- `utm_medium`: always `cpc` for paid search and paid social clicks.
- `utm_campaign`: `<platform>_<icp>_<quarter>`, where `<icp>` is the landing-page slug it routes to (`practical_ai`, `sme_web_mobile`, `smb_web_marketing`, `strategic_partners`). This ties the UTM to the ICP-to-landing-page map.
- `utm_content`: the specific creative or ad group, so A/B variants are distinguishable (`carousel_v1`, `rsa_v1`, `adgroup_ai_integration`).
- `utm_term`: paid keyword on Search (use `{keyword}` auto-insertion in Google Ads); omit on social.

Concrete examples (append to the landing-page final URL):

- **Meta -> Practical AI:** `/lp/practical-ai?utm_source=meta_ads&utm_medium=cpc&utm_campaign=meta_practical_ai_q3&utm_content=single_image_v1`
- **Google Search -> Custom Web/Mobile:** `/lp/sme-web-mobile?utm_source=google_ads&utm_medium=cpc&utm_campaign=google_sme_web_mobile_q3&utm_content=adgroup_custom_app&utm_term={keyword}`
- **Google Search -> Small-business web:** `/lp/smb-web-marketing?utm_source=google_ads&utm_medium=cpc&utm_campaign=google_smb_web_marketing_q3&utm_content=rsa_v1`
- **Meta -> SME Web/Mobile:** `/lp/sme-web-mobile?utm_source=meta_ads&utm_medium=cpc&utm_campaign=meta_sme_web_mobile_q3&utm_content=reliability_v1`

On Google Ads, set the tracking template or final-URL suffix once at the campaign level so every ad inherits the UTMs. On Meta, set the URL parameters field on each ad. The `utm_campaign` slug and the landing-page slug should always agree, so a mismatch in a GA4 report is an immediate signal that an ad points at the wrong page.
  - **Manual Logging:** Manually log lead source in CRM for inquiries via email, direct LinkedIn messages, phone calls, referrals, etc. Be specific (e.g., "LinkedIn Message - John Doe", "Referral - Jane Smith Agency").
- **Goal Configuration (GA4):** Set up goals for key conversions like contact form submissions, clicks on scheduling links (`tel:` or Calendly links), and potentially lead magnet downloads. Ensure these are firing correctly.
- **CRM Discipline:** Consistently log all leads, their source, qualification status (vs. ICPs), and progression through the sales funnel (Initial Contact > Consultation > Proposal > Won/Lost).
- **Regular Review:** Dedicate time (e.g., first Monday of the month) to compile data into the dashboard format, analyze trends against baselines and targets, and identify areas for optimization.

_This framework provides the structure for data-driven marketing. Consistent tracking and analysis are crucial for optimizing spend and maximizing return on investment._
