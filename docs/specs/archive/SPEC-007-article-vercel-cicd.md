# SPEC-007: Article - Rock-Solid CI/CD with Vercel and GitHub Actions

## Overview
This spec outlines the plan to write an article detailing the setup of an enterprise-grade, rock-solid CI/CD pipeline for a Next.js TypeScript project. The article will cover integrating GitHub Actions (for ESLint, Vitest, Playwright, and Typechecking) with Vercel Preview Deployments and native Vercel Deployment Checks to ensure maximum application stability before PRs can be merged.

## Status
`complete`

## Target Audience
Next.js and TypeScript developers looking to harden their deployment pipeline, prevent broken builds from hitting production, and seamlessly integrate GitHub Actions with Vercel.

## Core Concepts & Key Takeaways

### 1. The Value of Status Checks
Enforcing high code quality requires strict gates. A PR should not be allowed to merge unless **every** check below is green. The article walks through each one, what it proves, and where it's configured.

**Required GitHub status checks (from `.github/workflows/`):**

| Check | Job | Source event | What it proves |
|---|---|---|---|
| **ESLint** | `Test / ESLint (pull_request)` | `pull_request` | Code style + lint rules |
| **Vitest** | `Test / Vitest (pull_request)` | `pull_request` | All unit tests pass |
| **TypeScript** | `Test / TypeScript (pull_request)` | `pull_request` | `tsc --noEmit` clean — no implicit `any`, no `@ts-ignore` cheats |
| **Playwright** | `E2E (Vercel Preview) / Playwright (deployment_status)` | `deployment_status` | End-to-end tests pass against the **real** Vercel preview deployment |
| **Notify Vercel** | `Test / Notify Vercel (pull_request)` | `pull_request` | All the jobs above finished green and Vercel was told about it (this is what closes the loop so Vercel's "Deployment Checks" feature knows CI passed) |

**Required Vercel deployment:**

| Rule | What it means |
|---|---|
| **Require deployments to succeed → Preview** | GitHub refuses to merge unless the Vercel **Preview** deployment itself builds and deploys cleanly |

> 💡 **Callout — "Only `Preview` worked, and that's a feature not a bug":**
> GitHub Branch Protection's "Require deployments to succeed" dropdown lists several Vercel environment names (Production, Preview, etc.). In practice, **`Preview` is the one you want** — the other names never turn green in a PR context because PRs don't trigger production deploys. Selecting only `Preview` aligned perfectly with the `deployment_status` event that kicks off Playwright, which meant we could **delete the entire "build + run e2e locally in CI" job**. Playwright ran against the same artifact Vercel was about to serve, so building a second time on a GitHub runner was pure waste. Cutting it saved ~2–3 minutes per PR *and* made the e2e run more trustworthy because it hits the real edge runtime.

### 2. Configuring Vercel Preview Deployments
- Detail the process of enabling Preview Builds in the Vercel Dashboard (Settings > Environments).
- Explain *why* preview builds are superior to running `npm run build` in GitHub: they test the actual edge network, serverless functions, and caching layer that production will use.
- **Critical Integration**: Enforcing the `vercel/preview` status check in GitHub's Branch Protection Rules so GitHub refuses to merge until Vercel guarantees the code compiles on their infrastructure.

### 3. Vercel Deployment Checks (The Reverse Handshake)
- Explain how to configure Vercel to wait for GitHub Actions before considering a deployment fully successful (Settings > Build & Development > Deployment Checks).
- Detail the YAML snippet required to notify Vercel from GitHub Actions:
  ```yaml
  notify:
    name: Notify Vercel
    needs: [lint, unit, typecheck, e2e]
    if: always()
    runs-on: ubuntu-latest
    steps:
      - name: 'notify vercel'
        uses: 'vercel/repository-dispatch/actions/status@v1'
        with:
          name: "Vercel - coffey-codes: Test"
          state: "${{ (contains(needs.*.result, 'failure') || contains(needs.*.result, 'cancelled')) && 'error' || 'success' }}"
          github_token: ${{ secrets.GITHUB_TOKEN }}
  ```
- **Gotcha Alert**: Highlight that while GitHub automatically provides the `secrets.GITHUB_TOKEN`, the `vercel/repository-dispatch` action does *not* automatically consume it. It **must** be explicitly passed down via the `with:` block.
- **Gotcha Alert 2**: Explain that the GitHub Actions job creates a status check named `Test / Notify Vercel (pull_request)` in GitHub, but communicates with Vercel using the arbitrary `name:` string ("Vercel - coffey-codes: Test") defined in the `with` block. Both dashboards must be configured to look for the correct corresponding string.
- **Gotcha Alert 3 — The Silent Production Hang (this one burned me):** If your `Test` workflow only triggers on `pull_request`, your PR checks will all go green, you'll merge cheerfully, and then your **production deployment will hang on Vercel indefinitely** waiting for status checks that never arrive. Why: Vercel Deployment Checks evaluate the commit that's *being deployed*. When a PR is squash-merged (or merged at all), master gets a **brand-new commit SHA** that has never been through CI. The `pull_request` trigger doesn't fire for pushes to master, so no one posts a status for that new SHA. Vercel waits. And waits. You eventually give up and click **Force Promote**.

  **The fix** (straight from [Vercel's Deployment Checks docs](https://vercel.com/docs/deployment-checks)): add a `repository_dispatch` trigger listening for the `vercel.deployment.ready` event that Vercel emits when *any* deployment (including production) is created. Then use the commit SHA from the dispatch payload so the status lands on the right commit:
  ```yaml
  on:
    pull_request:
      branches: [master]
    repository_dispatch:
      types: [vercel.deployment.ready]

  jobs:
    lint:
      steps:
        - uses: actions/checkout@v4
          with:
            # When triggered by Vercel, check out the SHA being deployed.
            # When triggered by a PR, fall back to the default ref.
            ref: ${{ github.event.client_payload.git.sha || github.sha }}
  ```
  Without this, the whole "reverse handshake" only works on PRs and silently breaks the moment you merge.

### 4. Running Playwright Against the Real Vercel Preview
The weakest link in most "e2e in CI" setups is that Playwright runs against `next dev` inside the runner — a different runtime than production. Point it at the actual preview deployment instead.

- **Trigger on `deployment_status`, not `pull_request`.** Vercel fires a `deployment_status` event when a preview finishes. This event carries the live preview URL in `github.event.deployment_status.target_url` — no polling, no API calls, no race conditions with the build.
- **Filter to successful preview deploys only:**
  ```yaml
  on:
    deployment_status:

  jobs:
    e2e:
      if: github.event.deployment_status.state == 'success' && github.event.deployment.environment != 'Production'
  ```
- **Make Playwright config environment-aware.** Read a `PLAYWRIGHT_BASE_URL` env var; when it's set, skip the local `webServer` block entirely:
  ```ts
  const externalBaseURL = process.env.PLAYWRIGHT_BASE_URL
  export default defineConfig({
    use: { baseURL: externalBaseURL ?? 'http://127.0.0.1:3000' },
    webServer: externalBaseURL ? undefined : { /* local dev server */ },
  })
  ```
- **Vercel Deployment Protection.** Preview deployments are password-gated by default, so Playwright gets a login screen instead of your app. Fix: create a **Protection Bypass for Automation** token in Vercel (Settings → Deployment Protection), store it as the `VERCEL_AUTOMATION_BYPASS_SECRET` GitHub secret, and forward it on every request:
  ```ts
  extraHTTPHeaders: bypassSecret
    ? { 'x-vercel-protection-bypass': bypassSecret }
    : undefined,
  ```
- **Checkout the commit, not the branch head.** Inside a `deployment_status` workflow, `github.sha` is the default-branch SHA. Use `github.event.deployment.sha` so Playwright tests match the code that was actually deployed:
  ```yaml
  - uses: actions/checkout@v4
    with:
      ref: ${{ github.event.deployment.sha }}
  ```
- **Gotcha Alert 3**: GitHub only runs `deployment_status` workflows from workflow files that exist on the repository's default branch. The first PR that adds the workflow won't trigger it — merge first, then open a second PR to verify.
- **Why split it from the main `Test` workflow?** Keeping lint/unit/typecheck on `pull_request` means they run instantly on push. The e2e job waits for Vercel, which takes 1–3 minutes. Separate workflow files keep fast feedback fast while still blocking merges on real-environment e2e via Branch Protection.

### 5. Eliminating "Shortcuts" for True Type Safety
- Briefly touch on the importance of not cheating the CI/CD pipeline. Using `as any`, `as never`, or `@ts-ignore` inside tests completely defeats the purpose of the `typecheck` pipeline step.
- Advocate for beautifully typed architectures (like using correctly typed `vi.fn<() => Type>()` mocks instead of inline assertions).

## Outline Structure
1. **Introduction**: The nightmare of a broken production deployment and how CI/CD solves it.
2. **The Stack**: Next.js, TypeScript, GitHub Actions, Vercel, Vitest, Playwright.
3. **Step 1: Building the GitHub Workflow**: Setting up the matrix of lint, unit, and typecheck jobs on `pull_request`.
4. **Step 2: Connecting Vercel Preview Builds**: Enabling previews and adding the `vercel/preview` check to GitHub Branch Protection.
5. **Step 3: The Handshake**: Adding the Vercel Deployment Check to wait for GitHub Actions, including the YAML configuration and token gotchas.
6. **Step 4: E2E Against the Real Preview**: A separate `deployment_status`-triggered workflow that runs Playwright against the live Vercel preview URL, with environment-aware config and a Vercel Protection Bypass token.
7. **Step 5: Hardening the Rules**: The final Branch Protection checklist. **Required status checks:** `Test / ESLint`, `Test / Vitest`, `Test / TypeScript`, `Test / Notify Vercel`, `E2E (Vercel Preview) / Playwright`. **Require deployments to succeed:** `Preview` (and only `Preview` — document why the other environment names don't work in PR context).
8. **Conclusion**: The peace of mind that comes with a perfectly automated, fully-typed pipeline that tests the actual runtime production will use.

