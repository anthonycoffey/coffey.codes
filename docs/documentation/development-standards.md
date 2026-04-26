# Development Standards

This document defines how we work on coffey.codes — the development process, testing philosophy, spec lifecycle, and version control conventions.

---

## Development Process

We follow a **spec-first, plan-driven** approach. No feature or bug fix begins without a written spec.

```
1. Plan      → Understand the problem. Identify unknowns. Research alternatives.
2. Spec      → Write a spec (feature or bug) in docs/specs/active/.
3. Approve   → Get spec status to `ready` before writing code.
4. Test      → Write failing tests first (RED phase).
5. Implement → Write the minimum code to make tests pass (GREEN phase).
6. Refactor  → Clean up the implementation while keeping all tests green.
7. Review    → PR opened, spec status → `review-pending`.
8. Ship      → Merge, deploy. Spec status → `complete`. Move to archive.
```

Specs serve as the contract between intent and implementation. If you're writing code without a spec, stop and write one first.

---

## Test-Driven Development (TDD)

We use the RED → GREEN → REFACTOR cycle.

### RED — Write a failing test

Write a test that describes the desired behavior. Run it. It must fail (red) before you write any implementation code.

```
# The test describes what the code should do.
# It should fail because the implementation doesn't exist yet.
```

### GREEN — Make the test pass

Write the minimum code necessary to make the failing test pass. Don't over-engineer. Don't add features not covered by a test.

### REFACTOR — Clean up

With the test passing (green), improve the code quality: extract duplication, clarify naming, simplify logic. Run tests after every change to ensure they stay green.

### Why TDD?

- Forces you to think about the interface before the implementation
- Produces a regression test suite as a side effect of development
- Makes the scope of each task explicit and small

---

## E2E Testing (Playwright)

E2E tests live in `e2e/` and run via `npm run test:e2e` against a live dev server (see `playwright.config.ts`).

### Opacity-based visibility

Playwright's `toBeVisible()` / `toBeHidden()` only check `display: none` and `visibility: hidden`. They do **not** check `opacity`. An element with `opacity: 0` is still considered "visible" by Playwright, even if it is invisible to the user.

This matters whenever a component shows/hides via a CSS opacity transition (e.g. `opacity: 0` → `opacity: 1` on a class toggle). Checking child text with `toBeVisible()` in this pattern produces **false positives** — the text is always "visible" to Playwright regardless of the parent panel's opacity.

**Pattern to use instead:** assert on the CSS module class that controls visibility.

```typescript
// The compiled CSS module class contains the original name as a substring,
// so a regex match against the full class string is reliable.

// ✅ Correct — checks the panel container's class, not child opacity
await expect(panel).toHaveClass(/visible/)      // panel is showing
await expect(panel).not.toHaveClass(/visible/)  // panel is hidden

// ⚠️  Misleading — passes even when the panel has opacity: 0
await expect(page.getByText('...')).toBeVisible()
await expect(page.getByText('...')).toBeHidden()
```

Use `toContainText()` on the panel container to verify rendered text content; use `toHaveClass(/visible/)` to verify visibility state.

---

## Spec Lifecycle

```
draft → ready → in-progress → review-pending → complete
                                    ↓
                               deprecated (from any status)
```

| Status | Meaning | Who sets it |
|--------|---------|-------------|
| `draft` | Being written; not ready for development | Author |
| `ready` | Approved for development; requirements are complete | Author + reviewer |
| `in-progress` | Development is underway | Developer |
| `review-pending` | Implementation complete; awaiting code review | Developer |
| `complete` | Shipped, verified, and closed | Reviewer |
| `deprecated` | No longer relevant; superseded or cancelled | Author |

**Rules:**
- Never start coding on a spec with status `draft`
- ADR status transitions: `proposed` → `accepted` | `deprecated` | `superseded`
- ADRs are never deleted or archived — they are permanent records

---

## Version Control Conventions

### Branch Naming

```
feature/short-description      # New feature
fix/short-description          # Bug fix
chore/short-description        # Non-functional changes (deps, tooling, docs)
refactor/short-description     # Code restructuring without behavior change
```

Examples:
```
feature/contact-form-backend
fix/broken-taxonomy-routes
chore/upgrade-nextjs-16
refactor/search-api-handler
```

### Commit Messages

Use the imperative mood. Reference the spec ID when applicable.

```
<type>: <short description> [SPEC-XXX]

<optional body — what and why, not how>
```

**Types:**
- `feat` — new feature
- `fix` — bug fix
- `chore` — tooling, deps, CI, non-functional changes
- `refactor` — restructuring without behavior change
- `docs` — documentation only
- `test` — tests only
- `style` — formatting, linting (no logic change)

**Examples:**
```
feat: add contact form API route with Resend integration [SPEC-001]
fix: resolve broken category routes after Next.js 16 upgrade [BUG-003]
chore: upgrade next to canary
docs: add agent brief for coffey.codes
```

### Branching Strategy

Trunk-based development. All branches are cut from `main` and merged back via pull request. Branches are deleted after merging.

**CRITICAL RULE: NEVER commit directly to `main`.** 
All updates, no matter how small or trivial, must be made on a separate branch and merged via Pull Request. No exceptions.

- `main` — production. Auto-deploys to Vercel.
- Feature/fix branches — short-lived, one spec per branch.

---

## Code Style

See `CLAUDE.md` at the project root for the full code style guide (TypeScript conventions, component patterns, import order, Tailwind usage, etc.).

---

## Tooling

| Tool | Command | Purpose |
|------|---------|---------|
| Dev server | `npm dev` | Local development on port 3000 |
| Build | `npm build` | Production build |
| Lint | `npm lint` | ESLint check |
| Lint fix | `npm lint:fix` | ESLint auto-fix |
| Deploy | Push to `main` | Auto-deploy via Vercel |
