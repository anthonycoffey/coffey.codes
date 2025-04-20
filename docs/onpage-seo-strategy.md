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

### 2. Title Strategy (Revised April 19, 2025 - Second Revision)

- **Standard Format (Most Pages):** `[Page Specifics] | Anthony Coffey - Solutions Architect, AI/ML`
    - **Rationale:** Provides specific page context first, followed by brand name and professional title. Balances SEO best practices with branding and keyword inclusion, while optimizing for length (~60 char target).
    - **Professional Title:** "Solutions Architect, AI/ML" chosen for conciseness and relevance.
- **Article Format (`app/articles/[slug]/page.tsx` only):** `[Article Title] | Anthony Coffey`
    - **Rationale:** Prioritizes the unique article title to minimize truncation in search results for potentially long titles. Ensures brand name is present.

### 3. Description Strategy

- Descriptions are tailored to each specific page or page type.
- They aim to summarize the page's core content and value proposition concisely.
- Keywords relevant to the page content (including "Solutions Architect", "AI/ML Specialist" where appropriate) are included naturally.

### 4. Implementation by Page Type

- **Static Pages (e.g., Home, Contact, Case Studies Index):**
    - Files: `app/page.tsx`, `app/contact/page.tsx`, `app/case-studies/page.tsx`
    - Method: Export a static `metadata` object with predefined `title` (using standard format, except for Home) and `description`.
    - Example Title (Home): `Anthony Coffey | Solutions Architect & AI/ML Specialist` (Note: Homepage uses Name | Title format as per specific request)
    - Example Description (Home): `Partner with Anthony Coffey, Solutions Architect & AI/ML Specialist, for reliable, production-ready software. Leverage 12+ years of expertise for scalable web/mobile apps and practical AI/ML integration.`

- **Section Layouts (Handling Client Component Pages like Portfolio):**
    - Files: `app/portfolio/layout.tsx` (Server Component) wrapping `app/portfolio/page.tsx` (Client Component).
    - Method: The `metadata` object is exported from the Server Component `layout.tsx` using the standard format.
    - Example Title (Portfolio): `Portfolio | Anthony Coffey - Solutions Architect, AI/ML`
    - Example Description (Portfolio): `Explore a selection of software development projects by Anthony Coffey, Solutions Architect & AI/ML Specialist, showcasing expertise in web applications, AI/ML integration, and more.`

- **Dynamic Index Pages (e.g., Categories Index, Tags Index):**
    - Files: `app/articles/categories/page.tsx`, `app/articles/tags/page.tsx`
    - Method: Use `generateMetadata` function to define `title` (using standard format) and `description`.
    - Example Title (Categories): `All Article Categories | Anthony Coffey - Solutions Architect, AI/ML`
    - Example Description (Categories): `Browse articles by category on topics like software engineering, AI/ML, cloud computing, and web development from Anthony Coffey.`

- **Dynamic Detail Pages (e.g., Individual Category/Tag):**
    - Files: `app/articles/category/[category]/page.tsx`, `app/articles/tag/[tag]/page.tsx`
    - Method: Use `generateMetadata` function which receives `params`. Dynamically constructs the `title` using the standard format and the param value.
    - Example Title (Category): `Articles in Category: [Category Name] | Anthony Coffey - Solutions Architect, AI/ML`
    - Example Description (Category): `Explore software development articles by Anthony Coffey, Solutions Architect & AI/ML Specialist, categorized under "[Category Name]". Find insights on relevant topics.`

- **Individual Article Pages:**
    - File: `app/articles/[slug]/page.tsx`
    - Method: Use `generateMetadata` function receiving the article `slug`.
    - Title Source: Uses the **article format**: `[Article Title] | Anthony Coffey`. Takes `title` from MDX frontmatter (stored as `postTitle`) and constructs the final `title`.
    - Description Source: Directly uses the `summary` field from MDX frontmatter.
    - Open Graph/Twitter: Also dynamically generated using the constructed `title`, frontmatter `summary`, and optional `image`.

- **Landing Pages (ICP-Specific):**
    - Files: `app/lp/practical-ai/page.tsx`, `app/lp/smb-web-marketing/page.tsx`, etc.
    - Method: Each landing page exports its own static `metadata` object.
    - Content: Titles and descriptions are highly tailored to the specific Ideal Customer Profile (ICP) and Unique Value Proposition (UVP) of the page.
    - Title Format: Uses the **standard format**: `[LP Specific Title] | Anthony Coffey - Solutions Architect, AI/ML`.
    - Example Title (Practical AI): `Practical AI Solutions for Business Growth | Anthony Coffey - Solutions Architect, AI/ML`
    - Example Description (Practical AI): `Move beyond AI hype with Anthony Coffey, Solutions Architect & AI/ML Specialist. Get production-ready, scalable AI/ML solutions integrated with your business for tangible results.`

## Summary

This strategy provides a robust and flexible approach to on-page SEO metadata, ensuring relevance, consistency, and adherence to Next.js best practices across the entire website.
