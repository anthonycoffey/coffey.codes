---
id: SPEC-028
title: 'Periscope guided onboarding flow for new client properties'
status: draft
created: 2026-05-17
author: Anthony Coffey
reviewers: []
affected_repos: [periscope, coffey.codes]
priority: low
---

## Reviewer Notes

<!-- Leave empty until code review. -->

---

# Feature: `periscope onboard` — guided new-property setup

## Problem

Adding a new client property to periscope today is a ~30-minute manual checklist: provision a service-account JSON (or reuse the shared one), add it as a user in the client's Google Ads account, verify GSC ownership, set up GA4 viewer access, populate `periscope.config.{ts,mjs}` with the right IDs, sanity-check with `periscope doctor`. Each step has its own failure mode and its own "did I forget something" moment.

At 2 clients this is tolerable. At 5+ clients it becomes a real friction tax. This SPEC is the long-term answer.

**Current priority: low.** User has 2 clients and is the onboarding specialist. This is explicitly deferred until the client count or the operator's tolerance for manual setup justifies the engineering effort.

Depends on [SPEC-024](SPEC-024-periscope-gsc-first-audit-ads-quota.md) multi-property config.

## Requirements

### Must have (when prioritized)

1. WHEN `periscope onboard <property-name>` runs, it SHALL walk the operator through an interactive checklist via stdin prompts.
2. The flow SHALL cover: service-account selection (existing or new), Google Ads customer ID + login customer ID input + verification via `listAccessibleCustomers`, GSC site URL input + verification, GA4 property ID input + verification, output directory creation, `periscope.config.{ts,mjs}` update.
3. WHEN each verification step fails, the command SHALL print the specific corrective action (e.g. "service account `sa@...` is NOT in `listAccessibleCustomers` for customer `123-456-7890` — add it as a user at https://ads.google.com/aw/users with permission level Standard, then re-run").
4. WHEN all verifications pass, the command SHALL write the new property block to `periscope.config.{ts,mjs}` using a deterministic merge (no clobbering existing properties).
5. The flow SHALL emit a final smoke-test step: run a one-page `periscope snapshot --engines=gsc --window=7` against the new property and confirm a non-empty result.

### Nice to have

- Non-interactive mode (`--from-file path/to/onboard.yaml`) for CI / scripting.
- Service-account auto-provisioning via Google Cloud IAM API (currently a manual step in the console).

### Non-goals

- Not a billing setup tool. Google Ads billing must already be enabled (CUSTOMER_NOT_ENABLED is the error if not — covered by SPEC-024 classifier).
- Not a Google Workspace / domain verification tool.
- No web UI. Terminal-only.

## Design

Interactive prompts via `@clack/prompts` or `enquirer` (commander ecosystem-friendly). Each verification step is a thin wrapper around an existing periscope library function:

- Ads verification → reuse `diagnoseAds` from [src/diagnostics/ads.ts](D:/repos/periscope/src/diagnostics/ads.ts).
- GSC verification → reuse the GSC engine's `searchanalytics.query` with a tiny window (1 day).
- GA4 verification → light analytics admin API call.

Config merge:
- Parse existing `periscope.config.{ts,mjs}` (TS via `jiti`, mjs via dynamic import).
- For `.mjs` configs, edit the AST or do a string-based safe insert into the `properties` object.
- For `.ts` configs, recommend manual edit and print the block to paste.

Critical files:
- `src/commands/onboard.ts` (new)
- `src/lib/config-writer.ts` (new) — safe merge into .mjs configs.
- `src/cli.ts` — register `onboard` subcommand.

## Acceptance criteria

1. `periscope onboard my-new-client` interactively guides through all setup steps and produces a working config block.
2. After completion, `periscope --property my-new-client doctor` passes.
3. After completion, `periscope --property my-new-client snapshot --engines=gsc --window=7` produces a non-empty snapshot.
4. Re-running onboard for an existing property SHALL ask before overwriting and SHALL support a `--reconfigure` flag for explicit re-runs.

## Constraints

- Must not store any secrets in `periscope.config.{ts,mjs}` (creds remain in env vars / `.env`).
- Must not modify existing property blocks unintentionally.

## Tasks

- [ ] Prompt library selection + integration.
- [ ] Per-step verification harnesses (Ads, GSC, GA4).
- [ ] Config-writer for `.mjs` configs.
- [ ] `onboard` command + CLI registration.
- [ ] Tests on the config-writer (idempotency, no-clobber, malformed input).
- [ ] Document in periscope README.

## Notes

Triggers to prioritize this SPEC:
- Client count reaches 4+, or
- A non-Anthony operator needs to onboard a client without hand-holding, or
- Onboarding time per client exceeds 45 minutes on average.

Until then this stays in draft. The manual checklist will be documented in `docs/documentation/guides/google-ads-basic-access.md` (created in SPEC-024) and extended with a sibling guide for GSC + GA4 verification.
