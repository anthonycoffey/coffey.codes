---
id: SPEC-022
title: 'Three.js portfolio article: add anonymized outreach outcome section'
status: review-pending
created: 2026-05-12
author: Anthony Coffey
reviewers: []
affected_repos: [coffey.codes]
---

## Reviewer Notes

<!-- Leave empty until code review. -->

---

# Feature: Anonymized outreach outcome section for the Three.js portfolio article

## Problem

The article at `app/(site)/articles/posts/three-js-portfolio-website-for-software-engineer.mdx` (published 2026-05-10) argues that the rebuilt portfolio converts better than the old vertical-brochure homepage did. It makes the claim but shows no evidence.

Two cold outreach messages went out on 2026-05-10 via a LinkedIn Sales Navigator trial. One returned a same-day reply from a founder who had clearly looked at the rebuilt site and named specific things he liked about it. That reply is direct external evidence for the article's thesis: the portfolio, not the copy, did the work.

The article needs an outcome section that lets the artifacts (outbound + reply) speak. Constraints that shape the solution:

- The reply was a private LinkedIn DM. No public attribution of the founder, his company, or phone numbers.
- No `n=2` conversion-rate chart. One reply out of two is an anecdote, not a statistic; rendering it as a chart is the marketing flourish the site avoids.
- Voice must match the rest of the article: specific, dry, no closing flourishes, no tricolons, no em dashes.
- "Present don't pursue." Show the artifact; do not sell off it.

Publication is gated on an upcoming call with the founder. Draft now, merge after.

## Requirements

### Must have

1. WHEN a reader visits `/articles/three-js-portfolio-website-for-software-engineer`, the page SHALL render a new `## Did it work?` section between the existing `## Why it works better` and `## What this is not` sections.
2. The new section SHALL contain, in order: a short framing paragraph (cold outreach via LinkedIn Sales Navigator trial on 2026-05-10), the outbound message as a `Callout`/blockquote with the founder's name, the recipient company, and the sender's phone number redacted or removed, the reply as a separate `Callout`/blockquote with no name, no company, no phone number, and no LinkedIn handle, and a short closing paragraph (two to three sentences) noting what the reply confirmed.
3. The reply SHALL be attributed inline as "a founder of an enterprise AI company, day 67, ~$561k MRR." Profanity in the reply stays verbatim; sanitizing it would make the artifact read as stage-managed.
4. Zero PII in the rendered output. WHEN `git grep -i -E "anderson|oxagen|628.?236|737.?932"` is run against the changed file, it SHALL return no matches inside the new section.
5. The article PR SHALL stay unmerged until after the scheduled call. WHEN the call concludes, the closing paragraph is updated to reflect the real outcome before merge.

### Nice to have

- While the file is open, fix the typo `forgetable` → `forgettable` (existing line 41) and replace the em dash on the same line with comma- or period-split prose. Both predate this spec; the em dash violates the standing voice rule.

### Non-goals (what this does NOT do)

- This spec does NOT add a new entry to `app/(site)/case-studies/case-studies.ts`. A case study implies a completed engagement.
- This spec does NOT add a "Before vs After Cold Outreach Conversion Rate" chart. `n=2` is an anecdote, not data.
- This spec does NOT add a homepage testimonial section.
- This spec does NOT introduce new MDX components. `Callout` (already registered in `components/mdx.tsx`) or a plain `>` blockquote is sufficient.
- This spec does NOT involve reaching out to the founder for permission. Anonymization removes the need.
- This spec does NOT rename the article, change its slug, or change its `publishedAt` date.

## Design

**Insertion point.** Between the existing `## Why it works better` section (which closes after the line about testimonials moving to `/portfolio` and `/contact`) and the existing `## What this is not` section. The prior section asserts the redesign works; the new section shows evidence; the next section limits the claim's scope.

**Block structure inside the new section:**

```mdx
## Did it work?

Two cold messages went out on 2026-05-10 via a LinkedIn Sales Navigator trial,
targeting founders at AI and software companies. The rebuilt site was the
artifact each lead would land on. One of the two replied the same day.

The outbound message:

<Callout type="info">

[Verbatim message with founder name redacted, company redacted, phone removed,
 signature trimmed to name only.]

</Callout>

The reply (anonymized, from a founder of an enterprise AI company, day 67,
~$561k MRR):

<Callout type="tip">

[Verbatim reply with name, company, phone, and any other identifying
 references removed. Profanity intact.]

</Callout>

[Two- or three-sentence closing paragraph noting what the reply confirmed:
 the site itself drove the response, and the specific signal was the work
 shown on it, not the bio or the pitch. Final wording set before merge,
 once the call has happened.]
```

**Components.** Uses `Callout` from `components/Callout.tsx`, already in the MDX registry. No new components. If two consecutive callouts read poorly visually next to each other, fall back to plain markdown `>` blockquotes.

**Voice checks** before commit:

- No em dashes anywhere in new prose.
- No tricolons, no closing flourishes (`ultimately`, `in the end`, `at the end of the day`).
- None of the draft's marketing words: `head and shoulders`, `proof-of-work powerhouse`, `overwhelming`, `compelling`, `instantly forgettable`, `golden opportunity`.
- Sentence cadence matches the surrounding article: short, declarative, specific.

## Edge cases

- [ ] **The call does not happen or falls through.** Section still ships. Closing paragraph reframes: the response itself is the data point, and the redesign earned it without the call ever taking place.
- [ ] **The founder finds the article and recognizes himself.** Anonymization is the mitigation. If he objects anyway, the reply Callout comes out and the section keeps the outbound message and a paraphrased outcome.
- [ ] **Reader pushes back on `n=2`.** The section never claims a conversion rate. It reports one event and quotes the artifact. That is a fact about a thing that happened, not a statistic about a population.
- [ ] **Callouts look bad stacked.** Swap one or both for plain `>` blockquotes.

## Acceptance criteria

1. `app/(site)/articles/posts/three-js-portfolio-website-for-software-engineer.mdx` contains a new `## Did it work?` section inserted between `## Why it works better` and `## What this is not`.
2. `git grep -n -i -E "anderson|oxagen|628.?236|737.?932|sales navigator email|linkedin\.com/in/"` against the changed file returns no matches inside the new section (the framing line may mention "LinkedIn Sales Navigator" as a tool name only).
3. `npm run build` succeeds. The article renders at `/articles/three-js-portfolio-website-for-software-engineer` with the new section visible and callouts styled correctly in both light and dark themes.
4. `npm test` and `npm run typecheck` pass.
5. The PR is open but not merged until the scheduled call has happened and the closing paragraph reflects the actual outcome.

## Constraints

- Single-file change to the MDX (plus this spec). No new components, no schema changes, no new dependencies.
- Branch and PR follow the repo's trunk-based flow per `docs/documentation/development-standards.md`.
- Commit format per `CLAUDE.md`: `feat: add anonymized outreach outcome section to Three.js article [SPEC-022]`.

## Tasks

- [x] Create this spec file at `docs/specs/active/SPEC-022-three-js-article-outreach-outcome-section.md`.
- [ ] Draft the new section in the MDX file using the block structure above.
- [ ] Apply the nice-to-have em dash + typo fix on the existing line 41.
- [ ] Run `npm run lint`, `npm run typecheck`, `npm test`.
- [ ] `npm run dev`; open the article locally; confirm callouts render in both themes; PII grep returns clean.
- [ ] Commit. Open PR. Do not merge.
- [ ] After the call, update the closing paragraph; merge.
- [ ] Move spec to `complete` status; relocate to `docs/specs/archive/`.

## Notes

- Critical files:
  - `app/(site)/articles/posts/three-js-portfolio-website-for-software-engineer.mdx` (the article)
  - `components/Callout.tsx` (the rendering component)
  - `components/mdx.tsx` (MDX registry)
  - `docs/templates/feature-template.md` (template source)
- Reuses the existing `Callout` MDX component; no new abstraction.
- Closest stylistic reference: `docs/specs/archive/SPEC-021-case-study-content-rewrite-postgis-fleet-optimization.md`.
- Explicitly unrelated: `app/(site)/case-studies/case-studies.ts`. See non-goals.
