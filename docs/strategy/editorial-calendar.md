---
title: 'Editorial calendar, 2026 H2'
date: 2026-05-11
spec: SPEC-017
status: living-document
author: Anthony Coffey
---

# Editorial calendar, 2026 H2

Cadence: **one new article per 4-6 weeks**, **one refresh per quarter**. Targets, not quotas. Skipping a slot is preferable to publishing a piece that fails the voice bar in [`voice-and-style.md`](../documentation/guides/voice-and-style.md).

The "what this demonstrates" field is required on every slot. Articles that cannot articulate what the work shows are not on this calendar.

Audit signals cited below trace to [`seo-audit-2026-Q2.md`](./seo-audit-2026-Q2.md).

## Q3 2026 (July - September)

### Slot 1. Refresh `vibe-coding-building-an-app-entirely-with-ai-prompts`

| Field | Value |
| --- | --- |
| Type | Refresh (Bucket A) |
| Target ship | 2026-09-30 |
| Status | drafted ([brief](./briefs/2026-Q3-slot-1-vibe-coding-refresh.md)) |
| Pillar | Mobile Development |
| Target queries | `flutter vibe coding`, `vibe coding flutter app`, `vibe code flutter app` (audit Section 4, 6-7% CTR cluster) |
| What this demonstrates | A real Flutter project shipped end-to-end on AI-driven workflows; the body documents which decisions held up and which broke after ~12 months of distance from the original draft. |
| Audit signal | -33% at 90 days. Highest CTR cluster on the site. 2,290 impressions across 6 vibe-coding queries (Section 4). |
| Refresh angle | Revisit the decisions in the original; note what AI-assisted workflow changes since 2025-04 (newer models, better agentic tooling); refresh any code that no longer compiles against current Flutter. |

### Slot 2. New: Expo Location deep-dive

| Field | Value |
| --- | --- |
| Type | New article |
| Target ship | 2026-10-15 |
| Status | planned |
| Pillar | Mobile Development |
| Target queries | `expo-location requestForegroundPermissionsAsync`, `expo-location permissionstatus.granted`, `expo-location hasservicesenabledasync`, `expo geofencing`, `expo background location` (audit Section 5, 14 striking-distance queries on the parent article) |
| What this demonstrates | A working geofencing + background-location implementation, including the permission-prompt UX edge cases that the parent article surfaces but does not solve. |
| Audit signal | ~3,600 potential clicks across the top-25 low-hanging-fruit list (Section 6). Parent article has 150,793 impressions at 0.26% CTR; the function-name long-tails are losing the click decision. |
| Notes | This piece is the deep-dive sibling to `building-location-based-features-using-expo-location`. The parent stays as the overview; the new article is the function-by-function reference. Internal-link both directions. |

### Slot 3 (optional). Vibe-coding companion piece

| Field | Value |
| --- | --- |
| Type | New article (no commitment date) |
| Target ship | Ships if the work is genuinely worth writing about; otherwise the slot rolls forward |
| Status | optional |
| Pillar | Mobile Development |
| Target queries | TBD; depends on the project documented |
| What this demonstrates | A second AI-driven build (different stack, e.g. a small Next.js + agentic-tooling project, or a Swift / Kotlin native build) so the vibe-coding pattern reads as a method, not a one-off. |
| Audit signal | Cluster CTR is high but volume is low (2,290 impressions). A second post deepens the cluster footprint without diluting the lead piece. |

## Q4 2026 (October - December)

### Slot 4. New: Firebase App Hosting environment-variable patterns

| Field | Value |
| --- | --- |
| Type | New article |
| Target ship | 2026-11-30 |
| Status | planned |
| Pillar | Cloud & DevOps |
| Target queries | `apphosting.yaml`, `next_public_firebase_api_key`, `firebase app hosting environment variables`, `firebase apphosting:secrets:grantaccess`, `firebase apphosting:secrets:set` (audit Section 5 + Section 4) |
| What this demonstrates | The full env-var lifecycle in a real App Hosting deploy, including the `next_public_*` exposure trap and the `secrets:grantaccess` step that the docs gloss over. |
| Audit signal | 6 striking-distance queries on the parent article (`managing-secrets-firebase-apphosting-yaml-nextjs`). The parent gets 180 clicks at 0.41% CTR; a companion piece that picks up the function-name long-tails (same pattern as the Expo Location split) is the natural editorial move. |

### Slot 5. Refresh `slow-android-emulator-flutter-dev`

| Field | Value |
| --- | --- |
| Type | Refresh (Bucket A) |
| Target ship | 2026-12-31 |
| Status | planned |
| Pillar | Mobile Development |
| Target queries | Existing top queries (already ranking); the refresh is to recover the -16% trend, not to chase new keywords. |
| What this demonstrates | Updated diagnostic flow against the current Android Studio / Flutter release. The article is evergreen because emulator slowness recurs every major Android Studio version; refresh it against the version current at refresh time. |
| Audit signal | -16% at 90 days. 71,131 impressions still flowing. Evergreen topic. |

## Disposition execution (Software Engineering pillar)

Outside the new/refresh cadence above, the four Bucket B articles in [`content-disposition.md`](./content-disposition.md) each need a refresh-or-redirect decision shipped before 2026-08-10 (Q3 review).

This is bookkeeping, not editorial work, and does not consume calendar slots.

## Skipped / slipped slots

Recorded as they happen. A skipped slot is signal, not failure.

| Slot | Original target | Outcome | Reason | Re-scheduled |
| --- | --- | --- | --- | --- |
| _(none yet)_ |  |  |  |  |

## Annual review trigger

2026-12-01: re-evaluate the pillar taxonomy from scratch. The five pillars are organizational, not permanent.

## Change log

- 2026-05-11. Initial calendar per SPEC-017 must-have #6. Q3 slots 1 and 2 traced to SPEC-017 Design > Editorial calendar; Slot 3 marked optional. Q4 slots 4 and 5 added per same source.
