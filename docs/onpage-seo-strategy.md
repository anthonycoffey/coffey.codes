# On-Page SEO Metadata Strategy (coffey.codes)

This document outlines the strategy used for implementing on-page SEO metadata (primarily page titles and descriptions) for the coffey.codes website, built with Next.js 15+.

## Core Principles

- **Consistency:** Maintain a consistent structure and branding across all page titles.
- **Relevance:** Ensure titles and descriptions accurately reflect the specific content of each page.
- **Clarity:** Provide clear and concise information for both search engines and users.
- **Technology:** Leverage the Next.js Metadata API for implementation.

## Implementation Details

### 1. Mechanism: Next.js Metadata API

- Metadata is defined by exporting a `metadata` object or a `generateMetadata` function from `page.tsx` or `layout.tsx` files.
- These files **must** be React Server Components. Client Components (`'use client';`) cannot export metadata directly.

### 2. Title Strategy (Revised April 19, 2025)

- **Format:** `[Page Specifics] | Senior Solutions Architect & AI Specialist | Anthony Coffey`
- **Rationale:**
    - Provides specific context about the page content at the beginning.
    - Includes the core professional title ("Senior Solutions Architect & AI Specialist") for keyword relevance and clarity for target audiences (clients and employers).
    - Includes consistent branding ("Anthony Coffey") at the end.

### 3. Description Strategy

- Descriptions are tailored to each specific page or page type.
- They aim to summarize the page's core content and value proposition concisely.
- Keywords relevant to the page content are included naturally where appropriate.

### 4. Implementation by Page Type

- **Static Pages (e.g., Home, Contact, Case Studies Index):**
    - Files: `app/page.tsx`, `app/contact/page.tsx`, `app/case-studies/page.tsx`
    - Method: Export a static `metadata` object with predefined `title` and `description`.
    - Example Title (Home): `Reliable, Scalable Software Solutions | Senior Solutions Architect & AI Specialist | Anthony Coffey`
    - Example Description (Home): `Partner with Anthony Coffey, a Senior Solutions Architect & AI Specialist, for reliable, production-ready software. Leverage 12+ years of expertise for scalable web/mobile apps and practical AI integration.`

- **Section Layouts (Handling Client Component Pages like Portfolio):**
    - Files: `app/portfolio/layout.tsx` (Server Component) wrapping `app/portfolio/page.tsx` (Client Component).
    - Method: The `metadata` object is exported from the Server Component `layout.tsx`. This applies to all pages within that section that use the layout.
    - Example Title (Portfolio): `Portfolio | Senior Solutions Architect & AI Specialist | Anthony Coffey`
    - Example Description (Portfolio): `Explore a selection of software development projects by Anthony Coffey, showcasing expertise in web applications, AI integration, and more.`

- **Dynamic Index Pages (e.g., Categories Index, Tags Index):**
    - Files: `app/articles/categories/page.tsx`, `app/articles/tags/page.tsx`
    - Method: Use `generateMetadata` function (though content is static for these index pages) to define `title` and `description`.
    - Example Title (Categories): `All Article Categories | Senior Solutions Architect & AI Specialist | Anthony Coffey`
    - Example Description (Categories): `Browse articles by category on topics like software engineering, AI, cloud computing, and web development from Anthony Coffey.`

- **Dynamic Detail Pages (e.g., Individual Category/Tag):**
    - Files: `app/articles/category/[category]/page.tsx`, `app/articles/tag/[tag]/page.tsx`
    - Method: Use `generateMetadata` function which receives `params` (the specific category/tag). The function dynamically constructs the `title` and `description` using the param value.
    - Example Title (Category): `Articles in Category: [Category Name] | Senior Solutions Architect & AI Specialist | Anthony Coffey`
    - Example Description (Category): `Explore software development articles by Anthony Coffey categorized under "[Category Name]". Find insights on relevant topics.`

- **Individual Article Pages:**
    - File: `app/articles/[slug]/page.tsx`
    - Method: Use `generateMetadata` function receiving the article `slug`.
    - Title Source: Takes `title` from MDX frontmatter (stored as `postTitle`) and constructs the final `title` as `[postTitle] | Senior Solutions Architect & AI Specialist | Anthony Coffey`.
    - Description Source: Directly uses the `summary` field from MDX frontmatter.
    - Open Graph/Twitter: Also dynamically generated using the constructed `title`, frontmatter `summary`, and optional `image`.

- **Landing Pages (ICP-Specific):**
    - Files: `app/lp/practical-ai/page.tsx`, `app/lp/smb-web-marketing/page.tsx`, etc.
    - Method: Each landing page exports its own static `metadata` object.
    - Content: Titles and descriptions are highly tailored to the specific Ideal Customer Profile (ICP) and Unique Value Proposition (UVP) of the page.
    - Title Format: `[LP Specific Title] | Senior Solutions Architect & AI Specialist | Anthony Coffey` is maintained.
    - Example Title (Practical AI): `Practical AI Solutions for Business Growth | Senior Solutions Architect & AI Specialist | Anthony Coffey`
    - Example Description (Practical AI): `Move beyond AI hype. Get production-ready, scalable AI solutions integrated with your business for tangible results.`

## Summary

This strategy provides a robust and flexible approach to on-page SEO metadata, ensuring relevance, consistency, and adherence to Next.js best practices across the entire website.
