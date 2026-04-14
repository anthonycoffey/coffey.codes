# Lead Capture Strategies

This document outlines strategies for converting website visitors and prospects into qualified leads, supporting the goals defined in `marketing-advertising-strategy.md`.

## Core Principle

Make it easy and compelling for potential clients (ICPs) to initiate contact or express interest at various stages of their journey.

## Website Conversion Elements (`coffey.codes`)

*   **Primary Call-to-Action (CTA): "Schedule a Strategy Call" / "Book a Consultation"**
    *   **Placement:** Prominently on the Homepage, Service Pages (Web/Mobile, AI), Contact Page, potentially at the end of relevant Blog Posts/Case Studies.
    *   **Mechanism:** Link to a scheduling tool (e.g., Calendly) or the Contact Page with clear instructions.
    *   **Goal:** Encourage high-intent prospects ready to discuss specific needs.
*   **Secondary CTA: "Discuss Your Project" / "Request a Quote"**
    *   **Placement:** Contact Page, potentially Service Pages.
    *   **Mechanism:** Link to the Contact Form (`components/ContactForm.tsx`).
    *   **Goal:** Capture prospects who prefer asynchronous communication or have specific project details to share.
*   **Tertiary CTA (Lead Magnet): "Download [Resource]"** (e.g., "AI Readiness Checklist", "Guide to Modernizing Legacy Systems")
    *   **Placement:** Relevant Blog Posts, potentially a dedicated Resources section (future).
    *   **Mechanism:** Simple form requesting Name and Email in exchange for the downloadable PDF/resource. Use an email marketing service (e.g., Mailchimp, ConvertKit free tier) or a simple API route for collection.
    *   **Goal:** Capture interest from prospects earlier in the funnel, build an email list for nurturing. (Requires content creation - see `content-calendar.md`).
*   **Contact Form (`components/ContactForm.tsx`)**
    *   **Fields:** Keep it simple: Name, Email, Company (Optional), Message/Project Details.
    *   **Backend:** Needs implementation (API route or third-party service) to reliably send notifications.
    *   **Confirmation:** Display a clear success message upon submission.

## LinkedIn Lead Capture

*   **Profile CTA:** Ensure the LinkedIn profile has clear contact information and potentially a link to the website's contact/scheduling page.
*   **Direct Messaging:**
    *   **Template (Initial Connection):** Personalize connection requests. Mention shared connections, relevant content, or specific company initiatives if possible. Avoid immediate sales pitches.
    *   **Template (Post-Connection/Content Engagement):** If someone engages with content, follow up: "Thanks for [liking/commenting on] my post about [Topic]. Glad you found it useful. Curious, how is your team approaching [Related Challenge]?"
    *   **Goal:** Initiate conversations, build rapport, identify potential needs organically.
*   **LinkedIn Ads:** Use Lead Gen Forms (if available and appropriate for the offer) or direct traffic to website landing pages with clear CTAs.

## Lead Qualification Criteria (Initial)

*   **Source:** Where did the lead come from? (Website Form, LinkedIn Message, Referral, Ad Click, etc.) - Track in CRM/Spreadsheet.
*   **ICP Fit:** Does the inquiry align with ICP1 (SME, Web/Mobile Need) or ICP 2 (Business, AI Interest)? Consider company size, industry, stated need.
*   **Urgency/Clarity:** How clear is the stated need or project? Is there a defined timeline?
*   **Budget:** (Difficult to gauge initially) Is the company size/type likely to have the budget for custom development/consulting?

## Initial Follow-Up Sequence (Example for Website Form Inquiry)

1.  **Immediate:** Automated confirmation email (if possible via form backend) - "Thanks for reaching out! I've received your message and will respond within 1 business day."
2.  **Within 1 Business Day:** Personalized email response.
    *   Acknowledge their message.
    *   If need is clear: Suggest scheduling a brief call ("Strategy Call") to discuss further. Provide scheduling link.
    *   If need is unclear: Ask 1-2 clarifying questions to better understand their goals/challenges.
3.  **Follow-up (if no response after 3-4 days):** Brief, polite follow-up email. "Just checking in on my previous message. Let me know if you'd like to schedule a brief chat this week."
4.  **Nurturing (If not ready):** If they downloaded a lead magnet or expressed interest but aren't ready, add them to an email list (with permission) for future content updates/newsletters.

_Lead capture mechanisms and follow-up processes should be reviewed and refined based on conversion rates and lead quality data tracked in `tracking.md`._
