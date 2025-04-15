# Project Progress

*This file tracks the overall status of the project, what works, what's left, known issues, and the evolution of decisions.*

## Current Status

The project is substantially built out and actively maintained. Core sections (Blog, Portfolio, Contact) and key features (MDX rendering, Search, Categories/Tags, RSS, OG Images) are implemented using Next.js App Router and Bun. The primary focus shifts between content creation and feature refinement/addition. Deployment to Vercel is automated from the `master` branch.

## What Works

*(Based on file structure and Memory Bank context)*
- **Framework/Routing:** Next.js App Router structure is in place for major sections (Home, Articles, Portfolio, Case Studies, Contact).
- **Blog:**
    - MDX post rendering (`app/articles/[slug]/page.tsx`, `components/mdx.tsx`).
    - Article listing (`app/articles/page.tsx`, `components/posts.tsx`).
    - Category and Tag pages (`app/articles/category/[category]/page.tsx`, `app/articles/tag/[tag]/page.tsx`).
    - Article Search API (`app/api/search/route.ts`) and UI (`components/SearchBox.tsx`, `app/articles/search/page.tsx`).
    - RSS Feed (`app/rss/route.ts`).
- **Portfolio/Case Studies:** Sections exist (`app/portfolio/`, `app/case-studies/`). Content structure seems present (e.g., `public/portfolio/`, `public/case-studies/`).
- **Contact:** Contact page (`app/contact/page.tsx`) and form component (`components/ContactForm.tsx`) exist. (Backend handling is TBD - see "What's Left").
- **Styling:** Tailwind CSS and SASS (`styles/global.sass`) are set up.
- **Package Manager:** Bun is used (`bun.lockb`).
- **Components:** A library of reusable components exists in `components/`.
- **SEO Basics:** `robots.ts`, `sitemap.ts`, `og/route.tsx` suggest basic SEO considerations.
- **3D Elements:** Integration with React Three Fiber (`components/ThreeScene.tsx`, `components/FishbowlScene.tsx`).
- **Deployment:** Automated deployment via Vercel from `master` branch.

## What's Left to Build

*(Based on current state and `activeContext.md`)*
1.  **Implement Contact Form Backend:** Decide on and implement the handling mechanism for `components/ContactForm.tsx` (API route vs. third-party).
2.  **Add Social Links:** Integrate social media profile links (GitHub, LinkedIn, etc.) into `components/footer.tsx`.
3.  **Content Population:** Continue writing blog articles (`app/articles/posts/`) and ensure portfolio/case study content is current.
4.  **Testing:** Define and implement a testing strategy (currently none).
5.  **Refinement:** Ongoing UI/UX polishing, performance optimization, accessibility checks, cross-browser testing.
6.  **Documentation:** Continue maintaining Memory Bank; add component-level documentation if needed.

## Known Issues / Bugs

*(To be identified through testing or user feedback)*
- None reported currently.

## Evolution of Decisions

*(To be documented as the project progresses)*
- *(Initial):* Project likely started or migrated to Next.js App Router.
- *(Initial):* Chose MDX for blog content flexibility.
- *(Initial):* Adopted Tailwind CSS for styling.
- *(Date TBD):* Switched package manager to Bun.
