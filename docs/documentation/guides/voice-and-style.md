---
title: 'Voice and style'
spec: SPEC-017
audience: 'humans drafting copy; AI agents drafting or refreshing articles'
status: living-document
---

# Voice and style

One page. Every article, landing page, and homepage block on coffey.codes follows these rules. Short on purpose, because long style guides erode in practice. When in doubt, the rule below wins.

One exception, spelled out in Rule 6: the `/lp` ad landing pages are conversion surfaces. Rule 6 (no selling) does not apply to them. Every other rule does.

## The seven rules

### 1. No em-dashes

Use commas, periods, parentheses, or two sentences. The em-dash reads as AI-generated rhetorical filler and is forbidden across the site.

Bad: `The audit found something interesting — three of the top four articles are declining.`

Good: `The audit found something interesting: three of the top four articles are declining.`

Or: `The audit found something interesting. Three of the top four articles are declining.`

### 2. No marketing tricolons

Patterns like `fast, reliable, scalable` or `clean, modern, maintainable` are decoration. Pick the one adjective that's true and drop the rest.

Bad: `A fast, reliable, scalable way to ship features.`

Good: `A way to ship features that doesn't break in production.`

### 3. No closing-flourish summaries

End the article when the work is done. Do not write a `## Wrapping up` or `## Key takeaways` section that re-states the body. If the reader wants a TL;DR, they will scroll up. The article ends on the last technical point.

### 4. No parallel-structure decoration

A list of three rhetorical pairs is decoration, not information. Use a list only when the items are genuinely items (steps, options, files, results), not when they're a rhythm pattern.

Bad: `Plan the work, do the work, ship the work.`

Good: Whatever the actual steps are, named precisely.

### 5. No AI-slop tone

Banned phrases (non-exhaustive): `let's dive in`, `in the world of X`, `imagine a world where`, `the importance of X cannot be overstated`, `buckle up`, `at the end of the day`, `it's worth noting that`, `in conclusion`, `to summarize`, `the journey`, `unlock the power of`, `game changer`, `paradigm shift`.

The voice check is: does this read like Anthony wrote it, or like a pattern-completing model wrote it? If the latter, rewrite or delete.

### 6. No selling (articles only)

Articles describe work. They do not invite the reader to hire the author. No `If you'd like to discuss this, contact me`, no `Need help with X? Let's chat`, no CTAs at the bottom of an article. On the editorial surface, the contact form is the only invitation and it lives in the nav.

Win Without Pitching posture: present, do not pursue. The article ends; it does not push.

**This rule is scoped to articles, the homepage, and service pages.** It does not apply to the `/lp` ad landing pages. Those pages exist to convert paid traffic into a booked call or a form submission, so headlines that make a promise, benefit copy, social proof, a lead form, and repeated CTAs are all expected there. The Win Without Pitching posture governs the content the site publishes to earn trust; the landing pages are where paid intent is met with a direct next step. Keep them honest and specific, but they are allowed to sell.

Everything else in this guide still governs landing-page and ad copy: no em-dashes (Rule 1), no marketing tricolons (Rule 2), no parallel-structure decoration (Rule 4), no AI-slop tone (Rule 5), and specific over general (Rule 7). A landing page that reads like every other agency's landing page has failed the voice check even if it converts. See [`marketing/landing-page-copywriting.md`](marketing/landing-page-copywriting.md) for the landing-page copy standard and [`marketing/icp-landing-page-map.md`](marketing/icp-landing-page-map.md) for which page says what.

### 7. Specific over general

Replace abstractions with the specific thing. `The system was slow` is empty; `Each dispatcher request triggered four sequential database round-trips` is the point. Numbers, names, file paths, and code snippets are stronger than adjectives.

## Inline code

Backtick anything that is a literal code token, file path, function name, env var, CLI flag, or a verdict string from one of the keyword tools (`WELL_TARGETED`, `OPPORTUNITY`, etc.). The MDX pipeline and the case-study renderer both turn single-backtick spans into `<code>`.

## Heading style

Sentence case for h2 and h3 (`## Why this matters`, not `## Why This Matters`). Title case is reserved for the article `title` frontmatter field.

## Voice check before merge

Read the draft once through against these seven rules before opening the PR. The author is the reviewer; this guide is the standard. If the draft reads like work, ship it. If it reads like marketing, rewrite it.

## Related

- [SPEC-017](../../specs/active/SPEC-017-content-strategy.md), the spec that owns this guide
- [`content-disposition.md`](../../strategy/content-disposition.md), per-article bucket decisions
- [`editorial-calendar.md`](../../strategy/editorial-calendar.md), Q3 and Q4 slots
