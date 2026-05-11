---
slug: ''
type: '' # new | refresh
pillar: '' # Web Development | Mobile Development | Cloud & DevOps | Software Engineering | Tools & Productivity
target_ship: 'YYYY-MM-DD'
status: 'planned' # planned | drafted | shipped | skipped
calendar_slot: '' # e.g. "Q3 2026 Slot 1"
author: Anthony Coffey
---

# Content brief: [working title]

A short pre-write step. Fill this in before drafting the article body; the goal is to surface the bad ideas before they cost a draft. Lives next to the article during drafting, then gets deleted at merge (or pasted into the PR body for traceability).

Voice rules: [`voice-and-style.md`](../documentation/guides/voice-and-style.md). The brief itself follows them.

## Working title

<!-- One sentence, sentence case. Title-case the article frontmatter title only when the post is ready to ship. -->

## What this demonstrates

<!-- One or two sentences. The work this article shows; not the topic, but the specific decisions or outputs the reader is going to see. If you can't say this without marketing words, the topic isn't ready. -->

## Target queries

<!-- Pull from docs/strategy/seo-audit-2026-Q?-*.md or the latest seo-snapshot JSON. List 3-8 queries the article can plausibly serve. Annotate with audit signal where available. -->

| Query | Source (audit section / signal) | Notes |
| --- | --- | --- |
| `query 1` | striking-distance #N | |
| `query 2` | low-hanging-fruit #N | |

If there is no audit signal, justify the article on editorial grounds (the work is genuinely worth documenting) per SPEC-017 topic-selection methodology step 3.

## Outline

<!-- Heading-level only. h2 sections in order. Each line is one section. -->

- ## Section one
- ## Section two
- ## Section three

## Distinctive angle

<!-- One sentence. What this article does that the existing top results on these queries do not. If the answer is "it explains the topic", that's not an angle, that's a Wikipedia entry. -->

## Internal links

<!-- Inbound: which existing articles will link to this one once it ships. Outbound: which existing articles will this one link to. If both lists are empty, either the pillar is wrong or the topic is too niche to publish. -->

Inbound (existing → new):

-

Outbound (new → existing):

-

## Voice check

- [ ] No em-dashes in the working title or outline
- [ ] No marketing tricolons
- [ ] No closing-flourish section (`## Conclusion`, `## Wrapping up`, etc.) in the outline
- [ ] No "let's dive in" / AI-slop phrasing in the introduction draft

If any box stays unchecked at draft time, rewrite the title and outline before writing the body.

## Refresh-specific fields

<!-- Delete this section for new articles. -->

- **Original `publishedAt`**: YYYY-MM-DD
- **Last refresh**: YYYY-MM-DD (or "never")
- **What's changed since last version**: <!-- one paragraph. What in the article is now wrong, stale, or missing. -->
- **`## Updated YYYY-MM-DD` note for the article body**: <!-- the one-sentence changelog line that will appear near the top of the refreshed article. -->

## Ship checklist

- [ ] Voice check pass (read against [`voice-and-style.md`](../documentation/guides/voice-and-style.md))
- [ ] Frontmatter `category` is one of the canonical pillars
- [ ] Frontmatter `summary` is written (not auto-generated)
- [ ] At least one inbound internal link from an existing article
- [ ] PR title is `content: <slug> [SPEC-017]` (or `content: refresh <slug> [SPEC-017]` for a refresh)
- [ ] PR body cites the audit signal or editorial reasoning that justified the slot
