# SPEC-007: Article - Rock-Solid CI/CD with Vercel and GitHub Actions

## Overview
This spec outlines the plan to write an article detailing the setup of an enterprise-grade, rock-solid CI/CD pipeline for a Next.js TypeScript project. The article will cover integrating GitHub Actions (for ESLint, Vitest, Playwright, and Typechecking) with Vercel Preview Deployments and native Vercel Deployment Checks to ensure maximum application stability before PRs can be merged.

## Status
`planned`

## Target Audience
Next.js and TypeScript developers looking to harden their deployment pipeline, prevent broken builds from hitting production, and seamlessly integrate GitHub Actions with Vercel.

## Core Concepts & Key Takeaways

### 1. The Value of Status Checks
Explain how enforcing high code quality requires strict gates. A PR should not be allowed to merge unless:
- The code lints cleanly (ESLint).
- The code is perfectly typed (TypeScript `tsc --noEmit`).
- All unit tests pass (Vitest).
- All end-to-end tests pass (Playwright).
- The actual Vercel Preview environment builds successfully (`vercel/preview` check).

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

### 4. Eliminating "Shortcuts" for True Type Safety
- Briefly touch on the importance of not cheating the CI/CD pipeline. Using `as any`, `as never`, or `@ts-ignore` inside tests completely defeats the purpose of the `typecheck` pipeline step.
- Advocate for beautifully typed architectures (like using correctly typed `vi.fn<() => Type>()` mocks instead of inline assertions).

## Outline Structure
1. **Introduction**: The nightmare of a broken production deployment and how CI/CD solves it.
2. **The Stack**: Next.js, TypeScript, GitHub Actions, Vercel, Vitest, Playwright.
3. **Step 1: Building the GitHub Workflow**: Setting up the matrix of lint, test, and typecheck jobs.
4. **Step 2: Connecting Vercel Preview Builds**: Enabling previews and adding the `vercel/preview` check to GitHub Branch Protection.
5. **Step 3: The Handshake**: Adding the Vercel Deployment Check to wait for GitHub Actions, including the YAML configuration and token gotchas.
6. **Step 4: Hardening the Rules**: The final checklist for GitHub Branch Protection to ensure rock-solid merges.
7. **Conclusion**: The peace of mind that comes with a perfectly automated, fully-typed pipeline.

