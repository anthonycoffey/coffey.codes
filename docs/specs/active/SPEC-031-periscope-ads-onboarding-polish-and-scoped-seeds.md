---
id: SPEC-031
title: 'Periscope Ads onboarding polish + scoped seed phrases for keyword ideas'
status: complete
created: 2026-05-26
completed: 2026-05-27
author: Anthony Coffey
reviewers: []
affected_repos: [periscope]
priority: medium
shipped_as:
  - 'periscope v1.4.0 (anthonycoffey/periscope#9) — print-only auth flow + scoped seed phrases'
  - 'periscope v1.4.1 (anthonycoffey/periscope#10) — fix MISSING_HOST on urlSeed + extend stopword list'
---

## Reviewer Notes

<!-- Leave empty until code review. -->

---

# Periscope 1.4.0 — Ads onboarding polish + scoped seed phrases

## Problem

Two friction points emerged immediately after the OAuth auth landing (`1.3.0`–`1.3.3`):

1. **`periscope auth ads` writes secrets to `.env.local`.** Convenient, but it co-locates long-lived secrets with the project repo, presumes the operator wants periscope to manage their env files for them, and quietly couples credential lifecycle to project lifecycle. Industry-standard CLIs (`gcloud auth print-access-token`, `aws sts get-session-token`, `1password-cli`) print credentials to stdout and let the operator decide where they live. Periscope should match that pattern.

2. **GHOST keyword ideas are topically noisy.** When `audit articles` enriches a GHOST verdict, it currently passes 1–4 raw article title/tag tokens as separate seeds to `generateKeywordIdeas`. Single-token seeds like `aws`, `iam`, `security` get re-interpreted by Google's Keyword Planner based on advertiser spend in those word roots, returning suggestions like "vivint security" or "architects near me" for a post about AWS IAM. The volume + competition data is still useful, but the keyword list is full of off-topic noise the operator has to mentally filter.

Both are quality-of-life issues blocking the tool from being daily-driver pleasant now that auth works.

## Requirements

### Must have

1. WHEN `periscope auth ads` completes the OAuth flow, it SHALL **not** write to `.env.local` by default. Instead it SHALL print the three credentials as ready-to-paste `KEY=VALUE` lines to stdout, gated behind a "Press Enter to reveal" confirmation so passive screenshots / live screen-shares don't capture the secret accidentally.
2. The command SHALL surface a clear warning header that credentials will appear in terminal scrollback after reveal, with a suggestion to clear scrollback after pasting (`Clear-Host` / `clear`).
3. WHEN the operator passes `--write-file <path>`, the command SHALL write the three vars to that path instead of printing (opt-in escape hatch for users who want a file).
4. WHEN `audit articles` enriches a GHOST verdict, it SHALL pass the article's GSC page URL (when known) as a `urlSeed` to the Ads API, in addition to a small set of multi-word seed phrases.
5. Seed phrases SHALL be composed from `category` + meaningful title tokens (stopword-filtered) rather than raw title/tag tokens. Example: for the article *"Essential Tips for Effective AWS IAM Policy Management"* in category *Cloud & DevOps*, the seeds become phrases like `"aws iam policy management"` and `"cloud devops aws iam"` — never `aws`, `iam`, `cloud` alone.
6. After Ads returns suggestions, results SHALL be post-filtered: any suggestion whose tokens share **zero** overlap with the article's tokenized title/category SHALL be dropped before scoring.

### Nice to have

- A `periscope auth ads --json` flag that emits the three values as machine-readable JSON (no header, no prompt) for CI / scripting. Defers to the default behavior otherwise.
- An optional denylist file (`periscope.config.adsSeed.deny`) of substrings that disqualify a returned keyword (`insurance`, `near me`, `for sale`, etc.). Operator-configurable.
- A `--debug-seeds` flag on `audit articles` that prints the constructed seed phrases per article before the Ads call. Helps tune the seed composition.

### Non-goals

- **No keychain integration in this sprint.** OS keychain support (`keytar`, `@napi-rs/keyring`) was considered and deferred — the native dependency is fragile cross-platform and the print-only flow covers the immediate need.
- **No retroactive `.env.local` migration.** Operators with credentials already written by `1.3.x` keep working; periscope just won't write new ones there.
- **No re-tuning of `discover topics` seed strategy in this sprint.** That command uses a different seed source (GSC top queries + categories) and isn't suffering from the same noise pattern. Track separately if/when it becomes a problem.

## Design

### Part A — Print-only credentials

`src/commands/auth-ads.ts`:

1. After `getToken()` resolves with the refresh token, **do not** call `upsertEnvLocal` for any of the three OAuth vars.
2. Print a warning block:
   ```
   ⚠  The next screen contains long-lived secrets.
       They will appear in your terminal scrollback after reveal.
       Make sure you're not screen-sharing.
       Press Enter to reveal, Ctrl+C to abort.
   ```
3. `await rl.question('')` to gate on the operator's keypress.
4. Print credentials in copy-paste-ready form:
   ```
   GOOGLE_ADS_CLIENT_ID=225307825082-...apps.googleusercontent.com
   GOOGLE_ADS_CLIENT_SECRET=GOCSPX-...
   GOOGLE_ADS_REFRESH_TOKEN=1//...
   ```
5. Followed by:
   ```
   Paste these into your env manager of choice:
     - .env / .env.local (gitignored)
     - shell profile (`$env:...` on PowerShell, `export ...` in ~/.zshrc)
     - secrets manager (1Password CLI, Doppler, etc.)
   When done, clear your terminal scrollback (Clear-Host / clear).
   ```
6. When `--write-file <path>` is set, skip steps 2–5 and write the same KEY=VALUE block to the path (mode 0600 on POSIX). Print a confirmation `✓ Wrote credentials to <path>` instead.
7. When `--json` is set, skip the reveal prompt and the human-readable headers and emit `{"clientId":"...","clientSecret":"...","refreshToken":"..."}` to stdout, all other output to stderr.

`assertWritable()` and `upsertEnvLocal()` can stay in the file but become unused for the OAuth case (still imported by the path-write code). Remove them in a follow-up cleanup.

### Part B — Scoped seed phrases

Touch points in `src/commands/audit-articles.ts`:

1. New helper `composeGhostSeeds(article: Article, config: AdsConfig): { keywordSeeds: string[]; url: string | null }`:
   - **URL seed.** When `article.matchedPage` is set (GSC-known page URL), return it. Otherwise null.
   - **Keyword seeds.** Stopword-strip the title + category. Stopwords list (small, English-only for now): `the, a, an, and, or, for, with, of, to, in, on, your, my, how, what, when, why, guide, tips, tutorial, best, essential, complete, ultimate, vs`. Compose 2–3 phrases:
     - `<category> <top-3-title-content-tokens>` (always emit if category present)
     - `<top-4-title-content-tokens>` (always emit)
     - `<top-2-title-content-tokens> best practices` (only if "best" or "practices" already in title — avoids stuffing)
   - Cap at 3 seeds. Each seed is a multi-word phrase, never a single token.

2. `generateKeywordIdeas` call: switch from `{ keywords: seeds }` to `{ keywords: seeds, url: composed.url ?? undefined }`. The engine already supports the `keywordAndUrlSeed` mode; no engine-layer change needed.

3. New helper `filterOffTopicIdeas(ideas: KeywordIdeaResult[], article: Article): KeywordIdeaResult[]`:
   - Tokenize each idea on `[^\p{L}\p{N}]+`.
   - Require at least **one** token overlap with the union of `articleTokens(article)` ∪ `tokenize(category)`.
   - Drop ideas with zero overlap before scoring/sorting.
   - Log the dropped count to stderr when `--debug-seeds` is set.

4. The existing `pickCachedIdeasForArticle` already does overlap-based scoring; the new filter is a stricter version applied to **live** results before they hit the article's `ghostIdeas`. Cache-pull behavior unchanged.

### Critical files

- [`src/commands/auth-ads.ts`](Z:/repos/periscope/src/commands/auth-ads.ts) — replace `.env.local` write with stdout reveal + optional `--write-file`.
- [`src/cli.ts`](Z:/repos/periscope/src/cli.ts) — add `--write-file <path>` and `--json` options to `auth ads`; add `--debug-seeds` to `audit articles`.
- [`src/commands/audit-articles.ts`](Z:/repos/periscope/src/commands/audit-articles.ts) — extract `composeGhostSeeds` + `filterOffTopicIdeas`; replace the inline `[ghost.title, ...ghost.tags].slice(0, GHOST_SEED_LIMIT)` block.
- [`src/lib/ads-seed-phrases.ts`](Z:/repos/periscope/src/lib/ads-seed-phrases.ts) (new) — pure functions: stopword-stripping, phrase composition, off-topic filter. Keeps the audit-articles file from growing.
- [`tests/unit/ads-seed-phrases.test.ts`](Z:/repos/periscope/tests/unit/ads-seed-phrases.test.ts) (new) — unit-test the phrase composition + filter against representative GHOSTs from the latest report.
- [`README.md`](Z:/repos/periscope/README.md) — update the "Google Ads setup" section to reflect print-only flow; document `--write-file` and `--json`.

## Acceptance criteria

1. `periscope auth ads` completes without writing to `.env.local`. The three KEY=VALUE lines appear on stdout only after the operator presses Enter past the reveal warning.
2. `periscope auth ads --write-file ./.creds.env` writes the three vars to that path (mode 0600 on POSIX) and prints no secrets to stdout.
3. `periscope auth ads --json` emits a single-line JSON object with the three values; nothing else on stdout.
4. After running `audit articles` against the existing 23-article corpus on coffey.codes, GHOST suggestions for the AWS IAM article no longer include `vivint security` / `home security` style noise. The micro-frontends article no longer suggests `architects near me`.
5. At least 80% of GHOST suggestions across the report share ≥1 token with the article's title/category (measured by `--debug-seeds` output on a re-run).
6. `audit articles --debug-seeds` prints the composed seed phrases and dropped-idea count per GHOST article to stderr; no change to the final markdown output.
7. `npm run typecheck && npm test && npm run build` all green. Existing 140-test suite continues to pass; the new `ads-seed-phrases.test.ts` adds ≥10 cases.
8. Ships as `v1.4.0`. The credential-storage change is a behavior change for any 1.3.x consumer who relied on `.env.local` being written, so minor-bump is correct under the repo's stated semver contract.

## Constraints

- Print-only flow must be safe to invoke in CI: `--json` mode must emit a stable JSON shape and exit 0 on success / nonzero on failure with diagnostics on stderr.
- No new runtime dependencies. All work uses `node:readline`, `node:fs`, and existing utilities.
- The seed-composition stopword list lives in code, not config — it's English-only and tuned for technical content. A config knob for it is explicitly out of scope; revisit if multi-language support comes up.
- Backwards compatibility: if an operator's existing `.env.local` already has the three OAuth vars from a 1.3.x run, periscope keeps reading them via the existing env-var precedence path. No migration step.

## Verification plan

1. Run `periscope auth ads` end-to-end against `periscope-prod` (Anthony's GCP project). Confirm:
   - Reveal prompt appears
   - Press Enter prints the three KEY=VALUE lines exactly once
   - `.env.local` is **not** modified
2. Run `periscope auth ads --write-file ./test-creds.env` and `cat test-creds.env`. Confirm the three lines are present and the file mode is 0600 (POSIX).
3. Run `periscope audit articles` and diff the new report against `keyword-audit-articles-2026-05-26.md`. Confirm:
   - GHOSTs still get suggestions
   - Off-topic noise (insurance, security cams, real estate, etc.) is gone or dramatically reduced
   - Volume buckets unchanged for the suggestions that remain
4. Run `periscope audit articles --debug-seeds` and inspect the seed phrases + drop counts per GHOST. Confirm each phrase is 2+ tokens.
5. CI: confirm the publish workflow produces a working `v1.4.0` package after tag push.
