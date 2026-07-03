# Landing-page copywriting

How to write the `/lp` ad landing pages. These are conversion surfaces for paid traffic, so this guide is the one place on the site where selling is the job (see [`voice-and-style.md`](../voice-and-style.md) Rule 6 for the carve-out). Every other voice rule still applies: no em-dashes, no marketing tricolons, no AI-slop phrasing, specific over general. A landing page that reads like a template has failed the voice check even if it converts.

Which page targets which audience and carries which promise lives in [`icp-landing-page-map.md`](icp-landing-page-map.md). This guide is the how, that doc is the what.

## The one rule that matters most: message match

The landing page must continue the exact promise of the ad the visitor clicked. If the Meta ad said "Cut through the AI hype," the H1 says a version of "Cut through the AI hype," not "Welcome to coffey.codes." A visitor who feels a mismatch in the first two seconds bounces, and you paid for that click. Every ad creative names its destination LP in [`ad-creatives/meta.md`](ad-creatives/meta.md) and [`ad-creatives/google-search.md`](ad-creatives/google-search.md); keep the headline, the promise, and the CTA verb consistent across ad and page.

## Page structure (top to bottom)

The current `/lp` pages already follow most of this. Order matters because paid visitors read in a fixed sequence: what is this, why you, prove it, what do I do next.

1. **Hero.** One H1 promise, one sub-headline that adds the mechanism or the who-it-is-for, and the primary CTA visible without scrolling. The headshot and name card establish that a real senior person does the work, not an agency pool.
2. **Benefits.** Three to five outcome statements, each with a one-line supporting clause. Not a feature list. See below.
3. **Proof.** Social proof placed immediately after the benefits, before the visitor has to decide. Testimonials, client logos, a named result, or links to case studies and portfolio.
4. **Lead form.** The form is the conversion. It sits in the hero's second column on desktop so it is visible early, and repeats or anchors near the bottom CTA.
5. **Close.** A final CTA section (the booking call) for visitors who scrolled the whole page and are ready.

## Headlines

The H1 does one job: make a specific, believable promise to one audience. Formulas that fit Anthony's voice and the Dependable Transformation narrative:

- **Kill the objection, then promise:** "Stop fighting unreliable tech. Get custom apps that fuel growth." (Names the pain, then the outcome.)
- **Cut-the-hype:** "Cut through the AI hype. Get AI that actually ships." (Works for the AI ICP where skepticism is the buying emotion.)
- **Capacity without the loop:** "Plug in a senior developer without the hiring loop." (For the staff-augmentation ICP.)
- **Outcome-first:** "A website that works to bring you customers, not just sit there." (For the SMB web ICP.)

Rules for headlines:

- One promise. If the headline has an "and" joining two unrelated outcomes, split into H1 and sub-headline.
- Concrete noun over abstraction. "Custom apps" beats "digital solutions." "12 years shipping production systems" beats "extensive experience."
- No tricolons (`fast, reliable, scalable`). Pick the one true adjective. This is Rule 2 and it is the fastest way to spot template copy.
- The sub-headline earns the headline: it names the mechanism ("built directly by a senior engineer, not handed to a junior") or the who ("for established SMEs tired of agency churn").

## Benefits, not features

A feature is what you build. A benefit is what changes for the client. Lead with the benefit; use the feature as proof.

- Feature: "Node.js, Python, React Native, cloud infrastructure."
- Benefit: "One senior engineer owns the whole stack, so nothing falls through the cracks between a front-end shop and a back-end contractor." (Feature named inside the proof.)

Each benefit block on the page is one bolded outcome plus one supporting clause. Five is the ceiling; three sharp ones beat five soft ones. Tie each to the ICP's actual anxiety (unreliable developers, AI that never ships, slow hiring, a website that does nothing).

## Social proof

Proof is the difference between a promise and a claim. In priority order of persuasive weight:

1. A named, specific client result ("cut dispatcher latency from 4 round-trips to 1").
2. A testimonial that mentions reliability or on-time delivery (the two things every ICP fears losing).
3. Client logos.
4. Links to `/case-studies` and `/portfolio` (open in a new tab so the visitor keeps the LP open). The lead form links to both for exactly this reason.

Place proof right after the benefits and again near the final CTA. Do not bury it below the fold as an afterthought.

## Objection handling

Every ICP arrives with the same three doubts. Address them in the copy without naming them as objections:

- **"Will this actually get delivered?"** Answer with the on-time / on-spec framing and the case-study links. This is the core Project Certainty promise.
- **"Am I getting a senior person or a junior?"** Answer with "built directly by a senior engineer, hands on the keyboard, no bait-and-switch." This is already the differentiator across every LP.
- **"Is this worth the cost?"** Answer with outcome and ROI language, and let the budget dropdown in the form qualify fit rather than arguing price on the page.

## Form-field discipline

Every field costs you submissions; every field you drop costs you qualification. The `LeadForm` component resolves this with a deliberate set: name, email, company, phone, a project brief, and three qualifying dropdowns (project stage, timeline, budget). Rationale:

- Required fields are the minimum to reply and qualify: name, email, brief, and the three dropdowns. Company and phone are optional so an interested visitor is never blocked.
- The dropdowns do double duty. They qualify the lead before the call, and they signal that Anthony thinks in terms of the delivery lifecycle (stage), commitments (timeline), and fit (budget). That signal is itself persuasion for a buyer who fears an amateur.
- Do not add fields that you will not act on. If a field would not change how you reply or whether you take the call, cut it.

## Benchmarks

Targets for paid traffic to these pages, so you know whether the copy is working. These are starting reference points for B2B service landing pages, not guarantees; replace with your own baselines once GA4 has data (see [`tracking.md`](tracking.md) and [`../../../strategy/ga4-events.md`](../../../strategy/ga4-events.md)).

- **Landing-page conversion rate (session to `form_submit`):** 2 to 5 percent is a healthy band for warm, well-matched B2B paid traffic. Below 2 percent, suspect message mismatch or a weak headline before you blame the offer. Cold, broadly targeted traffic can sit around 1 percent.
- **Bounce rate:** above 50 to 60 percent on paid traffic usually means the ad and the H1 do not match, or the page is slow.
- **The number that actually matters:** cost per qualified lead, not raw conversion rate. A page converting at 2 percent with qualified leads beats one converting at 6 percent with tire-kickers. The budget and stage dropdowns exist to make this measurable.

At $5/day per platform, conversion volume will be small for weeks. Judge early results on message match and lead quality, not statistically thin conversion-rate deltas.

## Before you ship a page

Read the draft once against the seven rules in [`voice-and-style.md`](../voice-and-style.md). Then check message match against the ad that points to it. Then confirm the CTA verb is identical on the ad, the hero, and the close. If all three pass, ship it.

## Related

- [`voice-and-style.md`](../voice-and-style.md), the seven rules and the Rule 6 landing-page carve-out
- [`icp-landing-page-map.md`](icp-landing-page-map.md), which page targets which ICP and carries which UVP
- [`uvp.md`](uvp.md), the four ICPs and their tailored value propositions
- [`ad-creatives/meta.md`](ad-creatives/meta.md) and [`ad-creatives/google-search.md`](ad-creatives/google-search.md), the ad copy that must match these pages
- [`tracking.md`](tracking.md), UTM conventions and the KPIs these pages are measured against
