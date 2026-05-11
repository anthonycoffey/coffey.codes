---
title: 'Content disposition, 2026-Q2 cycle'
date: 2026-05-11
spec: SPEC-017
source: docs/strategy/seo-audit-2026-Q2.md
status: living-document
author: Anthony Coffey
---

# Content disposition, 2026-Q2 cycle

One row per published article. Each article sits in exactly one bucket. Buckets and mechanics are defined in [SPEC-017](../specs/active/SPEC-017-content-strategy.md). Source data is [`seo-audit-2026-Q2.md`](./seo-audit-2026-Q2.md); click counts and trends in this table are from its 365-day window (2025-05-08 to 2026-05-07).

This is a living document. Revisit at every quarterly content review.

## Bucket legend

- **A. Refresh.** Material body update plus a `## Updated YYYY-MM-DD` note. The article keeps its slug and original `publishedAt`. The editorial bet is that an updated version recovers traffic.
- **B. Deprecate.** Either a 308 redirect to a sibling article (SPEC-013 single-hop convention) or kept published with `noindex` and an archival note. The decision per article is recorded inline.
- **C. Keep as-is.** No editorial action this cycle. The article costs nothing to leave published; cumulative tail-impressions are not zero. Re-evaluate at the annual review.

## Disposition table

| # | Slug | Pillar | publishedAt | 365d clicks | Bucket | Decision / reason |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | [`vibe-coding-building-an-app-entirely-with-ai-prompts`](../../app/(site)/articles/posts/vibe-coding-building-an-app-entirely-with-ai-prompts.mdx) | Mobile Development | 2025-04-03 | 248 | A | Highest CTR cluster on the site (4-7% across 6 query variants). Trend -33% at 90 days. Refresh + companion piece is the highest-leverage editorial move (Q3 calendar). |
| 2 | [`slow-android-emulator-flutter-dev`](../../app/(site)/articles/posts/slow-android-emulator-flutter-dev.mdx) | Mobile Development | 2025-04-16 | 236 | A | 71,131 impressions on stable evergreen queries. -16% at 90 days. Striking-distance demand still real (audit Section 5). Recategorized from `Development` per SPEC-016 quick win #3. |
| 3 | [`managing-secrets-firebase-apphosting-yaml-nextjs`](../../app/(site)/articles/posts/managing-secrets-firebase-apphosting-yaml-nextjs.mdx) | Cloud & DevOps | 2025-03-14 | 180 | A | Steepest decline of any top page (-60% at 90 days). Firebase CLI may have shifted; reverify body against current `firebase apphosting:secrets:*` behavior. |
| 4 | [`react-19-features-and-design-patterns`](../../app/(site)/articles/posts/react-19-features-and-design-patterns.mdx) | Web Development | 2025-03-17 | 52 | A | Anchor URLs (`#actions-api`, `#streaming-patterns`, `#react-compiler`) rank at positions 6.0-6.4 but earn zero clicks. Refresh decision at refresh-time: tighten body, or split into multiple shorter pieces. |
| 5 | [`embracing-clean-code-principles`](../../app/(site)/articles/posts/embracing-clean-code-principles.mdx) | Software Engineering | 2024-04-11 | 0 | B | Zero traffic in audit Section 10. Topic is SERP-saturated. **Decision pending** per SPEC-017 must-have #7; default action is redirect to `/articles` unless refresh angle emerges. |
| 6 | [`javascript-design-patterns`](../../app/(site)/articles/posts/javascript-design-patterns.mdx) | Software Engineering | 2023-02-20 | 0 | B | Zero traffic; 2023 article. SERP saturated. **Decision pending**; default redirect. |
| 7 | [`tips-for-troubleshooting-and-debugging-code`](../../app/(site)/articles/posts/tips-for-troubleshooting-and-debugging-code.mdx) | Software Engineering | 2023-02-13 | 0 | B | Zero traffic; 2023 article. Generic title. **Decision pending**; default redirect. |
| 8 | [`unit-testing-in-python-with-pytest`](../../app/(site)/articles/posts/unit-testing-in-python-with-pytest.mdx) | Software Engineering | 2023-02-16 | 0 | B | Zero traffic; 2023 article. Pytest docs are the canonical resource. **Decision pending**; default redirect. |
| 9 | [`authorize-net-for-react-native-expo-sdk-49`](../../app/(site)/articles/posts/authorize-net-for-react-native-expo-sdk-49.mdx) | Mobile Development | 2024-04-08 | 15 | C | 1.69% CTR at position 11.48. Long-tail Expo + payments piece. Cumulative tail impressions are real. |
| 10 | [`setting-up-ci-cd-for-firebase-functions-using-github-actions`](../../app/(site)/articles/posts/setting-up-ci-cd-for-firebase-functions-using-github-actions.mdx) | Cloud & DevOps | 2025-03-11 | 3 | C | Small but non-zero. Adjacent to Bucket A `managing-secrets-firebase-apphosting-yaml-nextjs`. Internal-link opportunity at next refresh. |
| 11 | [`how-to-end-a-process-by-port-number`](../../app/(site)/articles/posts/how-to-end-a-process-by-port-number.mdx) | Tools & Productivity | 2023-11-18 | 2 | C | Single-snippet utility piece. Evergreen reference; no refresh angle. |
| 12 | [`building-interactive-3d-experiences-with-react-three-fiber`](../../app/(site)/articles/posts/building-interactive-3d-experiences-with-react-three-fiber.mdx) | Web Development | 2025-03-29 | (<3) | C | Adjacent to `three-js-portfolio-website-for-software-engineer`. Internal-link candidate. |
| 13 | [`building-an-mdx-powered-blog-using-app-router-next-js`](../../app/(site)/articles/posts/building-an-mdx-powered-blog-using-app-router-next-js.mdx) | Web Development | 2024-10-01 | (<3) | C | Adjacent to `step-by-step-building-your-blog-with-next-js-and-mdx`. Possible consolidation at next cycle. |
| 14 | [`step-by-step-building-your-blog-with-next-js-and-mdx`](../../app/(site)/articles/posts/step-by-step-building-your-blog-with-next-js-and-mdx.mdx) | Web Development | 2025-03-25 | (<3) | C | See #13. |
| 15 | [`preventing-unnecessary-re-renders-in-react-apps`](../../app/(site)/articles/posts/preventing-unnecessary-re-renders-in-react-apps.mdx) | Web Development | 2025-03-27 | (<3) | C | 33% bounce, 269s avg duration in GA4 (audit Section 9.5). Engaged when found. |
| 16 | [`micro-frontends-architecture-benefits-challenges-best-practices`](../../app/(site)/articles/posts/micro-frontends-architecture-benefits-challenges-best-practices.mdx) | Web Development | 2024-10-22 | (<3) | C | Theoretical-overview piece. No striking-distance signal. |
| 17 | [`implementing-localization-in-nextjs`](../../app/(site)/articles/posts/implementing-localization-in-nextjs.mdx) | Web Development | 2026-02-26 | n/a (post-audit) | C | Published after the audit window closed. Re-evaluate at Q3 review with first quarter of data. |
| 18 | [`fixing-broken-routes-after-nextjs-16-upgrade`](../../app/(site)/articles/posts/fixing-broken-routes-after-nextjs-16-upgrade.mdx) | Web Development | 2026-02-01 | n/a (post-audit) | C | Released after audit froze. Re-evaluate Q3. |
| 19 | [`production-grade-ci-cd-with-nextjs-vercel-and-github-actions`](../../app/(site)/articles/posts/production-grade-ci-cd-with-nextjs-vercel-and-github-actions.mdx) | Cloud & DevOps | 2026-04-24 | n/a (post-audit) | C | Released after audit froze. Re-evaluate Q3. |
| 20 | [`three-js-portfolio-website-for-software-engineer`](../../app/(site)/articles/posts/three-js-portfolio-website-for-software-engineer.mdx) | Web Development | 2026-05-10 | n/a (post-audit) | C | Published on the audit's last day. Re-evaluate Q3. |
| 21 | [`how-to-deploy-a-flask-rest-api-on-google-cloud-run`](../../app/(site)/articles/posts/how-to-deploy-a-flask-rest-api-on-google-cloud-run.mdx) | Cloud & DevOps | 2025-03-02 | (<3) | C | Long-tail Python + Cloud Run piece. |
| 22 | [`essential-tips-for-effective-aws-iam-policy-management`](../../app/(site)/articles/posts/essential-tips-for-effective-aws-iam-policy-management.mdx) | Cloud & DevOps | 2024-04-09 | (<3) | C | AWS docs are SERP-dominant; this remains a personal-reference piece. |
| 23 | [`working-with-aws-lambda-beginners-guide`](../../app/(site)/articles/posts/working-with-aws-lambda-beginners-guide.mdx) | Cloud & DevOps | 2024-04-09 | (<3) | C | Generic intro; AWS docs cover this. Watch at next review for deprecate candidacy. |
| 24 | [`best-practices-with-git-version-control`](../../app/(site)/articles/posts/best-practices-with-git-version-control.mdx) | Tools & Productivity | 2023-02-14 | (<3) | C | Evergreen reference; cumulative tail impressions. |
| 25 | [`how-to-see-when-a-file-was-deleted-or-changed-with-git-log`](../../app/(site)/articles/posts/how-to-see-when-a-file-was-deleted-or-changed-with-git-log.mdx) | Tools & Productivity | 2023-11-14 | (<3) | C | Single-command snippet piece. |
| 26 | [`tools-for-productive-development`](../../app/(site)/articles/posts/tools-for-productive-development.mdx) | Tools & Productivity | 2023-02-15 | (<3) | C | Tool-list piece. Watch at next review for deprecate candidacy (stack moves; 2023 picks may have rotted). |

26 articles tracked. The audit's frozen count was 26; the post-audit additions in rows 17 through 20 bring the current site total to 27 (`three-js-portfolio-website-for-software-engineer` landed the day the audit froze).

## Software Engineering pillar (SPEC-017 must-have #7)

The four Bucket B articles each need an explicit refresh-or-redirect decision before the next quarterly review (target 2026-08-10). Recording each decision below as it's made.

| Slug | Decision | Date | Reasoning |
| --- | --- | --- | --- |
| `embracing-clean-code-principles` | _pending_ |  |  |
| `javascript-design-patterns` | _pending_ |  |  |
| `tips-for-troubleshooting-and-debugging-code` | Redirect to `/articles` (308) | 2026-05-11 | 25-line article of generic platitudes ("Pay attention", "Take breaks"). No code examples, no Anthony-specific work, no distinctive angle. Topic is SERP-saturated by Stack Overflow and every developer blog. Zero traffic in audit window. Deleted MDX; redirect in `next.config.js`. |
| `unit-testing-in-python-with-pytest` | _pending_ |  |  |

Default action if no refresh angle surfaces by 2026-08-10: 308 redirect to `/articles`, MDX renamed to `.archived.mdx` to keep history in git.

## Change log

- 2026-05-11. Initial bucketing per SPEC-017 must-have #7. Bucket A and B mirror SPEC-017 Design > Disposition matrix. All four Software Engineering pillar articles defaulted to Bucket B with `_pending_` decisions; final decision recorded inline at refresh / redirect time.
