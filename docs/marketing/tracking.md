# Marketing KPI Tracking Framework

This document establishes the framework for tracking Key Performance Indicators (KPIs) to measure the effectiveness of marketing and advertising efforts, based on Section IX of `marketing-advertising-strategy.md`.

## Core Principle

Consistently measure performance across the funnel (awareness, engagement, conversion) to understand what's working, calculate ROI, and make data-driven optimization decisions.

## Tracking Tools

*   **Website Analytics:** Google Analytics (GA4) - Assumed to be configured.
*   **Advertising Platforms:** LinkedIn Ads Manager, Reddit Ads Dashboard.
*   **Lead Tracking:** CRM (Simple spreadsheet initially, consider dedicated CRM later e.g., HubSpot Free, Zoho CRM Free).

## Key Performance Indicators (KPIs) & Dashboard Template

*(Based on Strategy Doc Section IX.D - Targets are illustrative examples, adjust based on real data)*

| KPI Category        | Specific Metric           | Target/Benchmark (Example) | Tracking Method         | Reporting Frequency | Notes                                                                 |
| :------------------ | :------------------------ | :------------------------- | :---------------------- | :------------------ | :-------------------------------------------------------------------- |
| **Website**         | Website Sessions          | Increase 15% QoQ           | GA4                     | Monthly             | Overall traffic trend.                                                |
|                     | Traffic Sources           | Monitor Mix %              | GA4                     | Monthly             | Identify top channels (Organic, Social, Paid, Referral, Direct).      |
|                     | Avg. Session Duration     | > 1 min 30 sec             | GA4                     | Monthly             | Engagement indicator.                                                 |
|                     | Bounce Rate               | < 55%                      | GA4                     | Monthly             | Lower is better; indicates relevance.                                 |
|                     | Goal Completions (Forms)  | > 10 / month               | GA4 (Goal Tracking)     | Monthly             | Measures website conversion effectiveness.                            |
|                     | Page Views (Service Pages)| Track Trends               | GA4                     | Monthly             | Interest in specific offerings.                                       |
| **Ads - LinkedIn**  | Impressions               | Track                      | LinkedIn Ads Manager    | Weekly/Monthly      | Ad visibility.                                                        |
|                     | Reach                     | Track                      | LinkedIn Ads Manager    | Weekly/Monthly      | Unique users reached.                                                 |
|                     | CTR                       | > 0.56% (Image Ad Avg)     | LinkedIn Ads Manager    | Weekly/Monthly      | Ad relevance/creative effectiveness.                                  |
|                     | CPC                       | Track                      | LinkedIn Ads Manager    | Weekly/Monthly      | Cost efficiency of clicks.                                            |
|                     | Leads Generated (Tracked) | > 5 qualified / month      | LinkedIn Ads / CRM      | Monthly             | Volume of leads attributed to LinkedIn.                               |
|                     | Conversion Rate (on site) | Track                      | GA4 / LinkedIn Pixel    | Monthly             | % of clicks leading to website goal completion.                       |
|                     | CPL (Cost Per Lead)       | < $150 (Adjust based LTV)  | LinkedIn Ads / CRM      | Monthly             | Cost efficiency of lead generation. **Critical ROI metric.**          |
| **Ads - Reddit**    | Impressions               | Track                      | Reddit Ads Dashboard    | Weekly/Monthly      | (If used) Ad visibility.                                              |
| (If Applicable)     | CTR                       | > 0.5% (Varies by Sub)     | Reddit Ads Dashboard    | Weekly/Monthly      | (If used) Ad relevance.                                               |
|                     | Relevant Inquiries        | Track Qualitatively        | Reddit Ads / CRM        | Monthly             | (If used) Assess quality of leads/comments.                           |
| **Leads (Overall)** | Total Leads (All Sources) | Track Volume               | CRM                     | Monthly             | Overall inquiry volume.                                               |
|                     | Qualified Leads           | > 15 / month (Goal)        | CRM (Qualification)     | Monthly             | Leads meeting ICP criteria.                                           |
|                     | Lead Source Breakdown     | Track % per Channel        | CRM                     | Monthly             | Identify highest performing channels for *qualified* leads.           |
|                     | Lead-to-Proposal Rate     | > 50% (Goal)               | CRM                     | Monthly             | % of qualified leads receiving a proposal.                            |
|                     | Proposal Win Rate         | > 30% (Goal)               | CRM                     | Monthly             | % of proposals accepted.                                              |
| **Overall ROI**     | CAC (Client Acq. Cost)    | < $1000 (Adjust based LTV) | CRM / Accounting        | Monthly/Quarterly   | Total Mktg Spend / New Clients. **Critical ROI metric.**              |
|                     | LTV:CAC Ratio             | > 3:1 (Goal)               | CRM / Accounting        | Quarterly           | Lifetime Value vs Acquisition Cost. **Critical ROI metric.**          |

## Measurement Methodology

*   **Baseline Establishment (Action Item - Phase 0/1):** Before launching significant campaigns (Phase 1), capture baseline metrics for key website KPIs (e.g., monthly sessions, traffic sources, existing conversion rates if any) from GA4 to measure future impact accurately.
*   **Lead Source Tracking:**
    *   **UTM Parameters:** Use a consistent UTM structure for all paid campaigns and important links to track sources effectively in GA4.
        *   `utm_source`: Platform name (e.g., `linkedin`, `reddit`, `partner_site`).
        *   `utm_medium`: Marketing medium (e.g., `cpc`, `social`, `email`, `referral`).
        *   `utm_campaign`: Specific campaign name (e.g., `linkedin_ai_consulting_q2`, `reddit_webdev_austin`).
        *   `utm_content`: Ad group or specific creative identifier (e.g., `adgroup_cto`, `image_ad_v1`, `text_link_footer`).
        *   `utm_term`: (Optional) Paid keywords.
    *   **Manual Logging:** Manually log lead source in CRM for inquiries via email, direct LinkedIn messages, phone calls, referrals, etc. Be specific (e.g., "LinkedIn Message - John Doe", "Referral - Jane Smith Agency").
*   **Goal Configuration (GA4):** Set up goals for key conversions like contact form submissions, clicks on scheduling links (`tel:` or Calendly links), and potentially lead magnet downloads. Ensure these are firing correctly.
*   **CRM Discipline:** Consistently log all leads, their source, qualification status (vs. ICPs), and progression through the sales funnel (Initial Contact > Consultation > Proposal > Won/Lost).
*   **Regular Review:** Dedicate time (e.g., first Monday of the month) to compile data into the dashboard format, analyze trends against baselines and targets, and identify areas for optimization.

_This framework provides the structure for data-driven marketing. Consistent tracking and analysis are crucial for optimizing spend and maximizing return on investment._
