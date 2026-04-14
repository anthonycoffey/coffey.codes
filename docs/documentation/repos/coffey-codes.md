# coffey.codes — Technical Reference

**Repo:** https://github.com/anthonycoffey/coffey.codes  
**Deployment:** Vercel (auto-deploys from `master`)  
**Last updated:** 2026-04-13

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
│   ├── case-studies/           # TEMPORARILY DISABLED (redirects to /)
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

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js App Router (canary) | Hybrid SSR/SSG |
| Language | TypeScript | Strict mode |
| UI | React | Server + Client Components |
| Styling | Tailwind CSS v4 | `darkMode: 'class'` |
| Global styles | SASS | `styles/global.sass` |
| Theming | next-themes | System preference only |
| Content | next-mdx-remote + sugar-high | MDX blog posts |
| 3D | @react-three/fiber + drei | Homepage scenes |
| Animation | motion | UI animations |
| Icons | @heroicons/react | |
| Package Manager | Bun | `bun.lockb` |
| Hosting | Vercel | Auto-deploy from `master` |
| Analytics | Google Tag Manager | GTM-KJC6Q389 |

## Key Technical Decisions

### Next.js App Router
Chosen for hybrid SSR/SSG, React Server Components, and integrated features (image optimization, API routes, OG image generation).

### TypeScript
Strict typing for code quality and maintainability across the codebase.

### Tailwind CSS
Utility-first CSS for rapid development. Complemented by SASS for global styles.

### MDX for Blog Content
Allows JSX components within markdown, enabling rich interactive blog posts. Processed by `next-mdx-remote`.

### Bun as Package Manager
Faster than npm/yarn. Lock file is `bun.lockb`.

### System-Preference Theming Only
Manual theme toggle was removed (April 2025) due to persistent issues with dynamic style updates. The site now relies solely on `next-themes` with `enableSystem`.

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
bun install         # Install dependencies (requires Node >= 22)
bun dev             # Dev server at http://localhost:3000
bun build           # Production build
bun start           # Run production build locally
bun lint            # ESLint
bun lint:fix        # ESLint auto-fix
```

**Deployment:** Push to `master` → Vercel auto-deploys.

## Known Issues / Pending Work

| Item | Status | Notes |
|------|--------|-------|
| Contact form backend | Not implemented | `ContactForm.tsx` exists, API route TBD (Resend/Formspree/custom) |
| Social links in footer | Not added | GitHub/LinkedIn links missing from `components/footer.tsx` |
| Case studies section | Temporarily disabled | Redirects to `/`, links commented out in nav/footer |
| Testing | No framework | No tests currently; TDD approach to be adopted for new features |

## Version Control

- **Strategy:** Trunk-based. Feature branches from `master`, short-lived, deleted after merge.
- **Branch naming:** `feature/`, `fix/`, `chore/`, `refactor/`
- **Deployment branch:** `master` (protected, auto-deploys to Vercel)

See [Development Standards](../development-standards.md) for full conventions.
