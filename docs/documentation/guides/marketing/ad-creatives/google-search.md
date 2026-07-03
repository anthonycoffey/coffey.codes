# Google Search Ad Creatives (Examples)

Example responsive search ad (RSA) frameworks and campaign structure for Google Search, targeting the Ideal Client Profiles in [`../uvp.md`](../uvp.md) and routing to the landing pages in [`../icp-landing-page-map.md`](../icp-landing-page-map.md). Measured against [`../tracking.md`](../tracking.md). Copy follows [`../voice-and-style.md`](../voice-and-style.md).

This is Google **Search** advertising (buying keywords, showing text ads to people actively looking). It is unrelated to [`../../google-ads-basic-access.md`](../../google-ads-basic-access.md), which covers Google Ads **API** access for the periscope SEO tool. Do not conflate the two.

Search is the highest-intent channel in the plan: the person is already looking for a developer or a solution, so the ad's job is to be the most relevant, most credible result, not to create desire. That means keyword-to-ad-to-landing-page match matters even more than on Meta, and negative keywords matter as much as the keywords themselves.

## Core principles for Search ads

- **Match intent, not just keywords.** Group tightly so each ad group has one theme, one set of near-identical keywords, and one landing page. A visitor searching "hire senior react developer" and one searching "cheap website builder" are not the same person and must never hit the same ad.
- **Put the keyword in the headline.** Google rewards (and users click) headlines that echo the query. If the ad group is "custom mobile app development," one pinned headline should contain that phrase.
- **Credibility in limited characters.** Every RSA headline is 30 characters, descriptions 90. Anthony's differentiators (12 years, senior engineer, ships production code, Austin) must survive that compression.
- **Negative keywords are the budget guardrail.** At $5/day, a handful of junk clicks burns the day. Exclude job-seeker, freelancer-marketplace, tutorial, salary, and free-tool intent aggressively.
- **Landing-page match.** Route each ad group to the ICP-matched `/lp` page, never the homepage. See [`../landing-page-copywriting.md`](../landing-page-copywriting.md).
- **Conversion tracking before spend.** Import the `form_submit` conversion into Google Ads before launching so bidding can optimize toward leads, not clicks. See [`../paid-ads-conversion-tracking.md`](../paid-ads-conversion-tracking.md).

## Campaign structure

One Search campaign, four ad groups (one per ICP and landing page). This keeps the shared $5/day manageable and the reporting clean.

| Ad group | Example keyword themes (phrase/exact) | Landing page |
| --- | --- | --- |
| Practical AI | ai integration consultant, llm integration developer, ai automation for business, hire ai engineer | `/lp/practical-ai` |
| Custom Web/Mobile | custom web app developer, custom mobile app development, senior full stack developer for hire | `/lp/sme-web-mobile` |
| Small-business web | small business website developer, professional business website, website with analytics setup | `/lp/smb-web-marketing` |
| Senior contract dev | contract senior developer, staff augmentation developer, lead developer for hire, embedded engineer | `/lp/strategic-partners` |

**Bidding:** Start on Maximize Clicks with a low max-CPC cap while the account has zero conversion history, or Manual CPC if you want tighter control. Switch to Maximize Conversions or Target CPA only after the account has accumulated enough `form_submit` conversions for smart bidding to learn (typically 15 to 30 in 30 days, which at this budget may take a while). Do not start on a conversion-based smart-bidding strategy with no conversion data.

**Match types:** Start with phrase and exact match, not broad. Broad match on a $5/day budget with no conversion signal will spend on irrelevant queries. Revisit broad only after smart bidding has conversion data to steer it.

## Negative keyword starter list

Apply at the campaign level and expand weekly from the search-terms report:

`free, cheap, salary, jobs, job, career, hiring, resume, intern, internship, course, tutorial, learn, certification, template, wordpress theme, fiverr, upwork, freelancer.com, wix, squarespace, ppt, example, what is`

Review the actual search-terms report every week for the first month; that report, not guesswork, is where the real negative list comes from.

## RSA copy: assets by ad group

Provide Google 10 to 15 headlines and 3 to 4 descriptions per ad group and let it assemble. Pin only where a headline must always show (for example the keyword headline in position 1). Examples below are starting assets, not the full set.

### Ad group: Practical AI -> `/lp/practical-ai`

- **Headlines (30 char max each):** AI Integration, Done Right | Ship Practical AI, Not Hype | Senior AI Engineer, 12 Yrs | Production-Ready AI Builds | LLM & Automation Experts | Hands-On AI Engineering | Austin-Based AI Developer
- **Descriptions (90 char max each):** Cut through the AI hype. A senior engineer integrates practical, production-ready AI. | 12 years shipping real software. LLM features, automation, and custom AI tools that run. | No slide decks. Working code, built on a solid engineering foundation. Book an intro call.
- **CTA/final URL:** `/lp/practical-ai` with the campaign UTM (see [`../tracking.md`](../tracking.md)).

### Ad group: Custom Web/Mobile -> `/lp/sme-web-mobile`

- **Headlines:** Custom Web & Mobile Apps | Senior Full-Stack Developer | Built Right, Delivered On Time | 12 Years, Hands On Keyboard | Stop Fighting Unreliable Tech | Apps That Scale With You | No Junior Bait-and-Switch
- **Descriptions:** One senior engineer owns delivery end to end. Custom web and mobile apps that last. | Tired of stalled projects and agency churn? Get dependable, on-time delivery. | 12 years building production systems. Book a free intro call to scope your project.
- **Final URL:** `/lp/sme-web-mobile`

### Ad group: Small-business web -> `/lp/smb-web-marketing`

- **Headlines:** Small Business Websites | A Site That Wins Customers | Web Plus Analytics Setup | Austin Web Developer | Professional, Not Templated | Built By a Senior Engineer | Sites That Do More Than Sit
- **Descriptions:** A professional website wired with the analytics to show what actually works. | Your site should bring you customers, not just exist. Built by a senior engineer. | Austin-based, 12 years, local accountability. Book a free intro call.
- **Final URL:** `/lp/smb-web-marketing`

### Ad group: Senior contract dev -> `/lp/strategic-partners`

- **Headlines:** Senior Developer On Retainer | Ship Without the Hiring Loop | Lead Dev, Hands On Keyboard | 12 Years, No Ramp Needed | Embedded Senior Engineer | Staff Augmentation, Senior | Own Complex Builds End to End
- **Descriptions:** Plug in a senior/lead developer without running a 6-month hiring loop. | Architecture, DevOps, and AI work owned end to end. No ramp, no overhead. | 12 years shipping production systems. Book a call to scope the engagement.
- **Final URL:** `/lp/strategic-partners`

## Ad extensions (assets)

Set these up once; they lift CTR at no extra cost:

- **Sitelinks:** Case Studies (`/case-studies`), Portfolio (`/portfolio`), About/Contact.
- **Callouts:** 12+ Years Experience, Senior Engineer, On-Time Delivery, Austin-Based, No Bait-and-Switch.
- **Structured snippets:** Services -> Web Apps, Mobile Apps, AI Integration, Automation.
- **Call extension** if you want phone leads (matches the phone field on the lead form).

## Testing & Optimization

- **Weekly for month one:** mine the search-terms report, add negatives, and confirm the traffic is on-intent before touching bids.
- **A/B:** let the RSA rotate assets; add and remove headlines based on the asset-strength and impression data rather than guessing.
- **Watch:** CTR, cost per `form_submit`, and lead quality in the CRM. On Search, a rising cost-per-lead usually means either intent drift (fix with negatives) or a landing-page mismatch (fix the page, per [`../landing-page-copywriting.md`](../landing-page-copywriting.md)).

## Related

- [`../icp-landing-page-map.md`](../icp-landing-page-map.md), which ad group routes to which page
- [`../paid-ads-conversion-tracking.md`](../paid-ads-conversion-tracking.md), importing `form_submit` as a Google Ads conversion
- [`../tracking.md`](../tracking.md), UTM conventions and KPIs
- [`../../google-ads-basic-access.md`](../../google-ads-basic-access.md), the unrelated Google Ads API access doc (do not confuse)
- [`meta.md`](meta.md), [`linkedin.md`](linkedin.md), [`reddit.md`](reddit.md), the other channels
