# System Patterns

*This file documents the system architecture, key technical decisions, design patterns, and component relationships.*

## Architecture Overview

The project utilizes the **Next.js App Router** architecture. This means:
- **Server-Centric Routing:** File-system based routing within the `app/` directory.
- **React Server Components (RSCs):** Components render primarily on the server by default, reducing client-side JavaScript.
- **Client Components:** Interactive UI elements opt-in to client-side rendering using the `'use client';` directive (e.g., `components/SearchBox.tsx`).
- **API Routes:** Backend functionality is handled via API routes within `app/api/`.
- **Layouts:** Shared UI structures are defined using `layout.tsx` files (e.g., `app/layout.tsx`, `app/articles/layout.tsx`).

## Key Technical Decisions

*(List significant technical choices made and the reasoning behind them.)*
- **Framework: Next.js (App Router):** Chosen for its hybrid server/client rendering capabilities, performance optimizations (RSCs), file-based routing, and integrated features like API routes and image optimization.
- **Language: TypeScript:** Provides static typing for improved code quality, maintainability, and developer experience.
- **Styling: Tailwind CSS:** Utility-first CSS framework for rapid UI development and consistent styling. Complemented by SASS (`styles/global.sass`) for global styles.
- **Content: MDX:** Allows writing JSX within Markdown files (`app/articles/posts/`), enabling rich content experiences for blog posts, processed by `next-mdx-remote`.
- **Package Manager: Yarn:** Explicitly defined in `package.json`.

## Design Patterns

*(Document recurring design patterns used throughout the codebase.)*
- **React Server Components (RSC) vs. Client Components:** Core pattern of the App Router. Server Components for static content and data fetching, Client Components (`'use client';`) for interactivity (state, effects, browser APIs).
- **File-System Based Routing:** Defining routes by creating folders and `page.tsx` files within the `app/` directory. Dynamic routes use bracket notation (e.g., `app/articles/[slug]/page.tsx`).
- **Layout Components:** Using `layout.tsx` to define shared UI shells that persist across route changes.
- **Utility Functions:** Grouping reusable logic (e.g., date formatting in `utils/date.ts`).
- **Component Composition:** Building complex UIs by combining smaller, reusable components (located in `components/`).
- **API Route Handlers:** Defining server-side API endpoints within the `app/api/` directory (e.g., `app/api/search/route.ts`).

## Component Relationships

- **`app/layout.tsx`:** Root layout, likely wraps all pages, includes global elements like `components/nav.tsx` and `components/footer.tsx`.
- **Page Components (`page.tsx`):** Define the main content for specific routes. Often fetch data and pass it to child components.
- **Layout Components (`layout.tsx`):** Wrap page components to provide section-specific layouts (e.g., `app/articles/layout.tsx`).
- **Reusable UI Components (`components/`):** Used across various pages and layouts (e.g., `SearchBox`, `Chip`, `Posts`). Some are Client Components (`'use client';`), others are Server Components.
- **API Routes (`app/api/`):** Provide data or perform actions requested by Client Components (e.g., `SearchBox` calls `/api/search`).
- **MDX Content (`app/articles/posts/`):** Rendered within specific page components (e.g., `app/articles/[slug]/page.tsx`) likely using `next-mdx-remote` and custom components defined in `components/mdx.tsx`.

## Critical Implementation Paths

*(Highlight key workflows or data flows within the system.)*
- **Blog Post Rendering:**
  - Request hits `app/articles/[slug]/page.tsx`.
  - Page component fetches MDX content based on `slug`.
  - MDX content is processed (likely by `next-mdx-remote`).
  - Content is rendered using components from `components/mdx.tsx`.
- **Article Search:**
  - User types in `components/SearchBox.tsx` (Client Component).
  - `useEffect` hook debounces input and fetches results from `/api/search?q=...`.
  - `app/api/search/route.ts` handles the request, likely utilizing a shared function (e.g., `getAllBlogPosts` mentioned for sitemap/RSS) to retrieve and filter post metadata, returning JSON.
  - `SearchBox` displays results or navigates to `app/articles/search/page.tsx` for full results.
- **Contact Form Submission:**
  - User fills form in `components/ContactForm.tsx` (Client Component).
  - The specific backend handling mechanism (API route, third-party service) is not currently defined in the Memory Bank.
