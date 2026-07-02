---
id: SPEC-032
title: 'Reusable lead-capture form for /lp landing pages'
status: ready
created: 2026-07-02
author: 'Anthony Coffey'
reviewers: []
affected_repos: [coffey-codes]
---

## Reviewer Notes

<!-- Leave empty until code review. When requesting changes, reviewer adds feedback here: -->

---

# Feature: Reusable lead-capture form for /lp landing pages

## Problem

The four `/lp` ad landing pages embed `components/ContactForm.tsx`, which collects only name, email, message, and consent. That is enough for a nav contact form but too thin for paid-ad lead capture: it does not qualify the prospect (stage, timeline, budget) or signal delivery expertise, and it gives no per-page attribution. As paid campaigns launch ($5/day on Meta and Google Search), the landing pages need a richer, reusable form that qualifies leads, demonstrates understanding of the delivery lifecycle, and reports which page produced each lead, while reusing the exact submit path the contact form already uses.

## Requirements

### Must have

1. WHEN a visitor submits the lead form with all required fields valid, the system SHALL POST to `/functions/sendContactFormEmail` (the same endpoint and rewrite `ContactForm` uses) and, on a 2xx response, show a success state and push `{ event: 'form_submit', formName: <page> }` to the dataLayer.
2. WHEN the form is rendered, the system SHALL collect: name (required), email (required, valid), company (optional), phone (optional), project brief (required), and three required dropdowns — project stage/lifecycle, timeline, budget range — plus a required consent checkbox.
3. WHEN the payload is built, the system SHALL keep the `name`, `email`, and `consent` keys intact AND compose a human-readable `message` string embedding every structured field (company, phone, brief, stage, timeline, budget), so the existing backend delivers the full inquiry regardless of whether it reads the new keys.
4. WHEN a required field is missing or invalid, the system SHALL block submission and show an inline validation error (Formik + Yup, matching `ContactForm` behavior).
5. WHEN the backend responds non-2xx or the request throws, the system SHALL show an error state and NOT show the success state.
6. The shared submit behavior SHALL be extracted into a hook (`hooks/useLeadFormSubmit.ts`) consumed by both the new `LeadForm` and the refactored `ContactForm`, with a configurable `formName`. `ContactForm` behavior SHALL be unchanged (still `formName: 'contact'`).
7. The form SHALL link to `/case-studies` and `/portfolio`, each opening in a new tab (`target="_blank" rel="noopener noreferrer"`).
8. Each `/lp` page SHALL render `LeadForm` with its own `formName` (`lp_practical_ai`, `lp_sme_web_mobile`, `lp_smb_web_marketing`, `lp_strategic_partners`).

### Nice to have

- Dropdown option sets defined as typed constants for reuse and testability.
- `formName` also passed as a structured payload key (in addition to the dataLayer event) for backend-side attribution.

### Non-goals (what this does NOT do)

- Does NOT redesign the `/lp` page layout or rewrite page copy (Phase 2).
- Does NOT change the Google Cloud Function backend.
- Does NOT set up ad-platform pixels/conversions (documented separately in `paid-ads-conversion-tracking.md`).
- Does NOT touch the `/contact` page's use of `ContactForm` beyond the internal hook refactor.

## Design

- **`hooks/useLeadFormSubmit.ts`** — encapsulates the `fetch('/functions/sendContactFormEmail', { method: 'POST', ... })` call, success/error handling, and the `dataLayer.push({ event: 'form_submit', formName })`. Returns `{ submit, status: 'idle' | 'submitting' | 'sent' | 'error', error }` (or equivalent). Accepts `formName`.
- **`components/ContactForm.tsx`** — refactored to consume the hook; same fields, same `formName: 'contact'`, same UI. No behavior change.
- **`components/LeadForm.tsx`** (`'use client'`) — Formik + Yup on the hook. Props: `formName: string`, optional `heading`/`ctaLabel`. Reuses the existing input/label/error Tailwind class strings and the spinner/success/error UI so it is visually consistent with `ContactForm`. Fields per requirement 2; dropdowns rendered as `Field as="select"`. Builds the composed `message` in `onSubmit` before calling `submit`.
- **Payload shape** (example):
  ```json
  {
    "name": "...", "email": "...", "consent": true,
    "company": "...", "phone": "...", "projectBrief": "...",
    "projectStage": "...", "timeline": "...", "budget": "...",
    "formName": "lp_practical_ai",
    "message": "Project brief: ...\nCompany: ...\nPhone: ...\nStage: ...\nTimeline: ...\nBudget: ..."
  }
  ```
- **Wiring** — replace `<ContactForm />` with `<LeadForm formName="lp_..." />` in the four `app/lp/*/page.tsx` files. Surrounding layout unchanged.

## Edge cases

- [ ] Backend only reads `name`/`email`/`message`: handled by the composed `message` string (requirement 3).
- [ ] Consent unchecked: Yup blocks submit (`oneOf([true])`), matching `ContactForm`.
- [ ] Network throw vs. non-2xx: both set error state; success never shows.
- [ ] E2E must not send real email: Playwright stubs `**/functions/sendContactFormEmail` via `page.route` so CI never hits the live function.
- [ ] Double submit: the submit button is disabled while `status === 'submitting'`.

## Acceptance criteria

1. Unit tests (`__tests__/components/LeadForm.test.tsx`) cover: required-field validation for each field and dropdown, successful submit (fetch mocked) rendering success + dataLayer push with the passed `formName`, error response and network-throw paths, and a payload assertion that the composed `message` contains the brief and all three dropdown selections.
2. Unit test (`__tests__/components/ContactForm.test.tsx`) locks the refactor: submit still POSTs to the endpoint and fires `form_submit` with `formName: 'contact'`.
3. E2E test (`e2e/lead-form.spec.ts`) against `/lp/practical-ai` with the network stubbed: fills all fields incl. dropdowns, submits, asserts success UI; asserts empty submit is blocked; asserts case-studies/portfolio links have `target="_blank"`.
4. `npm run lint`, `npm run typecheck`, `npm run test:coverage` pass locally and in CI; `e2e.yml` passes against the Vercel preview.
5. All four `/lp` pages render `LeadForm` with the correct per-page `formName`; `/contact` still renders `ContactForm`.

## Constraints

- Reuse the existing endpoint, rewrite, and consent/GTM setup; no new backend.
- Follow the repo TDD flow (RED -> GREEN -> REFACTOR) and Vitest/Playwright conventions (see `docs/documentation/development-standards.md`).
- Coverage thresholds in `vitest.config.ts` must stay green.

## Tasks

- [ ] Extract `hooks/useLeadFormSubmit.ts`; refactor `ContactForm` onto it.
- [ ] Add `__tests__/components/ContactForm.test.tsx` (lock refactor).
- [ ] Build `components/LeadForm.tsx` with fields, dropdowns, composed payload, and case-study/portfolio links.
- [ ] Add `__tests__/components/LeadForm.test.tsx`.
- [ ] Add `e2e/lead-form.spec.ts` with `page.route` network stub.
- [ ] Wire `LeadForm` into the four `app/lp/*/page.tsx` files with per-page `formName`.
- [ ] Run lint, typecheck, unit, and e2e; open PR.

## Notes

- Related docs: [`icp-landing-page-map.md`](../../documentation/guides/marketing/icp-landing-page-map.md) (per-page `formName`), [`ga4-events.md`](../../strategy/ga4-events.md) (`form_submit` and `formName` values), [`landing-page-copywriting.md`](../../documentation/guides/marketing/landing-page-copywriting.md) (form-field discipline rationale), [`paid-ads-conversion-tracking.md`](../../documentation/guides/marketing/paid-ads-conversion-tracking.md).
- Part of the landing-page funnel overhaul (Phase 1). Phase 2 redesigns the `/lp` layout/copy; this spec keeps layout untouched.
