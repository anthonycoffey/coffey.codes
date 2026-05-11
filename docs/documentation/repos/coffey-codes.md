# coffey.codes — Technical Reference

**Repo:** https://github.com/anthonycoffey/coffey.codes  
**Deployment:** Vercel (auto-deploys from `main`, gated by GitHub Actions + Playwright e2e)
**Last updated:** 2026-05-11

---

## Architecture Overview

The project uses the **Next.js App Router** architecture:

- **Server-Centric Routing:** File-system based routing within the `app/` directory
- **React Server Components (RSCs):** Components render on the server by default, reducing client-side JavaScript
- **Client Components:** Interactive UI elements opt-in via `'use client';` directive
- **API Routes:** Backend functionality via `app/api/` directory

## Project Structure

```
coffey.codes/
├── app/                        # Next.js App Router
│   ├── api/                    # API routes (search, contact)
│   ├── articles/               # Blog — listing, slugs, categories, tags, search
│   │   ├── posts/              # MDX blog post files
│   │   ├── [slug]/page.tsx     # Individual article rendering
│   │   ├── category/[category]/page.tsx
│   │   └── tag/[tag]/page.tsx
│   ├── case-studies/           # Case studies listing
│   ├── contact/                # Contact page
│   ├── lp/                     # ICP-targeted landing pages
│   ├── og/                     # OG image generation (route handler)
│   ├── portfolio/              # Portfolio showcase
│   ├── rss/                    # RSS feed (route handler)
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Homepage
│   ├── robots.ts               # robots.txt
│   └── sitemap.ts              # Sitemap
├── components/                 # Reusable React components
├── docs/                       # Project documentation (DDD)
├── hooks/                      # Custom React hooks
├── public/                     # Static assets
├── styles/                     # Global styles (SASS)
├── utils/                      # Utility functions
├── CLAUDE.md                   # AI agent development guidelines
└── README.md                   # Project overview
```

## Tech Stack

| Layer           | Technology                   | Notes                      |
| --------------- | ---------------------------- | -------------------------- |
| Framework       | Next.js App Router (canary)  | Hybrid SSR/SSG             |
| Language        | TypeScript                   | Strict mode                |
| UI              | React                        | Server + Client Components |
| Styling         | Tailwind CSS v4              | `darkMode: 'class'`        |
| Global styles   | SASS                         | `styles/global.sass`       |
| Theming         | next-themes                  | System preference only     |
| Content         | next-mdx-remote + sugar-high | MDX blog posts             |
| 3D              | @react-three/fiber + drei    | Homepage scenes            |
| Animation       | motion                       | UI animations              |
| Icons           | @heroicons/react             |                            |
| Package Manager | npm                          | `package.json`             |
| Hosting         | Vercel                       | Auto-deploy from `main`    |
| Analytics       | Google Tag Manager           | GTM-KJC6Q389               |

## Key Technical Decisions

### Next.js App Router

Chosen for hybrid SSR/SSG, React Server Components, and integrated features (image optimization, API routes, OG image generation).

### TypeScript

Strict typing for code quality and maintainability across the codebase.

### Tailwind CSS

Utility-first CSS for rapid development. Complemented by SASS for global styles.

### MDX for Blog Content

Allows JSX components within markdown, enabling rich interactive blog posts. Processed by `next-mdx-remote`.

### npm as Package Manager

npm is preferred for stability/practicality. Lock file is `package.json`.

## Design Patterns

### Server vs Client Components

- **Server Components** (default): static content, data fetching, SEO metadata
- **Client Components** (`'use client';`): state, effects, browser APIs, user interaction

Key client components:

- `components/SearchBox.tsx` — article search UI
- `components/ContactForm.tsx` — contact form
- `components/ThreeScene.tsx`, `FishbowlScene.tsx` — 3D scenes

### Metadata for Client Component Pages

Client Components cannot export `metadata`. Pattern: wrap in a Server Component `layout.tsx` that exports the metadata.

Example: `app/portfolio/layout.tsx` (Server, exports metadata) wraps `app/portfolio/page.tsx` (Client).

### MDX Components

Custom components available in blog posts are registered in `components/mdx.tsx`. To add a new component usable in MDX:

1. Create the component in `components/`
2. Register it in the `components` map in `components/mdx.tsx`

## Critical Implementation Paths

### Blog Post Rendering

1. Request hits `app/articles/[slug]/page.tsx`
2. Page component reads MDX file from `app/articles/posts/{slug}.mdx`
3. `next-mdx-remote` processes MDX content with custom components from `components/mdx.tsx`
4. `generateMetadata` constructs title from frontmatter `title` field, description from `summary`

### Article Search

1. User types in `components/SearchBox.tsx` (Client Component)
2. Debounced `useEffect` calls `GET /api/search?q=...`
3. `app/api/search/route.ts` filters post metadata and returns JSON
4. Results display inline or navigate to `app/articles/search/page.tsx`

### OG Image Generation

- `app/og/route.tsx` generates dynamic OG images
- Used in article `generateMetadata` with optional `image` frontmatter field

## Build & Deployment

```bash
npm install         # Install dependencies (requires Node >= 24)
npm run dev         # Dev server at http://localhost:3000
npm run build       # Production build
npm run start       # Run production build locally
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm test            # Vitest unit + component tests
npm run test:e2e    # Playwright (requires dev server or preview URL)
```

**CI gate (see [system-overview](../guides/system-overview.md) for the full handshake):**

1. GitHub Actions: ESLint, Vitest + coverage, TypeScript typecheck (parallel).
2. Vercel Preview builds the branch.
3. Playwright runs against the preview URL via the `x-vercel-protection-bypass` header.
4. All four checks must be green before Vercel will promote the deployment to production.

**Deployment:** Push to `main` → Vercel auto-deploys once required checks pass.

### Comments

Article comments are powered by Giscus on top of GitHub Discussions in `anthonycoffey/coffey.codes` (category: **General**). [components/Comments.tsx](components/Comments.tsx) mounts on every article page, keyed by `pathname`. Theme follows `next-themes`. Moderation happens in the GitHub Discussions UI.

## Structured data (SEO)

JSON-LD is emitted across the site to give Google's Knowledge Graph and other crawlers a coherent entity picture. See [On-Page SEO Strategy](../deep-dives/onpage-seo-strategy.md) for the full schema breakdown.

- **`app/layout.tsx`**: site-wide `Person` (with `sameAs` to GitHub, LinkedIn, Linktr.ee) and `Organization` (publisher block, also `sameAs`).
- **`app/articles/[slug]/page.tsx`**: `BlogPosting` with `author`, `publisher`, `dateModified`; `BreadcrumbList` for crawl context.
- **`app/case-study/[slug]/page.tsx`**: same pattern as articles.
- **`/articles?page=N` (page > 1)**: `noindex` to suppress pagination duplication in SERPs.

## SEO data pipeline

`scripts/seo-snapshot.mjs` (SPEC-018 + SPEC-019) pulls Google Search Console, GA4, Bing Webmaster Tools, and Google Ads Keyword Planner into a single dated JSON snapshot in `docs/strategy/data/`. `scripts/seo-snapshot-diff.mjs` compares two snapshots.

Snapshots are committed to git because GSC's data window is only 16 months and historical data is otherwise lost. Each snapshot is roughly 80-120 KB.

Four follow-on tools (SPEC-020) consume the snapshot + Google Ads API to produce editorial reports:

- `scripts/keyword-audit-articles.mjs` — flags articles ranking on long-tails where Ads suggests a higher-volume term they could target
- `scripts/keyword-discover-topics.mjs` — ranked editorial backlog of fresh keyword ideas (filters out topics already covered by existing slugs)
- `scripts/keyword-validate-lps.mjs` — verdict (`WELL_TARGETED` / `UNDER_INVESTED` / `OVER_AMBITIOUS`) per `app/lp/*/page.tsx`
- `scripts/keyword-probe-url.mjs` — one-shot competitor URL probe; stdout-only

All four reuse `scripts/lib/google-ads.mjs` (shared service-account JWT auth, direct REST against `googleads.googleapis.com/v17/`, no `google-ads-api` dep). Full setup in [SEO snapshot setup](../guides/seo-snapshot-setup.md).

## Known Issues / Pending Work

| Item                | Status               | Notes                                                             |
| ------------------- | -------------------- | ----------------------------------------------------------------- |
| Bing data backfill  | Not possible         | Bing Webmaster Tools recording started 2026-05-10; ~90 days needed before meaningful comparison |
| Content strategy doc | In progress (SPEC-017) | Editorial follow-up to the Q2/Q3 SEO audits                     |

## Version Control

- **Strategy:** Trunk-based. Feature branches from `main`, short-lived, deleted after merge.
- **Branch naming:** `feature/`, `fix/`, `chore/`, `refactor/`
- **Deployment branch:** `main` (protected, auto-deploys to Vercel)

See [Development Standards](../development-standards.md) for full conventions.
