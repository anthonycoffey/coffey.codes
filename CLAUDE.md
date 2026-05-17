# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Documentation

Before starting any non-trivial task, read the relevant docs:

- **Agent brief** (start here): `docs/documentation/agents/coffey-codes.md` — tech stack, entry points, API contracts, common tasks, gotchas
- **Repo technical reference**: `docs/documentation/repos/coffey-codes.md` — architecture decisions, critical implementation paths, design patterns
- **Development standards**: `docs/documentation/development-standards.md` — spec-first workflow, TDD cycle, version control conventions
- **Docs structure**: `docs/README.md` — how the docs/ folder is organized and the spec lifecycle

## Commands

```bash
npm run dev            # Dev server on localhost:3000
npm run build          # Production build
npm run start          # Run production build locally
npm run lint           # ESLint
npm run lint:fix       # ESLint auto-fix
npm test               # Vitest unit + component tests (one-shot)
npm run test:watch     # Vitest watch mode
npm run test:coverage  # Vitest with coverage report
npm run test:e2e       # Playwright e2e tests (requires dev server)
npm run typecheck      # tsc --noEmit
```

SEO tooling (via `@anthonycoffey/periscope` from GitHub Packages, see Setup below):

```bash
npm run seo:snapshot         # Pull multi-engine snapshot
npm run seo:diff             # Diff two snapshot JSONs
npm run seo:audit-articles   # Flag article keyword fit
npm run seo:discover-topics  # Editorial backlog from Ads + GSC
npm run seo:validate-lps     # Validate LP keyword targets
npm run seo:probe -- <url>   # One-shot competitor URL probe
npm run seo:doctor           # Diagnose engine credentials and access
```

Vitest + Testing Library is configured for unit/component tests; Playwright lives in `e2e/` for end-to-end. TDD (RED → GREEN → REFACTOR) is the expected workflow for new features — see `docs/documentation/development-standards.md`.

## Periscope (SEO tooling) setup

The `seo:*` scripts call `@anthonycoffey/periscope`, a private package on GitHub Packages. Source lives at https://github.com/anthonycoffey/periscope (extracted from this repo in 2026-05; originally driven by [SPEC-023](docs/specs/archive/SPEC-023-periscope-tool-suite.md)).

One-time setup per machine:

1. Generate a PAT at https://github.com/settings/tokens with **only** the `read:packages` scope. Copy the `ghp_...` value.
2. Set the env var so npm can read it:
   - PowerShell (persistent): `setx GITHUB_PACKAGES_TOKEN "ghp_yourTokenHere"` (open a new terminal after)
   - Or inline for a single session: `$env:GITHUB_PACKAGES_TOKEN = "ghp_yourTokenHere"`
3. Copy the template to a gitignored `.npmrc`:
   ```bash
   cp .npmrc.example .npmrc
   ```
4. Install (it's already in `devDependencies`, so a fresh clone just needs `npm install`):
   ```bash
   npm install
   ```
5. Verify:
   ```bash
   npx periscope --version
   npx periscope --help
   ```

To update to a new release:
```bash
npm update @anthonycoffey/periscope
```

Project-specific config lives at `periscope.config.mjs` at the repo root.

## Architecture

**Stack:** Next.js 16 App Router · React 19 · TypeScript · Tailwind CSS v4 + SASS · MDX · Three.js · Vercel

- **Server Components by default.** Only add `'use client'` when you need state, effects, or browser APIs.
- **Client components cannot export `metadata`.** Wrap them in a Server Component parent if metadata is needed.
- **Async params:** Next.js 15+ requires `params` and `searchParams` to be awaited before use.
- **Path alias:** `@/*` maps to the repo root.
- **SASS globals:** `styles/global.sass` — imported via `sassOptions` in `next.config.js`.
- **Theming:** `next-themes` reads system preference only; there is no manual toggle.
- **Backend:** Google Cloud Functions, proxied via Next.js rewrite at `/functions/*`.
- **Node.js >= 22.0.0 required** (enforced by `camera-controls` dependency).

### Key directories

| Path                  | Purpose                                              |
| --------------------- | ---------------------------------------------------- |
| `app/articles/posts/` | MDX blog post files                                  |
| `app/lp/`             | ICP-targeted landing pages (use `LandingPageHeader`) |
| `app/og/`             | Dynamic OG image generation                          |
| `components/mdx.tsx`  | MDX component registry — add new MDX components here |
| `utils/`              | Shared utilities                                     |
| `hooks/`              | Custom React hooks                                   |
| `styles/`             | Global SASS                                          |

### Blog post frontmatter

```yaml
title: ''
summary: ''
publishedAt: 'YYYY-MM-DD'
tags: []
category: ''
image: '' # optional
```

### Critical implementation paths

1. **Blog post rendering:** `app/articles/[slug]/page.tsx` → reads `app/articles/posts/{slug}.mdx` → `next-mdx-remote` with components from `components/mdx.tsx` → `generateMetadata` from frontmatter
2. **Article search:** `SearchBox` (client) → debounced `GET /api/search?q=...` → `app/api/search/route.ts` → filtered JSON
3. **Contact form:** `ContactForm.tsx` (Formik + Yup) → Google Cloud Function via `/functions/*` rewrite

## Development workflow

Spec-first DDD + TDD. In order:

1. **Plan** — understand the problem, identify unknowns
2. **Spec** — use `/new-spec` or `/new-bug` to create a doc in `docs/specs/active/`
3. **Approve** — get spec to `ready` status before writing code
4. **Test (RED)** — write failing tests
5. **Implement (GREEN)** — minimum code to pass
6. **Refactor** — clean up while keeping tests green
7. **PR → Ship** — merge, spec → `complete`, move to archive

Full detail: `docs/documentation/development-standards.md`

## Version control

- **Strategy:** Trunk-based — short-lived branches off `main`, deleted after merge
- **Branch naming:** `feature/`, `fix/`, `refactor/`
- **Commit format:** `<type>: <description> [SPEC-XXX]`
- **Commit types:** `feat`, `fix`, `refactor`, `docs`, `test`, `style`
- **Deployment:** Push to `main` → Vercel auto-deploys

## Custom slash commands

These commands scaffold documents from canonical templates in `docs/templates/`:

- `/new-spec` → feature spec in `docs/specs/active/`
- `/new-bug` → bug report in `docs/specs/active/`
- `/new-adr` → ADR in `docs/specs/adrs/`
- `/new-agent-brief` → agent brief in `docs/documentation/agents/`

## Known issues

- Node.js >= 24 is required; the project will not build on older versions
