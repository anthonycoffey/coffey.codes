---
slug: vibe-coding-building-an-app-entirely-with-ai-prompts
type: refresh
pillar: Mobile Development
target_ship: 2026-09-30
status: planned
calendar_slot: Q3 2026 Slot 1
author: Anthony Coffey
---

# Content brief: Vibe coding, one year later

Pre-write step for the Q3 2026 Slot 1 refresh of [`vibe-coding-building-an-app-entirely-with-ai-prompts`](../../../app/(site)/articles/posts/vibe-coding-building-an-app-entirely-with-ai-prompts.mdx). Anthony fills in the gaps and drafts the body; this brief surfaces the audit signal and the editorial frame so the body-work doesn't have to re-discover it.

## Working title

`Vibe Coding, One Year Later: What LabelScan Looks Like After Twelve Months of Agentic Tooling`

(Or shorter, depending on body work: the title rewrite is optional and risky because the article is one of two declining top-CTR pieces. The current title is the highest-CTR title on the site. The refresh body update is the real lever.)

## What this demonstrates

Twelve months of distance from the original LabelScan build. What in the original article's decisions held up; what broke. What changed in the agentic-tooling landscape (Cline plus Gemini 2.5 Pro was the 2025 stack; the 2026 stack looks different). The piece reads as a project retrospective with specific decisions, not a generic "state of AI coding" essay.

## Target queries

Pulled from [`docs/strategy/seo-audit-2026-Q2.md`](../seo-audit-2026-Q2.md) Section 4 (vibe-coding cluster, combined 109 clicks across 6 queries):

| Query | Source (audit section / signal) | Notes |
| --- | --- | --- |
| `flutter vibe coding` | Section 4 top performer, 49 clicks, 4.56% CTR | Refresh defends this query; the cluster is declining (-33% in Section 3). |
| `vibe coding flutter` | Section 4 #3, 24 clicks, 3.70% CTR | Same cluster. |
| `vibe coding flutter app` | Section 4 #4, 15 clicks, 6.88% CTR | Highest CTR variant. |
| `vibe code flutter app` | Section 4 #6, 9 clicks, 5.73% CTR | Long-tail. |
| `vibe code flutter` | Section 4 #10, 6 clicks, 4.17% CTR | Long-tail. |

These queries are already won; the refresh's job is to keep them, not chase new ones. Net-new queries are out of scope for the refresh; if a new angle warrants its own piece, that's Slot 3 (optional companion piece).

## Outline

Anthony's call. The original article is a feature-by-feature build narrative. Two outline options:

**Option A. Retrospective overlay on the existing structure.** Keep the headings, update each section with what changed: "Camera and Image Handling, one year later", etc. Heaviest editorial lift; lowest disruption to the existing rank.

**Option B. New "What's Changed in Twelve Months" section at the top, original body preserved.** Lighter lift; the article reads as "original piece plus an update note" rather than a fully rewritten retrospective.

The brief recommends Option B as the lower-risk path. The original article is at the top of the SE cluster's CTR; significant structural changes risk the rank.

## Distinctive angle

LabelScan is a real shipped project Anthony built. The original article documented the build; the refresh documents the maintenance and the platform changes around it. The angle that nobody else can write: specific decisions that held up vs. broke over a year of distance, with the agentic-tooling stack changing underneath.

What this piece does NOT do: speculate about AI coding trends, summarize Cline release notes, repeat what's in the Gemini 2.5 Pro announcement. Specific over general (voice rule 7).

## Internal links

Inbound (existing → new): the `category: Mobile Development` listing already surfaces this article. Consider adding a one-line callout to this article from [`building-location-based-features-using-expo-location.mdx`](../../../app/(site)/articles/posts/building-location-based-features-using-expo-location.mdx) in the intro paragraph since both are React-native-adjacent shipped projects.

Outbound (new → existing):

- [`building-location-based-features-using-expo-location`](../../../app/(site)/articles/posts/building-location-based-features-using-expo-location.mdx) when the refresh mentions other Mobile Development pieces.
- [`slow-android-emulator-flutter-dev`](../../../app/(site)/articles/posts/slow-android-emulator-flutter-dev.mdx) if any Flutter emulator workflow appears (sibling Bucket A piece, also being refreshed in Slot 5).

## Voice check

- [ ] No em-dashes in the working title or outline
- [ ] No marketing tricolons
- [ ] No closing-flourish section (`## Conclusion`, `## Wrapping up`, etc.) in the outline
- [ ] No "let's dive in" / AI-slop phrasing in the introduction draft

The original article has a closing `## Conclusion` section. The refresh deletes it per voice rule 3.

## Refresh-specific fields

- **Original `publishedAt`**: 2025-04-03
- **Last refresh**: never
- **What's changed since last version**: Cline is now post-1.0 with a different agent model; Gemini 2.5 Pro is no longer the latest Gemini model and pricing has shifted; Flutter has had two SDK releases; the Riverpod patterns Anthony picked have stabilized or moved; LabelScan itself may have shipped features that weren't in the original article. Anthony's call on which of these belong in the body.
- **`## Updated YYYY-MM-DD` note for the article body**: "Updated 2026-09-XX. Twelve months of distance, agentic tooling has shifted, and LabelScan is still in maintenance. This update captures what held up, what broke, and what the platform looks like a year out."

## Ship checklist

- [ ] Voice check pass (read against [`voice-and-style.md`](../../documentation/guides/voice-and-style.md))
- [ ] Frontmatter `category` is one of the canonical four pillars (Mobile Development, no change)
- [ ] Frontmatter `summary` is rewritten only if the refresh reframes the piece (Option A) or kept if the refresh is additive (Option B)
- [ ] Frontmatter `updated: '2026-09-XX'` is set (paired with SPEC-016 must-have #2)
- [ ] At least one inbound internal link from an existing article (`expo-location` piece intro is the candidate)
- [ ] PR title is `content: refresh vibe-coding-building-an-app-entirely-with-ai-prompts [SPEC-017]`
- [ ] PR body cites Section 4 cluster CTR numbers and the -33% trend that motivated the refresh
- [ ] Delete this brief at PR merge (or paste it into the PR body for traceability)
