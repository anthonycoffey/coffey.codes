# Meta Ad Creatives (Examples)

Example ad copy frameworks for Meta (Facebook and Instagram) campaigns, targeting the Ideal Client Profiles in [`../uvp.md`](../uvp.md) and routing to the landing pages in [`../icp-landing-page-map.md`](../icp-landing-page-map.md). Test and refine against the KPIs in [`../tracking.md`](../tracking.md). All copy follows [`../voice-and-style.md`](../voice-and-style.md): no em-dashes, no tricolons, no AI-slop, specific over general.

Meta is not "unsuitable" for this business. It is a low-CPM interruption channel: the audience is not searching for a developer, so the ad has to create the want by naming a pain the viewer already feels. That is different from Google Search (high intent, documented in [`google-search.md`](google-search.md)) and from LinkedIn (precise B2B titles, documented in [`linkedin.md`](linkedin.md)). Meta's strength here is cheap reach to SMB and SME owners and AI-curious operators; its weakness is looser targeting, so the creative and the landing-page match do more of the qualifying work.

## Core principles for Meta ads

- **Interrupt with a pain, not a pitch.** The first line of primary text has to stop the scroll by naming a problem the viewer recognizes. "Your last developer ghosted you mid-project" outperforms "Senior full-stack engineer available."
- **Lead with the person.** Meta rewards native, human creative. A real photo of Anthony and a first-person voice beats a polished agency graphic. This also reinforces the "senior hands on the keyboard, no bait-and-switch" differentiator.
- **One ICP per ad set.** Do not blend the AI message and the web message in one ad. Each ad set maps to one ICP and one landing page.
- **Message match is non-negotiable.** The ad headline and the landing-page H1 carry the same promise and the same CTA verb. A mismatch wastes the click you paid for. See [`../landing-page-copywriting.md`](../landing-page-copywriting.md).
- **Mobile-first.** Most Meta impressions are on a phone. Keep primary text front-loaded (the strongest line first, before the "See more" fold), use 1:1 or 4:5 images and 9:16 for Stories/Reels.
- **Objective and conversion event.** Use the Sales or Leads objective optimized for the `form_submit` conversion once the Meta Pixel and conversions API are live (see [`../paid-ads-conversion-tracking.md`](../paid-ads-conversion-tracking.md)). At $5/day, expect a slow learning phase; do not judge or restructure an ad set before it has meaningful data.
- **CTA button:** "Learn More" or "Book Now" depending on the landing-page action.

## Field structure of a Meta ad

Each example below gives: **Primary text** (the body above the image), **Headline** (bold line under the image), **Description** (optional sub-line), **Creative** (the visual), **Destination**, and **CTA button**.

## Ad Examples: ICP 2 (Practical AI) -> `/lp/practical-ai`

- **Audience:** Business owners, founders, ops and innovation leaders, 30 to 55, interests around AI tools, automation, SaaS, business software. Broad interest targeting plus a lookalike of past site converters once the Pixel has volume.

### Ad 2.1 (Focus: cut the hype)

- **Primary text:** Everyone is selling you AI. Almost nobody ships it. I am a senior engineer with 12 years building production software, and I integrate practical AI (LLM features, automation, custom tools) into your business so it actually runs in production, not in a demo. Working code, not a slide deck.
- **Headline:** Cut through the AI hype. Get AI that ships.
- **Description:** Production-ready AI, built by a senior engineer.
- **Creative:** Photo of Anthony at work, or a clean single-image graphic. Avoid stock "glowing brain" AI clip art.
- **Destination:** `/lp/practical-ai`
- **CTA button:** Learn More

### Ad 2.2 (Focus: automation ROI)

- **Primary text:** If your team is doing the same manual task 200 times a week, that is an automation you have not built yet. I scope and ship real AI automations (workflow integration, data processing, internal tools) on a solid engineering foundation. Senior engineer, hands on the keyboard, no hype.
- **Headline:** Automate the work your team keeps redoing.
- **Description:** Practical AI with measurable ROI.
- **Creative:** Simple before/after or process-flow graphic.
- **Destination:** `/lp/practical-ai`
- **CTA button:** Learn More

## Ad Examples: ICP 1 (SME Web & Mobile) -> `/lp/sme-web-mobile`

- **Audience:** Established small and mid-size business owners and operators, interests around business growth, e-commerce platforms, SaaS, project management. Age 30 to 55.

### Ad 1.1 (Focus: reliability)

- **Primary text:** Tired of unreliable developers and projects that stall? Bring on one senior engineer who owns delivery end to end. 12 years building custom web and mobile apps that hold up in production. No agency churn, no junior bait-and-switch, no surprises at the deadline.
- **Headline:** Stop fighting unreliable tech.
- **Description:** Custom apps built to last, delivered on time.
- **Creative:** Photo of Anthony, or a clean product-UI mockup.
- **Destination:** `/lp/sme-web-mobile`
- **CTA button:** Learn More

### Ad 1.2 (Focus: growth)

- **Primary text:** Your business outgrew the tool you started with. I build custom web and mobile applications designed to scale with you, so the software stops being the thing that holds growth back. Senior engineer, 12 years, hands on the keyboard from day one.
- **Headline:** Apps built for where your business is going.
- **Description:** Senior engineering, dependable delivery.
- **Creative:** Growth-themed graphic or device mockup.
- **Destination:** `/lp/sme-web-mobile`
- **CTA button:** Learn More

## Ad Examples: ICP 3 (SMB Web & Marketing) -> `/lp/smb-web-marketing`

- **Audience:** Local and small-business owners, interests around small business, marketing, Google Business, Squarespace/Wix/WordPress. Layer local geo-targeting (Austin and surrounding) where it fits.

### Ad 3.1 (Focus: the site that does nothing)

- **Primary text:** Your website should bring you customers, not just sit there looking fine. I build professional sites wired with the analytics and tracking that show you what is actually working, so your site becomes a dependable part of getting business, not a brochure you paid for once.
- **Headline:** A website that works to bring you customers.
- **Description:** Web development plus the tracking to prove it.
- **Creative:** Clean site mockup on a laptop, or Anthony photo.
- **Destination:** `/lp/smb-web-marketing`
- **CTA button:** Learn More

### Ad 3.2 (Focus: local + accountable)

- **Primary text:** Need a professional website from someone who picks up the phone? Austin-based senior engineer, 12 years, building sites for local businesses with the analytics setup most shops skip. Local accountability, no offshore handoff.
- **Headline:** A professional site, built by someone you can reach.
- **Description:** Austin-based. Senior engineer. Dependable.
- **Creative:** Austin-flavored or personal photo.
- **Destination:** `/lp/smb-web-marketing`
- **CTA button:** Learn More

## Note on ICP 4 (Strategic Partners)

The staff-augmentation ICP (agencies, tech teams hiring senior IC capacity) converts best on LinkedIn's title-level targeting, not Meta's interest targeting. Run that ICP through [`linkedin.md`](linkedin.md) and Google Search. If you test it on Meta, target agency-owner and startup-founder interests and route to `/lp/strategic-partners`, but expect weaker fit than the other three ICPs.

## Testing & Optimization

- **A/B test in this order:** creative (image and the first line of primary text) first, since it drives the most variance on Meta; then headline; then audience; then CTA button.
- **Structure:** one campaign per ICP, one ad set per audience, two to three ads per ad set. Keep it small so the $5/day budget is not split into slivers that never exit the learning phase.
- **Watch:** CTR and cost per `form_submit`, then lead quality in the CRM (per [`../tracking.md`](../tracking.md)). A cheap click that never becomes a qualified lead is not cheap.
- **Iterate:** pause the weakest ad only after it has spent enough to be judged, double down on the winner, and always keep the landing page matched to the live winning creative.

## Related

- [`../icp-landing-page-map.md`](../icp-landing-page-map.md), which ad routes to which page
- [`../landing-page-copywriting.md`](../landing-page-copywriting.md), the page the click lands on
- [`../paid-ads-conversion-tracking.md`](../paid-ads-conversion-tracking.md), Meta Pixel and conversions setup
- [`../tracking.md`](../tracking.md), UTM conventions and KPIs
- [`google-search.md`](google-search.md), [`linkedin.md`](linkedin.md), [`reddit.md`](reddit.md), the other channels
