---
service: coffey.codes
repo: https://github.com/anthonycoffey/coffey.codes
updated: 2026-05-11
---

# Agent Brief: coffey.codes

> This document provides context for AI agents (Claude, etc.) working in this repo. Keep it updated as the codebase evolves.

## Purpose

Personal website, portfolio, and blog for Anthony Coffey (coffey.codes). It serves as:

- A digital resume and portfolio showcasing work history, skills, and projects
- A blog for publishing technical articles (MDX-powered)
- A point of contact for potential clients and employers
- A place to publish hands-on technical writing on software development and AI/ML — the kind of content that signals senior IC depth, not advisory positioning

**Target audience:** Recruiters, potential clients, freelance collaborators, and developer peers.

## Tech Stack

| Layer           | Technology                                        |
| --------------- | ------------------------------------------------- |
| Language        | TypeScript                                        |
| Framework       | Next.js (App Router, canary)                      |
| UI              | React (Server + Client Components)                |
| Styling         | Tailwind CSS v4 + SASS (`styles/global.sass`)     |
| Theming         | next-themes (system preference, no manual toggle) |
| Content         | MDX via next-mdx-remote + sugar-high              |
| 3D Graphics     | Three.js, @react-three/fiber, @react-three/drei   |
| Animation       | motion                                            |
| Icons           | @heroicons/react                                  |
| Hosting         | Vercel (auto-deploys from `main`)                 |
| Package Manager | npm                                               |

## Key Dependencies

- `next-mdx-remote` — MDX rendering for blog posts
- `@react-three/fiber` + `@react-three/drei` — 3D homepage scene (`components/canvas/WorldCanvas.tsx`)
- `gsap` (ScrollTrigger) — scroll-driven homepage timeline
- `next-themes` — dark/light mode from system preference
- `motion` — animations
- `formik` + `yup` — contact form
- `@giscus/react` — article comments backed by GitHub Discussions
- Node.js >= 24.0.0 required (enforced in `package.json` engines)

## Entry Points

- `app/layout.tsx` — Root layout; includes Nav, Footer, GTM (GTM-KJC6Q389), next-themes provider, site-wide Person + Organization JSON-LD
- `app/page.tsx` — Homepage (thin; mounts `<ScrollContainer>` + `<WorldCanvas>` + `<HUDOverlay>`)
- `app/articles/[slug]/page.tsx` — Individual blog post rendering; emits BlogPosting + BreadcrumbList JSON-LD
- `app/api/search/route.ts` — Article search API
- `components/canvas/WorldCanvas.tsx` — Scroll-driven 3D homepage scene (Three.js + R3F)
- `components/Comments.tsx` — Giscus widget on every article
- `components/mdx.tsx` — MDX component registry (custom components available in blog posts)

## Key File Locations

```
app/
├── articles/posts/         # MDX blog post files
├── api/search/route.ts     # Search API
├── lp/                     # ICP-targeted landing pages (4 pages)
├── og/                     # OG image generation
├── rss/                    # RSS feed
├── sitemap.ts              # Sitemap
└── robots.ts               # robots.txt

components/
├── mdx.tsx                 # MDX component registry
├── SearchBox.tsx           # Client component — article search UI
├── ContactForm.tsx         # Client component — contact form
├── nav.tsx                 # Site navigation
├── footer.tsx              # Site footer
├── Callout.tsx             # MDX callout component
├── ThreeScene.tsx          # Three.js 3D scene
└── FishbowlScene.tsx       # Three.js fishbowl scene
```

## API / Interface Contracts

### Article Search — `GET /api/search?q={query}`

Returns filtered blog post metadata matching the query. Used by `components/SearchBox.tsx`.

### MDX Frontmatter (blog posts)

```yaml
---
title: 'Article Title'
summary: 'Short description for SEO and previews'
publishedAt: 'YYYY-MM-DD'
updated: 'YYYY-MM-DD' # optional, asserts a meaningful update
tags: ['tag1', 'tag2']
category: 'category-name'
image: '/path/to/og-image.jpg' # optional
---
```

`updated:` is the editorial signal for a substantive refresh and feeds `BlogPosting.dateModified` directly. When absent, [`app/(site)/articles/[slug]/page.tsx`](../../../app/(site)/articles/[slug]/page.tsx) falls back to the file's `mtime`, then to `publishedAt`. Set `updated:` for real refreshes; skip it for typo or formatting fixes so noise doesn't pollute the freshness signal.

## Environment Variables

No environment variables are required for local development.

## Common Tasks

### Add a new blog post

1. Create `app/articles/posts/{slug}.mdx`
2. Add YAML frontmatter (title, summary, publishedAt, tags, category)
3. Write MDX content — can use custom components from `components/mdx.tsx`
4. The post auto-appears in article listings and search

### Add a new page/route

1. Create `app/{route}/page.tsx` (Server Component by default)
2. Export a `metadata` object or `generateMetadata` function for SEO
3. Use `'use client';` only if the component needs state/effects/browser APIs

### Run locally

```bash
npm install
npm dev        # http://localhost:3000
```

### Build for production

```bash
npm build
npm start
```

### Run tests

```bash
npm test               # Vitest unit + component tests
npm run test:watch     # Vitest watch mode
npm run test:coverage  # Vitest with coverage report
npm run test:e2e       # Playwright e2e (requires dev server)
npm run typecheck      # tsc --noEmit
```

### Pull and compare SEO snapshots

All SEO work runs through `@anthonycoffey/periscope` (SPEC-018 + SPEC-019 + SPEC-020 + SPEC-023). The package source lives at https://github.com/anthonycoffey/periscope (extracted from this repo 2026-05). coffey.codes consumes it as a devDependency and exposes it through `npm run seo:*` scripts. Project-specific paths and ids come from `periscope.config.mjs` at the repo root. Snapshots are committed to git so older periods (GSC's window only goes back 16 months) stay diffable.

```bash
npm run seo:snapshot                            # all configured engines, 365d
npm run seo:snapshot -- --engines=gsc           # one engine only
npm run seo:snapshot -- --engines=gsc,keywords  # enrich GSC with Ads
npm run seo:snapshot -- --asof=2026-05-09       # anchor "today" to a past date
npm run seo:snapshot -- --dry-run               # print plan, skip API calls
npm run seo:diff -- older.json newer.json
```

Setup (env vars in `.env` or `.env.local`):

- `GSC_SERVICE_ACCOUNT_KEY_PATH` or `GSC_SERVICE_ACCOUNT_JSON` (Google service account; reused for GA4 and Google Ads)
- `GA4_PROPERTY_ID` (currently `416080229`; Data API enabled in Cloud, service account granted Viewer in GA4 Property Access). Also settable via `periscope.config.ga4PropertyId`.
- `BING_WEBMASTER_API_KEY` (generated in Bing Webmaster Tools → Settings → API Access)
- `GOOGLE_ADS_DEVELOPER_TOKEN`, `GOOGLE_ADS_CUSTOMER_ID`, `GOOGLE_ADS_LOGIN_CUSTOMER_ID` (developer token from Ads UI; the service account must be added as a user inside the Ads account)

Each engine skips gracefully if its env vars are missing. Full setup walk-through is in [docs/documentation/guides/seo-snapshot-setup.md](../guides/seo-snapshot-setup.md). One-time periscope install (PAT + `.npmrc`) is in `CLAUDE.md`.

### Run keyword research tools

Four commands consume the snapshot + Google Ads API to answer concrete editorial questions:

```bash
npm run seo:audit-articles                          # OPPORTUNITY flags per article
npm run seo:discover-topics                         # ranked editorial backlog
npm run seo:validate-lps                            # WELL_TARGETED / OVER_AMBITIOUS verdict per LP
npm run seo:probe -- https://competitor.com         # stdout-only competitor probe
```

Reports land in `outputDir` (default `docs/strategy/data/`) as dated markdown; reruns on the same day overwrite (history lives in git).

Vitest + Testing Library + jsdom is configured for unit and component tests. Playwright e2e lives in `e2e/` and exercises rendered pages against a live Vercel preview. TDD (RED → GREEN → REFACTOR) is the expected workflow per `docs/documentation/development-standards.md`.

## CI gate

Production promotion is blocked until every required check is green (see [system-overview](../guides/system-overview.md) for the full handshake):

1. GitHub Actions: ESLint, Vitest with coverage, `tsc --noEmit` typecheck (parallel jobs).
2. Vercel builds the Preview Deployment.
3. Playwright runs against the preview URL (uses the Vercel protection bypass header).
4. All four checks must pass before main is promotable.

## Known Gotchas

- **Async params in Next.js 15+** — `params` and `searchParams` must be awaited in page components. See the article `fixing-broken-routes-after-nextjs-16-upgrade.mdx` for full context.
- **Client vs Server Components** — Components with `'use client';` cannot export `metadata`. Use a wrapping `layout.tsx` (Server Component) to handle metadata for Client Component pages (e.g., `app/portfolio/layout.tsx`).
- **Contact form goes to a Google Cloud Function** — `components/ContactForm.tsx` posts to `/functions/sendContactFormEmail`, which is a Next.js rewrite to a `us-central1` Cloud Function. No CORS surface; the public URL is hidden behind the rewrite.
- **Node.js >= 24 required** — enforced in `package.json` engines field. Older versions will fail `npm install`.

## Related Docs

- [System Overview](../guides/system-overview.md) — end-to-end picture: content pipeline, CI/CD, all surfaces
- [Repo Technical Reference](../repos/coffey-codes.md)
- [Development Standards](../development-standards.md)
- [On-Page SEO Strategy](../deep-dives/onpage-seo-strategy.md) — page-level metadata and structured data
- [CTR-by-position baseline](../deep-dives/ctr-by-position-baseline.md) — site-specific SEO performance curve
- [SEO snapshot setup](../guides/seo-snapshot-setup.md) — how to wire and run periscope's four-engine snapshot command
- [SEO tooling inventory](../guides/seo-tooling-inventory.md) — at-a-glance map of every periscope command, engine, and lib module
