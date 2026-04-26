---
service: coffey.codes
repo: https://github.com/anthonycoffey/coffey.codes
updated: 2026-04-13
---

# Agent Brief: coffey.codes

> This document provides context for AI agents (Claude, etc.) working in this repo. Keep it updated as the codebase evolves.

## Purpose

Personal website, portfolio, and blog for Anthony Coffey (coffey.codes). It serves as:
- A digital resume and portfolio showcasing work history, skills, and projects
- A blog for publishing technical articles (MDX-powered)
- A point of contact for potential clients and employers
- A platform for thought leadership in software development and AI/ML

**Target audience:** Recruiters, potential clients, freelance collaborators, and developer peers.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript |
| Framework | Next.js (App Router, canary) |
| UI | React (Server + Client Components) |
| Styling | Tailwind CSS v4 + SASS (`styles/global.sass`) |
| Theming | next-themes (system preference, no manual toggle) |
| Content | MDX via next-mdx-remote + sugar-high |
| 3D Graphics | Three.js, @react-three/fiber, @react-three/drei |
| Animation | motion |
| Icons | @heroicons/react |
| Hosting | Vercel (auto-deploys from `main`) |
| Package Manager | npm |

## Key Dependencies

- `next-mdx-remote` — MDX rendering for blog posts
- `@react-three/fiber` + `@react-three/drei` — 3D scenes (FishbowlScene, ThreeScene)
- `next-themes` — dark/light mode from system preference
- `motion` — animations
- Node.js >= 22.0.0 required (due to `camera-controls` via `@react-three/drei`)

## Entry Points

- `app/layout.tsx` — Root layout; includes Nav, Footer, GTM (GTM-KJC6Q389), next-themes provider
- `app/page.tsx` — Homepage
- `app/articles/[slug]/page.tsx` — Individual blog post rendering
- `app/api/search/route.ts` — Article search API
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
title: "Article Title"
summary: "Short description for SEO and previews"
publishedAt: "YYYY-MM-DD"
tags: ["tag1", "tag2"]
category: "category-name"
image: "/path/to/og-image.jpg"  # optional
---
```

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

## Known Gotchas

- **Case studies are temporarily disabled** — `/case-studies` redirects to home (via `next.config.js`). Links are commented out in `components/nav.tsx` and `components/footer.tsx`, and the route is removed from `app/sitemap.ts`.
- **Async params in Next.js 15+** — `params` and `searchParams` must be awaited in page components. See the article `fixing-broken-routes-after-nextjs-16-upgrade.mdx` for full context.
- **Client vs Server Components** — Components with `'use client';` cannot export `metadata`. Use a wrapping `layout.tsx` (Server Component) to handle metadata for Client Component pages (e.g., `app/portfolio/layout.tsx`).
- **Contact form backend is TBD** — `components/ContactForm.tsx` exists but the API route/service handling submissions has not yet been implemented.
- **Node.js >= 22 required** — `camera-controls` (dependency of `@react-three/drei`) requires Node 22+. This is enforced in `package.json` engines field and `.nvmrc`.

## Related Docs

- [Repo Technical Reference](../repos/coffey-codes.md)
- [Development Standards](../development-standards.md)
- [On-Page SEO Strategy](../deep-dives/onpage-seo-strategy.md)
