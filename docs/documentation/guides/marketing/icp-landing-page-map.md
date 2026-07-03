# ICP to landing-page map

The single source of truth for which `/lp` page targets which Ideal Client Profile, what promise it carries, and where its paid traffic comes from. When you write ad copy ([`ad-creatives/meta.md`](ad-creatives/meta.md), [`ad-creatives/google-search.md`](ad-creatives/google-search.md)) or rewrite a landing page ([`landing-page-copywriting.md`](landing-page-copywriting.md)), start here. The four ICPs are defined in [`uvp.md`](uvp.md).

## The mapping

There are four live landing pages under `app/lp/`, and they map one-to-one onto the four ICPs. (Note: the original ask referenced "3 landing pages." All four are live and treated as in-scope here; confirm before retiring any.)

| Landing page | Route | ICP | Core pillar | One-line promise |
| --- | --- | --- | --- | --- |
| Practical AI | `/lp/practical-ai` | ICP 2: Forward-thinking businesses seeking real AI results | Practical AI Advantage | Cut through the AI hype and ship production-ready AI. |
| SME Web & Mobile | `/lp/sme-web-mobile` | ICP 1: Established SMEs seeking growth and reliability | Project Certainty | Custom web and mobile apps that reliably fuel growth. |
| SMB Web & Marketing | `/lp/smb-web-marketing` | ICP 3: SMBs needing an effective, integrated web presence | Integrated Tech for Results | A professional site that actually attracts and converts. |
| Strategic Partners | `/lp/strategic-partners` | ICP 4: Teams needing senior IC capacity | Senior Hands on the Keyboard | Plug in a lead developer without the hiring loop. |

## Per-page detail

### `/lp/practical-ai` -> ICP 2 (Practical AI)

- **Who:** Forward-thinking businesses (CTOs, CIOs, Heads of Innovation, eng managers) ready to use AI but tired of hype and failed experiments. Buyers of a senior engineer who ships the AI work, not a slide deck.
- **UVP carried (from `uvp.md`):** Practical AI Advantage. Production-ready AI built with disciplined, senior-level expertise; robust, integrated, measurable.
- **Primary anxiety to answer:** "AI projects never make it to production." Answer with engineering rigor and shipped-work proof.
- **`LeadForm` attribution:** `formName="lp_practical_ai"`.
- **Traffic:** Meta interest/lookalike audiences for AI-curious decision-makers; Google Search on high-intent AI-implementation terms. See ad-creative docs.

### `/lp/sme-web-mobile` -> ICP 1 (Project Certainty)

- **Who:** Established SMEs tired of unreliable developers and agency churn, needing custom web and mobile applications that reliably fuel growth.
- **UVP carried:** Project Certainty plus Built for Future Growth. A senior developer who owns delivery, 12 years of experience, no junior bait-and-switch.
- **Primary anxiety to answer:** "The last team missed the deadline and left a mess." Answer with reliability, ownership, and on-time/on-spec delivery.
- **`LeadForm` attribution:** `formName="lp_sme_web_mobile"`.
- **Traffic:** Google Search on custom-development and app-development intent; Meta for growth-stage SME owners.

### `/lp/smb-web-marketing` -> ICP 3 (Integrated Tech for Results)

- **Who:** Small to medium businesses needing a professional web presence that works to attract and convert customers, combined with analytics/tracking setup.
- **UVP carried:** Integrated Tech for Results. Expert web development plus essential marketing-tech setup so the site is a dependable growth engine.
- **Primary anxiety to answer:** "My website just sits there and does nothing." Answer with the site-as-engine framing and the web-plus-analytics bundle.
- **`LeadForm` attribution:** `formName="lp_smb_web_marketing"`.
- **Traffic:** Google Search on local and small-business web-development terms; Meta for local SMB owners.

### `/lp/strategic-partners` -> ICP 4 (Senior Hands on the Keyboard)

- **Who:** Startups, agencies, and tech teams needing experienced hands to ship a critical project without ramp. Buyers: CTOs, VPs of Engineering, agency owners.
- **UVP carried:** Senior Hands on the Keyboard. A senior/lead developer on retainer who owns complex architecture, DevOps, and AI work end to end. Explicitly not a Fractional CTO seat (see the "what this is NOT" note in `uvp.md`).
- **Primary anxiety to answer:** "I need senior capacity now and cannot run a 6-month hiring loop." Answer with no-ramp, embedded, lead-level execution.
- **`LeadForm` attribution:** `formName="lp_strategic_partners"`.
- **Traffic:** LinkedIn (already documented in `ad-creatives/linkedin.md`) is the strongest fit for this ICP; Google Search on staff-augmentation and contract-senior-developer terms.

## How this drives the rest of the funnel

- **Ad copy** must carry the same pillar and promise as its destination page. The ad-creative docs are organized by ICP; use this table to route each ad set to the right `/lp` URL with the right UTM (see [`tracking.md`](tracking.md)).
- **Conversion attribution** uses the per-page `formName` values above, which flow into the `form_submit` GA4 event. See [`../../../strategy/ga4-events.md`](../../../strategy/ga4-events.md).
- **Copy rewrites** (Phase 2) pull the who, the pillar, and the anxiety from this doc so each page stays distinct and on-ICP.

## Related

- [`uvp.md`](uvp.md), the four ICPs and their tailored UVP statements
- [`landing-page-copywriting.md`](landing-page-copywriting.md), how to write these pages
- [`ad-creatives/meta.md`](ad-creatives/meta.md), [`ad-creatives/google-search.md`](ad-creatives/google-search.md), [`ad-creatives/linkedin.md`](ad-creatives/linkedin.md), [`ad-creatives/reddit.md`](ad-creatives/reddit.md), the ad copy per channel
- [`tracking.md`](tracking.md), UTM conventions that tie ad to page to conversion
