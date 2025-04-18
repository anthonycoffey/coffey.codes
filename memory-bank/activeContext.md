# Active Context

*This file tracks the current work focus, recent changes, next steps, active decisions, important patterns, and project insights. It's the most frequently updated file.*

## Current Focus

Troubleshooting the theme switcher revealed persistent issues with dynamically updating styles via the button. The decision has been made to remove the manual theme switcher component and rely solely on the user's system preference for light/dark mode, which was already functioning correctly via `next-themes` and `enableSystem`. Focus now returns to the previously defined next steps, primarily implementing the contact form backend.

## Recent Changes

*(Summarize the most recent significant updates or commits.)*
- **April 17, 2025 (Later - Theme Switcher Removal):**
    - Removed the manual `ThemeSwitcher` component (`components/ThemeSwitcher.tsx`) due to persistent issues with dynamic style updates when using the button.
    - Removed `ThemeSwitcher` usage from `components/nav.tsx`.
    - The site now relies solely on the user's system preference for light/dark mode, managed by `next-themes` with the `enableSystem` prop in `app/layout.tsx`.
    - Reverted `app/layout.tsx` theme class placement back to the `<body>` tag.
    - Reverted `styles/global.sass` to use `@use "tailwindcss";`.
    - Corrected `postcss.config.js` to use `@tailwindcss/postcss`.
- **April 17, 2025 (Earlier - Landing Pages):**
    - Created four new landing pages in `app/lp/` directory, targeting specific ICPs:
        - `app/lp/sme-web-mobile/page.tsx` (Established SMEs - Web/Mobile)
        - `app/lp/practical-ai/page.tsx` (Forward-Thinking Businesses - AI)
        - `app/lp/smb-web-marketing/page.tsx` (SMBs - Web/Marketing Tech)
        - `app/lp/strategic-partners/page.tsx` (Strategic Partners - Specialized Expertise)
    - Each page includes the relevant UVP, `ContactForm` component, and a call-to-action for scheduling a strategy call.
    - Referenced `docs/marketing/uvp.md` to extract ICPs and tailor content.
    - Fixed minor ESLint issues in the new files.
- **April 16, 2025 (Later):**
    - Created new article: `app/articles/posts/slow-android-emulator-flutter-dev.mdx`.
    - Created new component: `components/Callout.tsx` with different types and icons.
    - Updated `components/mdx.tsx` to include the `Callout` component for use in MDX files.
- **April 16, 2025 (Earlier):** Installed Google Tag Manager (GTM ID: GTM-KJC6Q389) into `app/layout.tsx` using `next/script`.
- **April 7, 2025:** Initiated Memory Bank update process.
    - Read all core Memory Bank files (`projectbrief.md`, `productContext.md`, `systemPatterns.md`, `techContext.md`, `activeContext.md`, `progress.md`).
    - Corrected package manager reference from Yarn to Bun in `systemPatterns.md`.
    - Updated this `activeContext.md` file.
- *(Previous - Date/Commit ID TBD):* Implementation of taxonomy (categories/tags) and search features.

## Immediate Next Steps

*(What are the very next actions to be taken *after* this Memory Bank update is complete?)*
1.  **Implement Contact Form Backend:** Decide on and implement the mechanism for handling submissions from `components/ContactForm.tsx` (e.g., using a Vercel Serverless Function/API route, or a third-party service like Resend/Formspree).
2.  **Add Social Links:** Integrate social media profile links (e.g., GitHub, LinkedIn) into the site footer (`components/footer.tsx`), as noted as missing in `productContext.md`.
3.  **Content Creation/Population:**
    - Write and publish new blog articles (`app/articles/posts/`).
    - Ensure portfolio (`app/portfolio/`) and case study (`app/case-studies/`) sections are populated with current content.
4.  **Review & Refine:** Perform UI/UX polishing and potentially add tests.

## Active Decisions & Considerations

*(Document any ongoing discussions, decisions being weighed, or important considerations for the current work.)*
- **Decision Point 1:** Determine the best approach for the contact form backend (API route vs. third-party service). Consider ease of implementation, cost, and reliability.
- **Consideration 1:** Prioritize the "Immediate Next Steps" based on user preference or project goals.

## Important Patterns & Preferences

*(Note any specific coding patterns, style preferences, or conventions relevant to the current work that might not be in systemPatterns.md yet.)*
- **Memory Bank Maintenance:** Adhering to the `.clinerules` process for reading and updating the Memory Bank is a critical operational pattern for this project.
- **Component Structure:** Continue leveraging reusable components in `components/`, distinguishing between Server and Client components (`'use client';`) as appropriate.

## Learnings & Insights

*(Capture any new learnings, discoveries, or insights gained during the recent work.)*
- **Marketing-Driven Development:** Successfully utilized marketing documentation (`docs/marketing/uvp.md`) to directly inform the creation of targeted landing pages, demonstrating the link between strategy and implementation.
- **Synchronization:** The Memory Bank update process highlighted the importance of keeping documentation synchronized with the actual codebase (e.g., correcting the package manager reference). Regular updates are crucial for accuracy.
- **Clarity:** Explicitly defining next steps and decisions in `activeContext.md` helps maintain focus and track progress effectively.
