<div align="center">

# 👨‍💻 coffey.codes

**A high-performance, 3D-integrated portfolio and blog built for speed, SEO, and top-tier developer experience.**

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-Black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![MIT License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](#license)

</div>

---

## ✨ Features

This repository is more than just a personal website—it is a playground for bleeding-edge web technologies, meticulous software architecture, and immersive 3D web experiences.

- ⚡ **Extreme Performance:** Optimized for small bundles, rapid compile times, and scored with Vercel Speed Insights & Web Analytics.
- 🎨 **Immersive 3D & Animation:** Powered by `@react-three/fiber`, `@react-three/postprocessing`, `gsap`, and `motion` for fluid, interactive visuals.
- 📝 **Modern Content Pipeline:** Full MDX and Markdown support for blogging, with beautiful syntax highlighting powered by `sugar-high`.
- 🔍 **Technical SEO:** Fully automated sitemaps, `robots.txt`, JSON-LD schema generation, and dynamic OpenGraph (OG) images.
- 💅 **Styling & Typography:** Styled with Tailwind CSS, utilizing the sleek, highly-legible Geist font.
- 🧪 **Enterprise Testing:** Comprehensive testing suite featuring Vitest for unit tests and Playwright for E2E.

---

## 🚀 Quick Start

Want to run the codebase locally? Follow these steps:

### Prerequisites

- Node.js `>=24.0.0`
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/anthonycoffey/coffey.codes.git

# Navigate into the project
cd coffey.codes

# Install dependencies
npm install
```

### Development Commands

| Command             | Action                                                         |
| ------------------- | -------------------------------------------------------------- |
| `npm run dev`       | Starts the local development server at `http://localhost:3000` |
| `npm run build`     | Builds the application for production                          |
| `npm run lint`      | Runs ESLint across the codebase                                |
| `npm run test`      | Executes unit tests via Vitest                                 |
| `npm run test:e2e`  | Runs End-to-End tests via Playwright                           |
| `npm run typecheck` | Runs TypeScript compiler checks                                |

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
npm install         # Install dependencies (requires Node >= 22)
npm dev             # Dev server at http://localhost:3000
npm build           # Production build
npm start           # Run production build locally
npm lint            # ESLint
npm lint:fix        # ESLint auto-fix
```

## 👨‍💻 Author

**Anthony Coffey**

- 🌐 [coffey.codes](https://coffey.codes)
- 🐙 [GitHub](https://github.com/anthonycoffey)

---

## 📜 License

This project is licensed under the [MIT License](./LICENSE) - see the LICENSE file for details.
